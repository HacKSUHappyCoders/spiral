/**
 * CodeVisualizer — Main orchestrator for the 3D visual debugger.
 *
 * Architecture:
 *   WorldState    – runtime simulation: functions, variables, loops, branches, memory
 *   CityRenderer  – translates world snapshots into Babylon.js meshes
 *   SceneManager  – Babylon.js scene, camera, lights
 *
 * A building represents a persistent runtime concept (function, variable,
 * loop, branch) — NOT a line of code or AST node.
 *
 * The spiral path represents time.  Each trace event advances one step.
 */
class CodeVisualizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.parser = new CodeParser();

        // Managers — initialised in init()
        this.sceneManager = null;
        this.worldState = null;
        this.cityRenderer = null;

        // Explode interaction (click-to-inspect)
        this.explodeManager = null;

        // Source code for the code panel
        this._sourceCode = null;
    }

    /**
     * Initialise Babylon.js and all sub-systems.
     */
    init() {
        // Scene setup
        this.sceneManager = new SceneManager(this.canvas);
        this.sceneManager.init();

        const scene = this.sceneManager.getScene();

        // World state engine
        this.worldState = new WorldState();

        // City renderer — turns world snapshots into 3D geometry
        this.cityRenderer = new CityRenderer(scene);

        // Explode manager for click-to-inspect (pass cityRenderer for sub-spirals)
        this.explodeManager = new ExplodeManager(scene, this.cityRenderer);

        // Wire up node-click → code panel highlight
        this.explodeManager.onNodeSelect = (line) => this.highlightLine(line);

        // Galaxy warp manager — double-click to warp into sub-spiral galaxies
        this.galaxyWarpManager = new GalaxyWarpManager(scene, this.sceneManager, this.cityRenderer);
        this.explodeManager.galaxyWarpManager = this.galaxyWarpManager;

        // Causality web renderer (Phase 3 Part 3)
        this.causalityRenderer = new CausalityRenderer(scene, this.cityRenderer);

        // Panoramic renderer (Phase 3 Part 4) — low-quality total render
        this.panoramicRenderer = new PanoramicRenderer(scene, this.sceneManager, this.cityRenderer);

        // Memory pool renderer — address space underworld
        this.memoryPoolRenderer = new MemoryPoolRenderer(scene, this.cityRenderer);

        return this;
    }

    /**
     * Load and visualise a code trace.
     */
    visualize(codeTrace) {
        // Clear previous city and code panel
        this.cityRenderer.clear();
        this._removeCodePanel();

        // Clear any active galaxy warp
        if (this.galaxyWarpManager) {
            this.galaxyWarpManager.clear();
        }

        // Clear causality web
        if (this.causalityRenderer) {
            this.causalityRenderer.clear();
        }

        // Clear panoramic render
        if (this.panoramicRenderer) {
            this.panoramicRenderer.clear();
        }

        // Clear memory pool
        if (this.memoryPoolRenderer) {
            this.memoryPoolRenderer.clear();
        }

        // Parse the trace
        const trace = this.parser.parse(codeTrace);

        // Feed into world state
        this.worldState.loadTrace(trace);

        // Advance to the end so the full city is visible
        this.worldState.seekTo(trace.length - 1);

        // Block material dirty notifications during bulk mesh creation
        // (major perf win for large traces)
        const scene = this.sceneManager.getScene();
        scene.blockMaterialDirtyMechanism = true;

        // Render the current world state
        this.cityRenderer.render(this.worldState.getSnapshot());

        // Re-enable material updates
        scene.blockMaterialDirtyMechanism = false;

        // Reset camera to a good overview position based on spiral size
        this.sceneManager.resetCamera(this.cityRenderer.getSpiralRadius());

        // Update stats
        this._updateStats(trace.length);

        // Build code panel if source code is available
        if (this._sourceCode) {
            this._buildCodePanel(this._sourceCode);
        }
    }

    // ─── Camera ────────────────────────────────────────────────────

    resetCamera() {
        this.sceneManager.resetCamera(this.cityRenderer.getSpiralRadius());
    }

    // ─── Explode ───────────────────────────────────────────────────

    collapseExplodedBuilding() {
        return this.explodeManager.collapseIfExploded();
    }

    // ─── Galaxy Warp ───────────────────────────────────────────────

    returnFromGalaxy() {
        if (this.galaxyWarpManager && this.galaxyWarpManager.isWarped()) {
            this.galaxyWarpManager.returnToMainGalaxy(true);
            return true;
        }
        return false;
    }

    isInGalaxy() {
        return this.galaxyWarpManager && this.galaxyWarpManager.isWarped();
    }

    // ─── Animation toggle ──────────────────────────────────────────

    toggleAnimation() {
        const scene = this.sceneManager.getScene();
        scene.animationsEnabled = !scene.animationsEnabled;
        return scene.animationsEnabled;
    }

    // ─── Causality web (Phase 3 Part 3) ────────────────────────────

    toggleCausality() {
        const result = this.causalityRenderer.toggle();
        
        // Phase 4: Also toggle causality within bubbles
        if (this.cityRenderer && this.cityRenderer.loopBubbleRenderer) {
            this.cityRenderer.loopBubbleRenderer.setCausalityVisible(result);
        }
        
        return result;
    }

    isCausalityVisible() {
        return this.causalityRenderer.isVisible();
    }

    // ─── Panoramic render (Phase 3 Part 4) ─────────────────────────

    togglePanoramic() {
        return this.panoramicRenderer.toggle();
    }

    isPanoramicActive() {
        return this.panoramicRenderer.isActive();
    }

    // ─── Memory Pool ─────────────────────────────────────────────

    toggleMemoryPool() {
        return this.memoryPoolRenderer.toggle();
    }

    isMemoryPoolVisible() {
        return this.memoryPoolRenderer.isVisible();
    }

    // ─── UI helpers ────────────────────────────────────────────────

    _updateStats(count) {
        const el = document.getElementById('stats');
        if (!el) return;

        let html = `<strong>Visualizing:</strong><br>${count} execution steps`;
        const meta = this.parser.metadata;
        if (meta) {
            if (meta.file_name) html += `<br>File: ${meta.file_name}`;
            if (meta.language)  html += ` (${meta.language})`;
            if (meta.total_lines) html += `<br>${meta.total_lines} lines`;
            if (meta.num_functions) html += `, ${meta.num_functions} fn(s)`;
            if (meta.num_variables) html += `, ${meta.num_variables} vars`;
        }
        el.innerHTML = html;
    }

    // ─── Code Panel ─────────────────────────────────────────────

    setSourceCode(code) {
        this._sourceCode = code;
    }

    _buildCodePanel(code) {
        this._removeCodePanel();

        const panel = document.createElement('div');
        panel.id = 'codePanel';
        panel.className = 'code-panel';

        // Header with filename + Save button
        const header = document.createElement('div');
        header.className = 'code-panel-header';
        const meta = this.parser.metadata;
        const filename = meta && meta.file_name ? meta.file_name : 'code.c';

        const titleSpan = document.createElement('span');
        titleSpan.textContent = filename;
        header.appendChild(titleSpan);

        const saveBtn = document.createElement('button');
        saveBtn.className = 'code-save-btn';
        saveBtn.textContent = 'Save & Run';
        saveBtn.addEventListener('click', () => this._saveCodePanel());
        header.appendChild(saveBtn);

        panel.appendChild(header);

        // Editor area: gutter + textarea
        const wrap = document.createElement('div');
        wrap.className = 'code-editor-wrap';

        const gutter = document.createElement('div');
        gutter.className = 'code-gutter';
        gutter.id = 'codeGutter';

        const textarea = document.createElement('textarea');
        textarea.className = 'code-textarea';
        textarea.id = 'codeTextarea';
        textarea.spellcheck = false;
        textarea.value = code;

        // Sync gutter line numbers
        const updateGutter = () => {
            const lines = textarea.value.split('\n');
            gutter.innerHTML = lines.map((_, i) =>
                `<div class="code-gutter-line" id="gutterLine${i+1}">${i+1}</div>`
            ).join('');
        };
        textarea.addEventListener('input', updateGutter);
        updateGutter();

        // Stop keyboard/mouse events from reaching Babylon.js 3D controls
        textarea.addEventListener('keydown', (e) => e.stopPropagation());
        textarea.addEventListener('keyup', (e) => e.stopPropagation());
        textarea.addEventListener('mousedown', (e) => e.stopPropagation());
        textarea.addEventListener('mousemove', (e) => e.stopPropagation());
        textarea.addEventListener('wheel', (e) => e.stopPropagation());

        // Sync scroll between gutter and textarea
        textarea.addEventListener('scroll', () => {
            gutter.scrollTop = textarea.scrollTop;
        });

        wrap.appendChild(gutter);
        wrap.appendChild(textarea);
        panel.appendChild(wrap);

        document.body.appendChild(panel);
        makeDraggable(panel, header);

        // Animate in
        requestAnimationFrame(() => panel.classList.add('open'));
    }

    _saveCodePanel() {
        const textarea = document.getElementById('codeTextarea');
        if (!textarea) return;

        const code = textarea.value;
        const meta = this.parser.metadata;
        const filename = meta && meta.file_name ? meta.file_name : 'code.c';

        // Create a File object from the edited text
        const blob = new Blob([code], { type: 'text/plain' });
        const file = new File([blob], filename);

        // Update stored source code
        this.setSourceCode(code);

        // Upload and re-visualize
        const saveBtn = document.querySelector('.code-save-btn');
        if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Processing...'; }

        CodeParser.upload(file)
            .then(json => {
                if (json.success === false) {
                    const err = json.error || {};
                    alert(`Error (${err.stage || 'unknown'}): ${err.message || 'Unknown error'}`);
                    return;
                }
                this.visualize(json);
            })
            .catch(err => alert('Save failed: ' + err.message))
            .finally(() => {
                if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save & Run'; }
            });
    }

    _removeCodePanel() {
        const panel = document.getElementById('codePanel');
        if (panel) {
            panel.classList.remove('open');
            setTimeout(() => { if (panel.parentNode) panel.parentNode.removeChild(panel); }, 300);
        }
    }

    highlightLine(lineNumber) {
        // Remove old gutter highlight
        const old = document.querySelector('.code-gutter-line.highlighted');
        if (old) old.classList.remove('highlighted');

        if (!lineNumber) return;

        // Highlight gutter line number
        const gutterLine = document.getElementById('gutterLine' + lineNumber);
        if (gutterLine) gutterLine.classList.add('highlighted');

        // Scroll textarea to center the line
        const textarea = document.getElementById('codeTextarea');
        if (!textarea) return;
        const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 20;
        const visibleLines = textarea.clientHeight / lineHeight;
        textarea.scrollTop = (lineNumber - visibleLines / 2) * lineHeight;
    }

}
