/**
 * SubSpiralRenderer — Renders mini spirals that emerge from container buildings
 * (functions, for-loops, while-loops, branches).
 *
 * Each sub-spiral is a smaller, tighter spiral anchored at the parent
 * building's position.  The child trace steps are displayed as tiny
 * colour-coded dots along the sub-spiral path.
 *
 * Sub-spirals are always visible (not on-click) — they appear as the
 * program runs and stay permanently.
 */
class SubSpiralRenderer {
    constructor(scene, labelHelper) {
        this.scene = scene;
        this.labelHelper = labelHelper;

        // All rendered sub-spirals: parentKey → { tube, dots[], pathColor }
        this.subSpirals = new Map();

        // Sub-spiral layout (smaller / tighter than main spiral)
        this.radiusStart = 0.6;
        this.radiusGrowth = 0.08;
        this.angleStep = 0.7;
        this.heightStep = 0.12;
        this.tubeRadius = 0.04;
        this.dotRadius = 0.12;
    }

    /**
     * Render sub-spirals for all container entities that have child steps.
     *
     * @param {object} snapshot – WorldState snapshot
     * @param {Map} parentPositionMap – entityKey → BABYLON.Vector3 (building positions from CityRenderer)
     * @param {Array} trace – the full trace array for step lookups
     */
    render(snapshot, parentPositionMap, trace) {
        const containers = this._collectContainers(snapshot);

        for (const container of containers) {
            if (container.childStepIndices.length === 0) continue;

            const parentPos = parentPositionMap.get(container.key);
            if (!parentPos) continue;

            // Only re-render if the sub-spiral doesn't exist or has grown
            const existing = this.subSpirals.get(container.key);
            if (existing && existing.dotCount === container.childStepIndices.length) continue;

            // Dispose old version if present
            if (existing) this._disposeSubSpiral(existing);

            // Build the sub-spiral
            const pathColor = ColorHash.spiralColor(container.key);
            const result = this._buildSubSpiral(
                container.key, container.childStepIndices, parentPos, pathColor, trace
            );
            this.subSpirals.set(container.key, result);
        }
    }

    clear() {
        this.subSpirals.forEach(s => this._disposeSubSpiral(s));
        this.subSpirals.clear();
    }

    // ─── internal ──────────────────────────────────────────────────

    _collectContainers(snapshot) {
        const out = [];
        for (const fn of snapshot.functions) {
            if (fn.childStepIndices && fn.childStepIndices.length > 0) out.push(fn);
        }
        for (const loop of snapshot.loops) {
            if (loop.childStepIndices && loop.childStepIndices.length > 0) out.push(loop);
        }
        for (const wl of snapshot.whileLoops) {
            if (wl.childStepIndices && wl.childStepIndices.length > 0) out.push(wl);
        }
        for (const br of snapshot.branches) {
            if (br.childStepIndices && br.childStepIndices.length > 0) out.push(br);
        }
        return out;
    }

    _subSpiralPosition(slot, origin) {
        const angle = slot * this.angleStep;
        const radius = this.radiusStart + slot * this.radiusGrowth;
        const y = origin.y + 0.3 + slot * this.heightStep;   // rise upward from building
        return new BABYLON.Vector3(
            origin.x + Math.cos(angle) * radius,
            y,
            origin.z + Math.sin(angle) * radius
        );
    }

    _buildSubSpiral(parentKey, childIndices, origin, pathColor, trace) {
        const dots = [];
        const pathPoints = [];
        const maxSlots = childIndices.length;

        // Build path points and dots for each child step
        for (let i = 0; i < maxSlots; i++) {
            const pos = this._subSpiralPosition(i, origin);
            pathPoints.push(pos.clone());

            // Create a small dot for each step
            const stepIndex = childIndices[i];
            const step = trace[stepIndex];
            const dotColor = this._dotColor(step);

            const dot = BABYLON.MeshBuilder.CreateSphere(
                `subDot_${parentKey}_${i}`,
                { diameter: this.dotRadius * 2, segments: 6 },
                this.scene
            );
            dot.position = pos;
            dot.isPickable = false;

            const mat = new BABYLON.StandardMaterial(`subDotMat_${parentKey}_${i}`, this.scene);
            mat.diffuseColor = new BABYLON.Color3(dotColor.r, dotColor.g, dotColor.b);
            mat.emissiveColor = new BABYLON.Color3(
                dotColor.r * 0.5, dotColor.g * 0.5, dotColor.b * 0.5
            );
            mat.alpha = 0.9;
            dot.material = mat;

            dots.push(dot);
        }

        // Draw the spiral tube if there are at least 2 points
        let tube = null;
        if (pathPoints.length >= 2) {
            tube = BABYLON.MeshBuilder.CreateTube(`subTube_${parentKey}`, {
                path: pathPoints,
                radius: this.tubeRadius,
                sideOrientation: BABYLON.Mesh.DOUBLESIDE
            }, this.scene);
            const tubeMat = new BABYLON.StandardMaterial(`subTubeMat_${parentKey}`, this.scene);
            tubeMat.diffuseColor = new BABYLON.Color3(pathColor.r, pathColor.g, pathColor.b);
            tubeMat.emissiveColor = new BABYLON.Color3(
                pathColor.r * 0.4, pathColor.g * 0.4, pathColor.b * 0.4
            );
            tubeMat.alpha = 0.6;
            tube.material = tubeMat;
            tube.isPickable = false;
        }

        return { tube, dots, pathColor, dotCount: maxSlots };
    }

    /**
     * Pick a dot colour based on the trace step type.
     */
    _dotColor(step) {
        if (!step) return { r: 0.5, g: 0.5, b: 0.5 };
        switch (step.type) {
            case 'CALL':      return { r: 0.9, g: 0.3, b: 0.3 };
            case 'RETURN':    return { r: 0.9, g: 0.6, b: 0.2 };
            case 'DECL':      return { r: 0.3, g: 0.5, b: 0.9 };
            case 'ASSIGN':    return { r: 0.3, g: 0.8, b: 0.9 };
            case 'LOOP':      return { r: 0.7, g: 0.3, b: 0.9 };
            case 'CONDITION': return { r: 0.9, g: 0.5, b: 0.2 };
            case 'BRANCH':    return { r: 0.9, g: 0.8, b: 0.2 };
            default:          return { r: 0.5, g: 0.5, b: 0.5 };
        }
    }

    _disposeSubSpiral(entry) {
        if (entry.tube) {
            if (entry.tube.material) entry.tube.material.dispose();
            entry.tube.dispose();
        }
        for (const dot of entry.dots) {
            if (dot.material) dot.material.dispose();
            dot.dispose();
        }
    }
}
