/**
 * ExplodeManager - Handles click-to-shatter interaction on buildings.
 *
 * When a building is clicked it "shatters" into static floating shards.
 * Each shard represents a variable / value that lived inside that code block.
 * The camera smoothly zooms out so the user can see the full explosion.
 *
 * Clicking a second time (or clicking another building) collapses the shards
 * back and restores the original building.
 */
class ExplodeManager {
    constructor(scene, camera, materialManager) {
        this.scene = scene;
        this.camera = camera;
        this.materialManager = materialManager;

        /** Currently exploded building data (null when nothing is open) */
        this.exploded = null;

        /** Saved camera state so we can restore it on collapse */
        this.savedCamera = null;

        this._setupPointerObservable();
    }

    // ─── click detection ────────────────────────────────────────────────

    _setupPointerObservable() {
        this.scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.type !== BABYLON.PointerEventTypes.POINTERPICK) return;
            const pickResult = pointerInfo.pickInfo;
            if (!pickResult.hit || !pickResult.pickedMesh) return;

            const mesh = pickResult.pickedMesh;

            // Walk up to find the building root (mesh name starts with "building_")
            const buildingMesh = this._findBuildingMesh(mesh);
            if (!buildingMesh) return;

            // If this building is already exploded → collapse it
            if (this.exploded && this.exploded.mesh === buildingMesh) {
                this._collapse();
                return;
            }

            // If a different building is exploded → collapse first, then explode new
            if (this.exploded) {
                this._collapse();
            }

            this._explode(buildingMesh);
        });
    }

    /**
     * Walk mesh / ancestors to find the one whose name starts with "building_"
     */
    _findBuildingMesh(mesh) {
        let cur = mesh;
        while (cur) {
            if (cur.name && cur.name.startsWith('building_')) return cur;
            // also check if this IS a shard – ignore clicks on shards
            if (cur.name && cur.name.startsWith('shard_')) return null;
            cur = cur.parent;
        }
        return null;
    }

    // ─── explode ────────────────────────────────────────────────────────

    _explode(buildingMesh) {
        const buildingData = buildingMesh._buildingData;
        if (!buildingData) return; // safety

        const childSteps = buildingData.childSteps || [];
        const centerPos = buildingMesh.position.clone();
        const height = buildingMesh._trapHeight || 2;

        // Calculate camera view position BEFORE creating shards
        // so we know which direction the shards should face
        const cameraViewInfo = this._calculateCameraViewPosition(centerPos, height, this._calculateTotalShards(childSteps.length));

        // Hide the original building + cap
        buildingMesh.setEnabled(false);
        if (buildingData.capMesh) buildingData.capMesh.setEnabled(false);

        // ── Create MORE shards for a proper shatter effect ──────────────
        const shards = [];

        // Header shard (always created)
        const headerShard = this._createShard(
            `shard_header_${buildingData.step}`,
            `${buildingData.stepData.type}  ${buildingData.stepData.name || ''}`,
            centerPos,
            0,
            this._calculateTotalShards(childSteps.length),
            height,
            buildingData.color,
            true,
            0,  // layer
            cameraViewInfo.direction  // face camera
        );
        shards.push(headerShard);

        let shardIndex = 1;

        // Create multiple shards per child step for a more dramatic shatter
        // Each child variable gets 2-3 shards showing different aspects
        childSteps.forEach((child, i) => {
            // Main shard with the primary info
            const mainLabel = this._labelForStep(child);
            const mainShard = this._createShard(
                `shard_${buildingData.step}_${i}_main`,
                mainLabel,
                centerPos,
                shardIndex++,
                this._calculateTotalShards(childSteps.length),
                height,
                this._colorForChild(child),
                false,
                0,  // inner layer
                cameraViewInfo.direction
            );
            shards.push(mainShard);

            // Secondary info shard (address/line if available)
            if (child.address && child.address !== '0') {
                const addrShard = this._createShard(
                    `shard_${buildingData.step}_${i}_addr`,
                    `@${child.address.substring(0, 12)}...`,
                    centerPos,
                    shardIndex++,
                    this._calculateTotalShards(childSteps.length),
                    height,
                    this._colorForChild(child),
                    false,
                    1,  // middle layer
                    cameraViewInfo.direction
                );
                shards.push(addrShard);
            }

            // Type/line info shard
            if (child.line > 0) {
                const lineShard = this._createShard(
                    `shard_${buildingData.step}_${i}_line`,
                    `line ${child.line}`,
                    centerPos,
                    shardIndex++,
                    this._calculateTotalShards(childSteps.length),
                    height,
                    { ...this._colorForChild(child), a: 0.7 },
                    false,
                    2,  // outer layer
                    cameraViewInfo.direction
                );
                shards.push(lineShard);
            }
        });

        // If there are no children, show a "no variables" shard
        if (childSteps.length === 0) {
            const empty = this._createShard(
                `shard_empty_${buildingData.step}`,
                '(no variables)',
                centerPos,
                1,
                2,
                height,
                { r: 0.5, g: 0.5, b: 0.5, a: 0.7 },
                false,
                0,
                cameraViewInfo.direction
            );
            shards.push(empty);
        }

        // ── Animate shards outward then freeze ──────────────────────────
        this._animateShardsOut(shards);

        // ── Move camera to front of the shattered building ─────────────
        this._saveCameraAndMoveToFront(centerPos, height, shards.length, cameraViewInfo);

        this.exploded = {
            mesh: buildingMesh,
            shards,
            buildingData
        };
    }

    /**
     * Calculate total shard count for proper ring distribution
     */
    _calculateTotalShards(childCount) {
        // Header + (main + address + line) per child, with some padding
        return 1 + (childCount * 3) + 2;
    }

    // ─── shard creation ─────────────────────────────────────────────────

    /**
     * Create a single shard – a flat panel with a dynamic-texture label.
     *
     * @param {string}  name
     * @param {string}  label       - text displayed on the shard face
     * @param {Vector3} center      - world-space center of the building
     * @param {number}  index       - position in the ring (0 = header)
     * @param {number}  total       - how many shards in the ring
     * @param {number}  buildingH   - height of the original building
     * @param {object}  color       - {r, g, b, a}
     * @param {boolean} isHeader
     * @param {number}  layer       - 0=inner, 1=middle, 2=outer (for multi-ring explosion)
     * @param {Vector3} cameraDir   - direction from building to camera (for orientation)
     */
    _createShard(name, label, center, index, total, buildingH, color, isHeader, layer, cameraDir) {
        // Shard dimensions - vary slightly by layer for depth effect
        const w = isHeader ? 2.5 : (1.5 - layer * 0.15);
        const h = isHeader ? 1.2 : (0.8 - layer * 0.1);
        const depth = 0.12;

        const shard = BABYLON.MeshBuilder.CreateBox(
            name,
            { width: w, height: h, depth: depth },
            this.scene
        );

        // ── target position: arrange in multiple rings (layers) ────────
        // Inner ring (layer 0): closer, medium ring (layer 1): mid-distance, outer ring (layer 2): far
        const baseRingRadius = 4.0 + total * 0.15;
        const ringRadius = baseRingRadius + (layer * 2.5);  // each layer pushes further out
        
        const angle = (index / total) * Math.PI * 2;
        const tx = center.x + Math.cos(angle) * ringRadius;
        const tz = center.z + Math.sin(angle) * ringRadius;
        
        // Stagger vertically based on index and layer
        const ty = center.y + buildingH * 0.5 + (index % 4) * 0.5 + (layer * 0.3);

        // Start at the building center (will animate outward)
        shard.position = center.clone();
        shard.position.y += buildingH * 0.5;

        // Store final target for animation
        shard._targetPos = new BABYLON.Vector3(tx, ty, tz);

        // ── Make shard face the CAMERA direction, not outward from center ──
        // All shards should face toward where the camera will be positioned
        // so the user can read them all clearly
        const lookAtTarget = center.clone().add(cameraDir.scale(100));
        shard.lookAt(lookAtTarget);

        // Add slight random tilt for a "shattered" feel - more chaotic on outer layers
        // But keep it subtle so text remains readable
        shard.rotation.x += (Math.random() - 0.5) * (0.15 + layer * 0.08);
        shard.rotation.z += (Math.random() - 0.5) * (0.1 + layer * 0.05);

        // ── material with dynamic texture label ─────────────────────
        const mat = new BABYLON.StandardMaterial(name + '_mat', this.scene);
        const texSize = 512;
        const dynTex = new BABYLON.DynamicTexture(name + '_tex', texSize, this.scene, false);
        const ctx = dynTex.getContext();

        // Background – translucent shard colour
        ctx.fillStyle = `rgba(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)}, 0.85)`;
        ctx.fillRect(0, 0, texSize, texSize);

        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6;
        ctx.strokeRect(8, 8, texSize - 16, texSize - 16);

        // Text
        ctx.fillStyle = '#ffffff';
        ctx.font = isHeader ? 'bold 42px monospace' : `bold ${layer === 2 ? '28px' : '34px'} monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Word-wrap the label
        const lines = this._wrapText(ctx, label, texSize - 40);
        const lineH = isHeader ? 50 : (layer === 2 ? 35 : 40);
        const startY = texSize / 2 - ((lines.length - 1) * lineH) / 2;
        lines.forEach((line, li) => {
            ctx.fillText(line, texSize / 2, startY + li * lineH);
        });

        dynTex.update();
        mat.diffuseTexture = dynTex;
        mat.emissiveColor = new BABYLON.Color3(color.r * 0.25, color.g * 0.25, color.b * 0.25);
        mat.alpha = color.a || 0.9;
        mat.backFaceCulling = false;

        shard.material = mat;
        shard._isHeader = isHeader;
        shard._layer = layer;

        return shard;
    }

    /**
     * Simple word-wrap helper for canvas 2-D context.
     */
    _wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let cur = '';
        words.forEach(w => {
            const test = cur ? cur + ' ' + w : w;
            if (ctx.measureText(test).width > maxWidth && cur) {
                lines.push(cur);
                cur = w;
            } else {
                cur = test;
            }
        });
        if (cur) lines.push(cur);
        return lines.length ? lines : [text];
    }

    // ─── shard animation ────────────────────────────────────────────────

    /**
     * Animate each shard from the building center outward to its ring
     * position, then freeze it in place. Add rotation for dramatic effect.
     */
    _animateShardsOut(shards) {
        shards.forEach((shard, i) => {
            const target = shard._targetPos;
            const start = shard.position.clone();
            const layer = shard._layer || 0;
            
            // Vary animation duration based on layer - outer pieces travel further so take longer
            const frames = 30 + (layer * 10);

            // Position animation
            const posAnim = new BABYLON.Animation(
                'shardOut_' + shard.name,
                'position',
                60,
                BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
                BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
            );

            // Ease-out cubic for smooth deceleration
            const ease = new BABYLON.CubicEase();
            ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
            posAnim.setEasingFunction(ease);

            posAnim.setKeys([
                { frame: 0, value: start },
                { frame: frames, value: target }
            ]);

            // Rotation animation - tumble as they fly out
            const rotAnim = new BABYLON.Animation(
                'shardRotate_' + shard.name,
                'rotation.y',
                60,
                BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
            );

            const startRot = shard.rotation.y;
            const endRot = startRot + ((Math.random() - 0.5) * Math.PI * 2); // random tumble

            rotAnim.setKeys([
                { frame: 0, value: startRot },
                { frame: frames, value: endRot }
            ]);

            shard.animations = [posAnim, rotAnim];
            this.scene.beginAnimation(shard, 0, frames, false);
        });
    }

    // ─── camera helpers ─────────────────────────────────────────────────

    /**
     * Calculate the optimal camera position to view the shattered building.
     * Returns position and direction vector.
     */
    _calculateCameraViewPosition(center, buildingHeight, shardCount) {
        // Distance from center - CLOSER than before for zoom-in effect
        // Base distance + scaling with shard count, but keeping it intimate
        const viewDistance = 8 + (shardCount * 0.15); // Reduced from 12 + 0.3
        
        // Position camera at an angle that gives a good 3/4 view
        // Offset in X and Z, elevated in Y
        const offsetAngle = Math.PI / 4; // 45 degrees
        const offsetX = Math.cos(offsetAngle) * viewDistance;
        const offsetZ = Math.sin(offsetAngle) * viewDistance;
        const offsetY = buildingHeight * 0.6; // closer to center height
        
        const cameraPosition = new BABYLON.Vector3(
            center.x + offsetX,
            center.y + buildingHeight * 0.5 + offsetY,
            center.z + offsetZ
        );
        
        // Direction vector from building to camera (normalized)
        const direction = cameraPosition.subtract(center).normalize();
        
        return {
            position: cameraPosition,
            direction: direction,
            distance: viewDistance
        };
    }

    /**
     * Move camera directly in front of the shattered building for a close-up view.
     * Save the current camera state so we can restore it on collapse.
     */
    _saveCameraAndMoveToFront(center, buildingHeight, shardCount, cameraViewInfo) {
        // Save current camera state
        this.savedCamera = {
            target: this.camera.target.clone(),
            radius: this.camera.radius,
            alpha: this.camera.alpha,
            beta: this.camera.beta,
            position: this.camera.position.clone()
        };

        // Target: center of the building (slightly elevated)
        const targetPos = center.clone();
        targetPos.y += buildingHeight * 0.5;

        // Use the pre-calculated camera position
        const newCameraPos = cameraViewInfo.position;
        
        // Calculate spherical coordinates for the new position relative to target
        const dirToTarget = targetPos.subtract(newCameraPos);
        const distance = dirToTarget.length();
        
        // Convert to spherical: alpha (horizontal angle), beta (vertical angle), radius
        const targetAlpha = Math.atan2(dirToTarget.x, dirToTarget.z);
        const targetBeta = Math.acos(dirToTarget.y / distance);
        const targetRadius = distance;

        // Animate camera to new position using spherical coordinates
        const animDuration = 50;
        
        BABYLON.Animation.CreateAndStartAnimation(
            'camRadius', this.camera, 'radius',
            60, animDuration,
            this.camera.radius, targetRadius,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        BABYLON.Animation.CreateAndStartAnimation(
            'camAlpha', this.camera, 'alpha',
            60, animDuration,
            this.camera.alpha, targetAlpha,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        BABYLON.Animation.CreateAndStartAnimation(
            'camBeta', this.camera, 'beta',
            60, animDuration,
            this.camera.beta, targetBeta,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        BABYLON.Animation.CreateAndStartAnimation(
            'camTarget', this.camera, 'target',
            60, animDuration,
            this.camera.target.clone(), targetPos,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
    }

    _restoreCamera() {
        if (!this.savedCamera) return;

        const animDuration = 50;

        // Restore all camera properties
        BABYLON.Animation.CreateAndStartAnimation(
            'camRadiusRestore', this.camera, 'radius',
            60, animDuration,
            this.camera.radius, this.savedCamera.radius,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        BABYLON.Animation.CreateAndStartAnimation(
            'camAlphaRestore', this.camera, 'alpha',
            60, animDuration,
            this.camera.alpha, this.savedCamera.alpha,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        BABYLON.Animation.CreateAndStartAnimation(
            'camBetaRestore', this.camera, 'beta',
            60, animDuration,
            this.camera.beta, this.savedCamera.beta,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        BABYLON.Animation.CreateAndStartAnimation(
            'camTargetRestore', this.camera, 'target',
            60, animDuration,
            this.camera.target.clone(), this.savedCamera.target,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        this.savedCamera = null;
    }

    // ─── collapse ───────────────────────────────────────────────────────

    /**
     * Public method to collapse any currently exploded building.
     * Can be called from UI button or internally.
     */
    collapseIfExploded() {
        if (this.exploded) {
            this._collapse();
            return true;
        }
        return false;
    }

    _collapse() {
        if (!this.exploded) return;

        const { mesh, shards, buildingData } = this.exploded;

        // Dispose all shards
        shards.forEach(s => {
            if (s.material) {
                if (s.material.diffuseTexture) s.material.diffuseTexture.dispose();
                s.material.dispose();
            }
            s.dispose();
        });

        // Show original building + cap
        mesh.setEnabled(true);
        if (buildingData.capMesh) buildingData.capMesh.setEnabled(true);

        // Restore camera
        this._restoreCamera();

        this.exploded = null;
    }

    // ─── helpers for child-step labels / colours ────────────────────────

    _labelForStep(step) {
        switch (step.type) {
            case 'DECL':
                return `DECL  ${step.name} = ${step.value}`;
            case 'ASSIGN':
                return `${step.name} = ${step.value}`;
            case 'LOOP':
                return `LOOP  ${step.name}  iter ${step.value}`;
            case 'IF':
                return `IF  ${step.name}  (${step.value})`;
            case 'ELSE':
                return `ELSE`;
            case 'RETURN':
                return `RETURN  ${step.value}`;
            case 'CALL':
                return `CALL  ${step.name}`;
            default:
                return `${step.type}  ${step.name || ''} ${step.value || ''}`;
        }
    }

    _colorForChild(step) {
        const map = {
            'DECL':   { r: 0.2, g: 0.4, b: 0.8, a: 0.85 },
            'ASSIGN': { r: 0.2, g: 0.8, b: 0.4, a: 0.85 },
            'LOOP':   { r: 0.6, g: 0.2, b: 0.8, a: 0.85 },
            'IF':     { r: 0.9, g: 0.4, b: 0.2, a: 0.85 },
            'ELSE':   { r: 0.4, g: 0.7, b: 0.9, a: 0.85 },
            'RETURN': { r: 0.9, g: 0.7, b: 0.1, a: 0.85 },
            'CALL':   { r: 0.8, g: 0.2, b: 0.2, a: 0.85 }
        };
        return map[step.type] || { r: 0.6, g: 0.6, b: 0.6, a: 0.85 };
    }
}
