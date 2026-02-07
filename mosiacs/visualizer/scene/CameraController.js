/**
 * CameraController — Handles camera setup and controls
 *
 * Implements Blender-style controls:
 * - Left mouse: Orbit
 * - Shift + Left mouse: Pan
 * - Scroll: Zoom
 * - Numpad shortcuts for views
 */
class CameraController {
    constructor(canvas, scene) {
        this.canvas = canvas;
        this.scene = scene;
        this.camera = null;
        this._pointersInput = null;
    }

    /**
     * Create and configure the camera
     */
    init() {
        this.camera = new BABYLON.ArcRotateCamera(
            "camera",
            Math.PI / 2,
            Math.PI / 4,
            60,
            new BABYLON.Vector3(0, 10, 0),
            this.scene
        );
        this.camera.attachControl(this.canvas, true);
        this.camera.lowerRadiusLimit = 5;
        this.camera.upperRadiusLimit = 500;
        this.camera.wheelPrecision = 3;
        this.camera.panningSensibility = 200;

        // Configure Blender-style controls
        this._setupBlenderControls();
        this._setupBlenderPanShortcut();
        this._setupBlenderKeyboardShortcuts();

        return this.camera;
    }

    /**
     * Reset camera to bird's-eye view
     */
    reset(spiralRadius) {
        if (!this.camera) return;

        let height, offset;
        if (spiralRadius != null && spiralRadius > 0) {
            height = spiralRadius * 2.2 + 10;
            offset = spiralRadius * 0.15;
        } else {
            height = 65;
            offset = 5;
        }

        this.scene.stopAnimation(this.camera);

        // Smooth transition
        const targetPos = new BABYLON.Vector3(offset, height, offset);
        const targetLookAt = new BABYLON.Vector3(0, 0, 0);

        const posAnim = new BABYLON.Animation(
            'cameraResetPos', 'position', 30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        posAnim.setKeys([
            { frame: 0, value: this.camera.position.clone() },
            { frame: 30, value: targetPos }
        ]);

        const targetAnim = new BABYLON.Animation(
            'cameraResetTarget', 'target', 30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        targetAnim.setKeys([
            { frame: 0, value: this.camera.target.clone() },
            { frame: 30, value: targetLookAt }
        ]);

        const ease = new BABYLON.CubicEase();
        ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        posAnim.setEasingFunction(ease);
        targetAnim.setEasingFunction(ease);

        this.scene.beginDirectAnimation(this.camera, [posAnim, targetAnim], 0, 30, false);
    }

    /**
     * Get the camera instance
     */
    getCamera() {
        return this.camera;
    }

    // ─── Private: Blender-style controls ───────────────────────────

    _setupBlenderControls() {
        // Remove default inputs that conflict with our custom controls
        this.camera.inputs.removeByType("ArcRotateCameraPointersInput");
        this.camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");

        // Re-add pointer input with custom button mapping
        const pointersInput = new BABYLON.ArcRotateCameraPointersInput();
        pointersInput.buttons = [0]; // Only left-mouse orbits
        pointersInput._useCtrlForPanning = false;
        pointersInput.panningSensibility = 200;
        this.camera.inputs.add(pointersInput);

        this._pointersInput = pointersInput;
    }

    _setupBlenderPanShortcut() {
        let isPanning = false;
        let lastX = 0;
        let lastY = 0;

        this.scene.onPrePointerObservable.add((pointerInfo) => {
            const evt = pointerInfo.event;

            if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
                if (evt.button === 0 && evt.shiftKey) {
                    isPanning = true;
                    lastX = evt.clientX;
                    lastY = evt.clientY;
                    // Skip default orbit handling for this drag
                    pointerInfo.skipOnPointerObservable = true;
                }
            }

            if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE && isPanning) {
                const dx = evt.clientX - lastX;
                const dy = evt.clientY - lastY;
                lastX = evt.clientX;
                lastY = evt.clientY;

                // Pan the camera target in screen-space
                const camera = this.camera;
                const forward = camera.target.subtract(camera.position).normalize();
                const worldUp = BABYLON.Vector3.Up();
                const right = BABYLON.Vector3.Cross(forward, worldUp).normalize();
                const up = BABYLON.Vector3.Cross(right, forward).normalize();

                const slow = evt.ctrlKey ? 0.2 : 1.0;
                const sensitivity = camera.radius * 0.002 * slow;
                const offset = right.scale(dx * sensitivity).add(up.scale(dy * sensitivity));
                camera.target.addInPlace(offset);

                pointerInfo.skipOnPointerObservable = true;
            }

            if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERUP) {
                if (evt.button === 0 && isPanning) {
                    isPanning = false;
                }
            }
        });
    }

    _setupBlenderKeyboardShortcuts() {
        window.addEventListener('keydown', (e) => {
            if (!this.camera) return;

            // Ctrl slows all keyboard camera actions
            const slow = e.ctrlKey ? 0.2 : 1.0;

            // Shift + Arrow Keys: Pan camera
            if (e.shiftKey && e.code.startsWith('Arrow')) {
                e.preventDefault();
                this._panWithArrowKey(e.code, slow);
                return;
            }

            // Plain Arrow Keys: Orbit camera
            if (e.code.startsWith('Arrow')) {
                e.preventDefault();
                this._orbitWithArrowKey(e.code, slow);
                return;
            }

            // PageUp/PageDown: Zoom in/out
            if (e.code === 'PageUp' || e.code === 'PageDown') {
                e.preventDefault();
                const base = e.code === 'PageUp' ? 0.85 : 1.18;
                // Lerp toward 1.0 when slow (ctrl held)
                const zoomFactor = 1.0 + (base - 1.0) * slow;
                this.camera.radius = Math.max(
                    this.camera.lowerRadiusLimit,
                    Math.min(this.camera.upperRadiusLimit, this.camera.radius * zoomFactor)
                );
                return;
            }

            // Numpad 5: Toggle orthographic/perspective
            if (e.code === 'Numpad5') {
                e.preventDefault();
                this.camera.mode = (this.camera.mode === BABYLON.Camera.ORTHOGRAPHIC_CAMERA)
                    ? BABYLON.Camera.PERSPECTIVE_CAMERA
                    : BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
                
                if (this.camera.mode === BABYLON.Camera.ORTHOGRAPHIC_CAMERA) {
                    this.camera.orthoLeft = -50;
                    this.camera.orthoRight = 50;
                    this.camera.orthoBottom = -50;
                    this.camera.orthoTop = 50;
                }
            }

            // Numpad 1: Front view
            if (e.code === 'Numpad1') {
                e.preventDefault();
                this._setView(0, Math.PI / 2, 50);
            }

            // Numpad 3: Right view
            if (e.code === 'Numpad3') {
                e.preventDefault();
                this._setView(Math.PI / 2, Math.PI / 2, 50);
            }

            // Numpad 7: Top view
            if (e.code === 'Numpad7') {
                e.preventDefault();
                this._setView(0, 0.001, 50);
            }

            // Numpad . (Period/Delete): Focus on origin
            if (e.code === 'NumpadDecimal') {
                e.preventDefault();
                this._focusOnOrigin();
            }
        });
    }

    _setView(alpha, beta, radius) {
        const camera = this.camera;
        this.scene.stopAnimation(camera);

        const alphaAnim = new BABYLON.Animation(
            'cameraAlpha', 'alpha', 30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        alphaAnim.setKeys([
            { frame: 0, value: camera.alpha },
            { frame: 20, value: alpha }
        ]);

        const betaAnim = new BABYLON.Animation(
            'cameraBeta', 'beta', 30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        betaAnim.setKeys([
            { frame: 0, value: camera.beta },
            { frame: 20, value: beta }
        ]);

        const radiusAnim = new BABYLON.Animation(
            'cameraRadius', 'radius', 30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        radiusAnim.setKeys([
            { frame: 0, value: camera.radius },
            { frame: 20, value: radius }
        ]);

        const ease = new BABYLON.CubicEase();
        ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        alphaAnim.setEasingFunction(ease);
        betaAnim.setEasingFunction(ease);
        radiusAnim.setEasingFunction(ease);

        this.scene.beginDirectAnimation(camera, [alphaAnim, betaAnim, radiusAnim], 0, 20, false);
    }

    _focusOnOrigin() {
        const camera = this.camera;
        this.scene.stopAnimation(camera);

        const targetAnim = new BABYLON.Animation(
            'cameraFocus', 'target', 30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        targetAnim.setKeys([
            { frame: 0, value: camera.target.clone() },
            { frame: 20, value: new BABYLON.Vector3(0, 0, 0) }
        ]);

        const ease = new BABYLON.CubicEase();
        ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        targetAnim.setEasingFunction(ease);

        this.scene.beginDirectAnimation(camera, [targetAnim], 0, 20, false);
    }

    /**
     * Pan the camera target in screen-space directions using arrow keys.
     * Left/Right move along the camera's local right axis.
     * Up/Down move along the camera's local up axis.
     * Pan speed scales with distance (radius) so it feels consistent.
     */
    _panWithArrowKey(code, slow = 1.0) {
        const camera = this.camera;
        const panSpeed = camera.radius * 0.04 * slow;

        // Camera's forward direction (from camera to target)
        const forward = camera.target.subtract(camera.position).normalize();

        // Camera's right direction (forward × world up)
        const worldUp = BABYLON.Vector3.Up();
        const right = BABYLON.Vector3.Cross(forward, worldUp).normalize();

        // Camera's local up direction (right × forward) — view-plane up
        const up = BABYLON.Vector3.Cross(right, forward).normalize();

        let offset = BABYLON.Vector3.Zero();

        switch (code) {
            case 'ArrowLeft':
                offset = right.scale(panSpeed);
                break;
            case 'ArrowRight':
                offset = right.scale(-panSpeed);
                break;
            case 'ArrowUp':
                offset = up.scale(panSpeed);
                break;
            case 'ArrowDown':
                offset = up.scale(-panSpeed);
                break;
        }

        camera.target.addInPlace(offset);
    }

    /**
     * Orbit the camera around its target using arrow keys.
     * Left/Right adjust alpha (horizontal orbit).
     * Up/Down adjust beta (vertical orbit), clamped to avoid flipping.
     */
    _orbitWithArrowKey(code, slow = 1.0) {
        const camera = this.camera;
        const orbitSpeed = 0.35 * slow;

        switch (code) {
            case 'ArrowLeft':
                camera.alpha -= orbitSpeed;
                break;
            case 'ArrowRight':
                camera.alpha += orbitSpeed;
                break;
            case 'ArrowUp':
                camera.beta = Math.max(0.01, camera.beta - orbitSpeed);
                break;
            case 'ArrowDown':
                camera.beta = Math.min(Math.PI - 0.01, camera.beta + orbitSpeed);
                break;
        }
    }
}
