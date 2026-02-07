/**
 * CityRenderer — Translates WorldState snapshots into 3D Babylon.js meshes
 * arranged along a **descending spiral path**.
 *
 * Delegates mesh creation to MeshFactory and label management to LabelHelper.
 * This class owns layout (spiral), render orchestration, hover interaction,
 * memory lines, and per-frame state updates.
 */
class CityRenderer {
    constructor(scene) {
        this.scene = scene;

        // Helpers
        this.labelHelper = new LabelHelper(scene);
        this.meshFactory = new MeshFactory(scene, this.labelHelper);

        // Mesh caches:  entityKey → { mesh, extras… }
        this.functionMeshes = new Map();
        this.variableMeshes = new Map();
        this.loopMeshes = new Map();
        this.branchMeshes = new Map();
        this.memoryLines = [];

        // Spiral layout config
        this.spiralRadiusStart = 3;
        this.spiralRadiusGrowth = 0.35;
        this.spiralAngleStep = 0.55;
        this.spiralHeightStep = 0.45;

        // Slot management
        this._nextSlot = 0;
        this._slotMap = new Map();

        this._spiralTube = null;

        // Hover label tracking
        this._hoveredLabel = null;
        this._hoverAttached = false;
    }

    // ─── Hover observer — show/hide floating labels ────────────────

    _ensureHoverObserver() {
        if (this._hoverAttached) return;
        this._hoverAttached = true;

        this.scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.type !== BABYLON.PointerEventTypes.POINTERMOVE) return;

            const pick = this.scene.pick(
                this.scene.pointerX,
                this.scene.pointerY,
                (m) => m._buildingData != null
            );

            if (pick && pick.hit && pick.pickedMesh && pick.pickedMesh._buildingData) {
                const entry = this._entryForMesh(pick.pickedMesh);
                if (entry && entry.label) {
                    if (this._hoveredLabel && this._hoveredLabel !== entry.label) {
                        this._hoveredLabel.setEnabled(false);
                    }
                    entry.label.setEnabled(true);
                    this._hoveredLabel = entry.label;
                }
            } else if (this._hoveredLabel) {
                this._hoveredLabel.setEnabled(false);
                this._hoveredLabel = null;
            }
        });
    }

    /** Look up the cache entry that owns a given building mesh. */
    _entryForMesh(mesh) {
        for (const cache of [this.functionMeshes, this.variableMeshes, this.loopMeshes, this.branchMeshes]) {
            for (const [, entry] of cache) {
                if (entry.mesh === mesh) return entry;
            }
        }
        return null;
    }

    // ─── Spiral geometry ───────────────────────────────────────────

    _spiralPosition(slot) {
        const angle = slot * this.spiralAngleStep;
        const radius = this.spiralRadiusStart + slot * this.spiralRadiusGrowth;
        const totalHeight = Math.max(this._nextSlot, 1) * this.spiralHeightStep;
        const y = totalHeight - slot * this.spiralHeightStep;
        return new BABYLON.Vector3(
            Math.cos(angle) * radius,
            y,
            Math.sin(angle) * radius
        );
    }

    _slotFor(key) {
        if (!this._slotMap.has(key)) {
            this._slotMap.set(key, this._nextSlot++);
        }
        return this._slotMap.get(key);
    }

    // ─── Main render entry ─────────────────────────────────────────

    render(snapshot) {
        this._ensureHoverObserver();
        this._renderFunctions(snapshot.functions, snapshot.callStack);
        this._renderVariables(snapshot.variables);
        this._renderLoops(snapshot.loops);
        this._renderBranches(snapshot.branches);
        this._renderMemoryLayer(snapshot.memory);
        this._renderSpiralPath();
    }

    clear() {
        [this.functionMeshes, this.variableMeshes, this.loopMeshes, this.branchMeshes].forEach(cache => {
            cache.forEach(entry => this._disposeEntry(entry));
            cache.clear();
        });
        this.memoryLines.forEach(l => l.dispose());
        this.memoryLines = [];
        if (this._spiralTube) { this._spiralTube.dispose(); this._spiralTube = null; }
        this._nextSlot = 0;
        this._slotMap.clear();
    }

    // ─── Spiral tube ───────────────────────────────────────────────

    _renderSpiralPath() {
        if (this._spiralTube) { this._spiralTube.dispose(); this._spiralTube = null; }
        if (this._nextSlot < 2) return;

        const points = [];
        for (let i = 0; i < this._nextSlot; i++) {
            const p = this._spiralPosition(i);
            p.y -= 0.05;
            points.push(p);
        }

        this._spiralTube = BABYLON.MeshBuilder.CreateTube('spiralTimeline', {
            path: points, radius: 0.12, sideOrientation: BABYLON.Mesh.DOUBLESIDE
        }, this.scene);
        const mat = new BABYLON.StandardMaterial('spiralMat', this.scene);
        mat.emissiveColor = new BABYLON.Color3(0.8, 0.7, 0.3);
        mat.diffuseColor = new BABYLON.Color3(0.9, 0.8, 0.4);
        mat.alpha = 0.55;
        this._spiralTube.material = mat;
    }

    // ─── Function Districts ────────────────────────────────────────

    _renderFunctions(functions, callStack) {
        const activeKeys = new Set();
        functions.forEach(fn => {
            activeKeys.add(fn.key);
            if (!this.functionMeshes.has(fn.key)) {
                const slot = this._slotFor(fn.key);
                const pos = this._spiralPosition(slot);
                this.functionMeshes.set(fn.key, this.meshFactory.createFunctionDistrict(fn, pos));
            }
            this._updateFunctionState(this.functionMeshes.get(fn.key), fn);
        });
        this.functionMeshes.forEach((entry, key) => {
            if (!activeKeys.has(key)) this._setInactive(entry);
        });
    }

    _updateFunctionState(entry, fn) {
        if (!entry.mesh) return;
        if (entry.mesh.material) entry.mesh.material.alpha = 0.85;
        if (entry.cap && entry.cap.material) entry.cap.material.alpha = 0.9;
        if (entry.mesh._buildingData) {
            entry.mesh._buildingData.childSteps = MeshFactory.fnChildSteps(fn);
        }
        if (fn.returnValue !== null && fn.returnValue !== undefined) {
            this.labelHelper.update(entry.label, `${fn.name} → ${fn.returnValue}`);
        }
    }

    // ─── Variable Houses ───────────────────────────────────────────

    _renderVariables(variables) {
        const activeKeys = new Set();
        variables.forEach(v => {
            activeKeys.add(v.key);
            if (!this.variableMeshes.has(v.key)) {
                const slot = this._slotFor(v.key);
                const pos = this._spiralPosition(slot);
                this.variableMeshes.set(v.key, this.meshFactory.createVariableHouse(v, pos));
            }
            this._updateVariableState(this.variableMeshes.get(v.key), v);
        });
        this.variableMeshes.forEach((entry, key) => {
            if (!activeKeys.has(key)) this._setInactive(entry);
        });
    }

    _updateVariableState(entry, v) {
        if (!entry.mesh) return;
        if (entry.mesh.material) {
            entry.mesh.material.alpha = 0.85;
            entry.mesh.material.emissiveColor = new BABYLON.Color3(
                entry.color.r * 0.5, entry.color.g * 0.5, entry.color.b * 0.5
            );
        }
        if (entry.roof && entry.roof.material) entry.roof.material.alpha = 0.9;
        if (entry.mesh._buildingData) {
            entry.mesh._buildingData.childSteps = MeshFactory.varChildSteps(v);
            entry.mesh._buildingData.stepData.value = v.currentValue;
        }
        if (entry.label) {
            this.labelHelper.update(entry.label, `${v.name} = ${v.currentValue}`);
        }
    }

    // ─── Loop Factories ────────────────────────────────────────────

    _renderLoops(loops) {
        const activeKeys = new Set();
        loops.forEach(loop => {
            activeKeys.add(loop.key);
            if (!this.loopMeshes.has(loop.key)) {
                const slot = this._slotFor(loop.key);
                const pos = this._spiralPosition(slot);
                this.loopMeshes.set(loop.key, this.meshFactory.createLoopFactory(loop, pos));
            }
            this._updateLoopState(this.loopMeshes.get(loop.key), loop);
        });
        this.loopMeshes.forEach((entry, key) => {
            if (!activeKeys.has(key)) this._setInactive(entry);
        });
    }

    _updateLoopState(entry, loop) {
        if (!entry.mesh) return;
        if (entry.mesh.material) {
            entry.mesh.material.alpha = 0.85;
            entry.mesh.material.emissiveColor = new BABYLON.Color3(
                entry.color.r * 0.6, entry.color.g * 0.6, entry.color.b * 0.6
            );
        }
        if (entry.chimney && entry.chimney.material) entry.chimney.material.alpha = 0.9;
        if (entry.mesh._buildingData) {
            entry.mesh._buildingData.childSteps = MeshFactory.loopChildSteps(loop);
        }
        if (entry.label) {
            this.labelHelper.update(entry.label, `${loop.subtype.toUpperCase()} (${loop.condition}) ×${loop.iterations}`);
        }
    }

    // ─── Branch Intersections ──────────────────────────────────────

    _renderBranches(branches) {
        const activeKeys = new Set();
        branches.forEach(br => {
            activeKeys.add(br.key);
            if (!this.branchMeshes.has(br.key)) {
                const slot = this._slotFor(br.key);
                const pos = this._spiralPosition(slot);
                this.branchMeshes.set(br.key, this.meshFactory.createBranchIntersection(br, pos));
            }
            this._updateBranchState(this.branchMeshes.get(br.key), br);
        });
        this.branchMeshes.forEach((entry, key) => {
            if (!activeKeys.has(key)) this._setInactive(entry);
        });
    }

    _updateBranchState(entry, br) {
        if (!entry.mesh) return;
        if (entry.truePath && entry.truePath.material)
            entry.truePath.material.alpha = 0.9;
        if (entry.falsePath && entry.falsePath.material)
            entry.falsePath.material.alpha = 0.9;
        if (entry.label) {
            this.labelHelper.update(entry.label, `IF (${br.condition}) → ${br.result ? 'true' : 'false'}`);
        }
    }

    // ─── Memory Layer ──────────────────────────────────────────────

    _renderMemoryLayer(memoryNodes) {
        this.memoryLines.forEach(l => l.dispose());
        this.memoryLines = [];

        memoryNodes.forEach(node => {
            if (node.variables.size < 2) return;
            const positions = [];
            node.variables.forEach(varKey => {
                const entry = this.variableMeshes.get(varKey);
                if (entry && entry.mesh) positions.push(entry.mesh.position.clone());
            });
            if (positions.length < 2) return;

            for (let i = 0; i < positions.length - 1; i++) {
                const p1 = positions[i].clone(); p1.y = -0.5;
                const p2 = positions[i + 1].clone(); p2.y = -0.5;
                const line = BABYLON.MeshBuilder.CreateTube(`memLine_${node.address}_${i}`, {
                    path: [p1, p2], radius: 0.06, sideOrientation: BABYLON.Mesh.DOUBLESIDE
                }, this.scene);
                const mat = new BABYLON.StandardMaterial(`memLineMat_${node.address}_${i}`, this.scene);
                mat.emissiveColor = new BABYLON.Color3(0.3, 0.8, 0.3);
                mat.alpha = 0.4;
                line.material = mat;
                this.memoryLines.push(line);
            }
        });
    }

    // ─── Shared helpers ────────────────────────────────────────────

    _setInactive(entry) {
        if (!entry) return;
        if (entry.mesh && entry.mesh.material) entry.mesh.material.alpha = 0.85;
        if (entry.cap && entry.cap.material) entry.cap.material.alpha = 0.9;
        if (entry.roof && entry.roof.material) entry.roof.material.alpha = 0.9;
        if (entry.chimney && entry.chimney.material) entry.chimney.material.alpha = 0.9;
        if (entry.truePath && entry.truePath.material) entry.truePath.material.alpha = 0.9;
        if (entry.falsePath && entry.falsePath.material) entry.falsePath.material.alpha = 0.9;
    }

    _disposeEntry(entry) {
        if (!entry) return;
        const disposable = ['mesh', 'cap', 'roof', 'chimney', 'truePath', 'falsePath', 'label'];
        disposable.forEach(k => {
            if (entry[k]) {
                if (entry[k].material) entry[k].material.dispose();
                entry[k].dispose();
            }
        });
    }
}
