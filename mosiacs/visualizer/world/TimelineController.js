/**
 * TimelineController — Manages time navigation through the execution trace.
 *
 * Provides forward / backward / seek controls that drive WorldState.
 * Emits callbacks so the UI and renderer stay in sync.
 *
 * The timeline slider lets the user scrub to any point in the trace.
 * Playback auto-advances at a configurable speed.
 */
class TimelineController {
    constructor(worldState, onUpdate) {
        this.world = worldState;
        this.onUpdate = onUpdate;   // callback(snapshot) — called after every state change

        this.playing = false;
        this.playSpeed = 600;       // ms between steps in auto-play
        this._playInterval = null;
    }

    /**
     * Jump to a specific step.
     */
    seekTo(step) {
        this.world.seekTo(step);
        this._notify();
    }

    /**
     * Advance one step.
     */
    stepForward() {
        const result = this.world.stepForward();
        this._notify();
        return result;
    }

    /**
     * Go back one step.
     */
    stepBackward() {
        this.world.stepBackward();
        this._notify();
    }

    /**
     * Jump to the beginning.
     */
    goToStart() {
        this.stop();
        this.world.seekTo(-1);
        this._notify();
    }

    /**
     * Jump to the end.
     */
    goToEnd() {
        this.stop();
        this.world.seekTo(this.world.trace.length - 1);
        this._notify();
    }

    /**
     * Start auto-play.
     */
    play() {
        if (this.playing) return;
        this.playing = true;
        this._playInterval = setInterval(() => {
            const result = this.world.stepForward();
            this._notify();
            if (!result) this.stop();   // reached the end
        }, this.playSpeed);
    }

    /**
     * Stop auto-play.
     */
    stop() {
        this.playing = false;
        if (this._playInterval) {
            clearInterval(this._playInterval);
            this._playInterval = null;
        }
    }

    /**
     * Toggle play/pause.
     */
    togglePlay() {
        if (this.playing) this.stop();
        else this.play();
        return this.playing;
    }

    /**
     * Set playback speed (ms between steps).
     */
    setSpeed(ms) {
        this.playSpeed = ms;
        if (this.playing) {
            this.stop();
            this.play();
        }
    }

    // ─── internal ──────────────────────────────────────────────────

    _notify() {
        if (this.onUpdate) {
            this.onUpdate(this.world.getSnapshot());
        }
    }
}
