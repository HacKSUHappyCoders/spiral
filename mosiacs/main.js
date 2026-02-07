/**
 * Main application entry point
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Clear all cached code files on page load to start fresh
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('code_')) {
            localStorage.removeItem(key);
        }
    });

    const canvas = document.getElementById('renderCanvas');
    const visualizer = new CodeVisualizer(canvas);
    
    // Initialize the visualizer
    visualizer.init();

    // Make static panels draggable
    makeDraggable(document.getElementById('controls'), document.getElementById('controls-handle'));
    makeDraggable(document.getElementById('info'), document.querySelector('#info > strong'));

    const codeFileList = document.getElementById('codeFileList');

    // Populate code files dropdown dynamically
    function populateCodeFiles() {
        fetch('/api/codefiles')
            .then(r => r.json())
            .then(files => {
                codeFileList.innerHTML = '';
                files.forEach(f => {
                    const item = document.createElement('div');
                    item.className = 'code-file-item';
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.value = f;
                    checkbox.id = `file-${f}`;
                    
                    const label = document.createElement('label');
                    label.className = 'file-name';
                    label.htmlFor = `file-${f}`;
                    label.textContent = f;
                    
                    const editIcon = document.createElement('span');
                    editIcon.className = 'edit-icon';
                    editIcon.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>`;
                    editIcon.title = 'Edit file';
                    editIcon.addEventListener('click', (e) => {
                        e.stopPropagation();
                        loadAndEditFile(f);
                    });
                    
                    item.appendChild(checkbox);
                    item.appendChild(label);
                    item.appendChild(editIcon);
                    codeFileList.appendChild(item);
                });
            })
            .catch(err => {
                console.error('Failed to load code file list:', err);
            });
    }

    // Load a file and open it in the code editor
    function loadAndEditFile(filename) {
        // Check localStorage first
        const cachedCode = localStorage.getItem(`code_${filename}`);
        if (cachedCode) {
            // Use cached version from localStorage
            visualizer.setSourceCode(cachedCode);
            visualizer.parser.metadata = { file_name: filename };
            visualizer._buildCodePanel(cachedCode);
            return;
        }
        
        // Fetch the file content from the server with cache busting
        fetch(`/data/${filename}?t=${Date.now()}`)
            .then(r => {
                if (!r.ok) throw new Error(`Failed to load ${filename}`);
                return r.text();
            })
            .then(code => {
                // Save to localStorage for this session
                try {
                    localStorage.setItem(`code_${filename}`, code);
                } catch (err) {
                    console.error('Failed to cache file in localStorage:', err);
                }
                
                // Set the source code and show the editor
                visualizer.setSourceCode(code);
                // Manually create metadata for the editor
                visualizer.parser.metadata = { file_name: filename };
                visualizer._buildCodePanel(code);
            })
            .catch(err => {
                alert(`Failed to load file: ${err.message}`);
            });
    }

    // Initialize code files list
    populateCodeFiles();

    // Load selected code files button — processes selected code files
    document.getElementById('loadSelected').addEventListener('click', async () => {
        const checkboxes = document.querySelectorAll('#codeFileList input[type="checkbox"]:checked');
        const selectedFiles = Array.from(checkboxes).map(cb => cb.value);

        if (selectedFiles.length === 0) {
            alert('Please select one or more code files');
            return;
        }

        const loadBtn = document.getElementById('loadSelected');
        loadBtn.disabled = true;
        loadBtn.textContent = 'Processing...';

        try {
            const results = [];
            const errors = [];

            // Process each file, checking localStorage first
            for (const filename of selectedFiles) {
                const cachedCode = localStorage.getItem(`code_${filename}`);
                
                if (cachedCode) {
                    // Use cached version from localStorage
                    const blob = new Blob([cachedCode], { type: 'text/plain' });
                    const file = new File([blob], filename);
                    const formData = new FormData();
                    formData.append('file', file);

                    try {
                        const response = await fetch('/api/process-file', { method: 'POST', body: formData });
                        const json = await response.json();
                        
                        if (json.success !== false) {
                            results.push({ file: filename, data: json });
                        } else {
                            errors.push({ file: filename, stage: 'processing', message: json.error?.message || 'Unknown error' });
                        }
                    } catch (err) {
                        errors.push({ file: filename, stage: 'processing', message: err.message });
                    }
                } else {
                    // No cached version, use backend file
                    try {
                        const response = await fetch('/api/process', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ files: [filename] })
                        });
                        const data = await response.json();
                        
                        if (data.success && data.results && data.results.length > 0) {
                            results.push({ file: filename, data: data.results[0].data });
                        } else if (data.errors && data.errors.length > 0) {
                            errors.push(data.errors[0]);
                        }
                    } catch (err) {
                        errors.push({ file: filename, stage: 'processing', message: err.message });
                    }
                }
            }

            // Show results
            if (results.length > 0) {
                const resultMsg = `Successfully processed ${results.length} file(s)`;
                
                if (errors.length > 0) {
                    const errorDetails = errors.map(e => 
                        `  • ${e.file}: [${e.stage}] ${e.message}`
                    ).join('\n');
                    alert(`${resultMsg}\n\nErrors:\n${errorDetails}`);
                } else {
                    console.log(resultMsg);
                }

                // Visualize the first successful result
                visualizer.setSourceCode(null);
                visualizer.visualize(results[0].data);
            } else {
                // All files failed
                const errorDetails = errors.map(e => 
                    `  • ${e.file}: [${e.stage}] ${e.message}`
                ).join('\n');
                alert(`Processing failed:\n\n${errorDetails}`);
            }
        } catch (err) {
            alert('Processing failed: ' + err.message);
        } finally {
            loadBtn.disabled = false;
            loadBtn.textContent = 'Load Selected';
        }
    });

    // Reset camera button
    document.getElementById('resetCamera').addEventListener('click', () => {
        visualizer.resetCamera();
    });

    // Return from galaxy warp button
    document.getElementById('returnToMainGalaxy').addEventListener('click', () => {
        const returned = visualizer.returnFromGalaxy();
        if (!returned) {
            console.log('Not currently in a galaxy.');
        }
    });

    // Toggle info panel button
    const infoPanel = document.getElementById('info');
    const infoBtn = document.getElementById('toggleInfo');
    infoBtn.addEventListener('click', () => {
        const visible = infoPanel.style.display !== 'none';
        infoPanel.style.display = visible ? 'none' : '';
        infoBtn.textContent = visible ? 'Show Controls' : 'Hide Controls';
    });

    // Toggle animation button
    const toggleBtn = document.getElementById('toggleAnimation');
    toggleBtn.addEventListener('click', () => {
        const isAnimating = visualizer.toggleAnimation();
        toggleBtn.textContent = isAnimating ? 'Pause Animation' : 'Resume Animation';
    });

    // Toggle causality web button (Phase 3 Part 3)
    const causalityBtn = document.getElementById('toggleCausality');
    causalityBtn.addEventListener('click', () => {
        const isShowing = visualizer.toggleCausality();
        causalityBtn.textContent = isShowing ? '🕸️ Hide Causality Web' : '🕸️ Show Causality Web';
    });

    // Upload file button - opens file dialog
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileUpload');
    
    uploadBtn.addEventListener('click', () => {
        // Trigger the hidden file input
        fileInput.click();
    });

    // Handle file selection
    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (!file) {
            return;
        }
        
        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Processing...';

        // Read source code text and upload in parallel
        Promise.all([file.text(), CodeParser.upload(file)])
            .then(([sourceCode, json]) => {
                if (json.success === false) {
                    const err = json.error || {};
                    alert(`Error (${err.stage || 'unknown'}): ${err.message || 'Unknown error'}`);
                    return;
                }
                visualizer.setSourceCode(sourceCode);
                visualizer.visualize(json);
                
                // Add the uploaded file to the code files list
                const item = document.createElement('div');
                item.className = 'code-file-item';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = file.name;
                checkbox.id = `file-${file.name}`;
                checkbox.checked = true;
                
                const label = document.createElement('label');
                label.className = 'file-name';
                label.htmlFor = `file-${file.name}`;
                label.textContent = file.name;
                
                const editIcon = document.createElement('span');
                editIcon.className = 'edit-icon';
                editIcon.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>`;
                editIcon.title = 'Edit file';
                editIcon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    loadAndEditFile(file.name);
                });
                
                item.appendChild(checkbox);
                item.appendChild(label);
                item.appendChild(editIcon);
                codeFileList.appendChild(item);
                
                // Clear the file input so the same file can be uploaded again
                fileInput.value = '';
            })
            .catch(err => alert('Upload failed: ' + err.message))
            .finally(() => {
                uploadBtn.disabled = false;
                uploadBtn.textContent = 'Upload Code';
            });
    });

    // Toggle panoramic render button (Phase 3 Part 4)
    const panoramicBtn = document.getElementById('togglePanoramic');
    panoramicBtn.addEventListener('click', () => {
        const isActive = visualizer.togglePanoramic();
        panoramicBtn.textContent = isActive ? '🌌 Exit Panoramic' : '🌌 Panoramic Render';
        panoramicBtn.classList.toggle('active', isActive);
    });

    // Toggle memory pool button
    const memoryPoolBtn = document.getElementById('toggleMemoryPool');
    memoryPoolBtn.addEventListener('click', () => {
        const isShowing = visualizer.toggleMemoryPool();
        memoryPoolBtn.textContent = isShowing ? '🌊 Hide Memory Pool' : '🌊 Show Memory Pool';
        memoryPoolBtn.classList.toggle('active', isShowing);
    });

    // Show welcome message
    console.log('🎨 Code Mosaic Visualizer initialized!');
    console.log('Click "Load Example Code" to see the visualization.');
    console.log('Click any building to inspect its data.');
});
