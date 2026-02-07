/**
 * WorldState — The runtime simulation state engine.
 *
 * Maintains the full state of the "city" at any point in time.
 * The trace is replayed step-by-step; each step mutates the world
 * deterministically.  Moving backward simply rebuilds from scratch
 * up to the target step (immutable snapshots could be added later).
 *
 * Entities tracked:
 *   • functionDistricts  – keyed by (name + depth), created on CALL, closed on RETURN
 *   • variableHouses     – keyed by (scope + name + address), created on DECL, updated on ASSIGN
 *   • loopFactories      – keyed by (scope + line + condition), created on first LOOP
 *   • branchIntersections – keyed by (scope + line + condition), created on CONDITION
 *   • memoryNodes         – keyed by address, shared across variables
 */
class WorldState {
    constructor() {
        this.trace = [];
        this.currentStep = -1;

        // Persistent entities
        this.functionDistricts = new Map();   // key → { name, depth, enterStep, exitStep, active, localVars:[], returnValue }
        this.variableHouses = new Map();       // key → { name, address, scope, values:[], currentValue, lastWriter, declStep, active }
        this.loopFactories = new Map();        // key → { subtype, condition, iterations, active, running, steps:[] }
        this.branchIntersections = new Map();   // key → { condition, result, chosenBranch, active, step }
        this.memoryNodes = new Map();           // address → { address, variables: Set of house keys }

        // Call stack — tracks the nesting of function calls
        this.callStack = [];                   // array of district keys

        // All steps processed so far (for UI labelling)
        this.processedSteps = [];
    }

    /**
     * Load a parsed trace array (from CodeParser.parse()).
     */
    loadTrace(trace) {
        this.trace = trace;
        this.reset();
    }

    /**
     * Reset the world to time = -1 (nothing has happened yet).
     */
    reset() {
        this.currentStep = -1;
        this.functionDistricts.clear();
        this.variableHouses.clear();
        this.loopFactories.clear();
        this.branchIntersections.clear();
        this.memoryNodes.clear();
        this.callStack = [];
        this.processedSteps = [];
    }

    /**
     * Advance the world to the given step index (inclusive).
     * If targetStep < currentStep we rebuild from scratch.
     */
    seekTo(targetStep) {
        targetStep = Math.max(-1, Math.min(targetStep, this.trace.length - 1));

        if (targetStep < this.currentStep) {
            // Rewind: rebuild from start
            this.reset();
        }

        while (this.currentStep < targetStep) {
            this._applyStep(this.currentStep + 1);
        }
    }

    /**
     * Get the current scope name (top of call stack, or "global").
     */
    currentScope() {
        return this.callStack.length > 0
            ? this.callStack[this.callStack.length - 1]
            : '__global__';
    }

    // ─── internal: apply a single trace step ───────────────────────

    _applyStep(index) {
        const step = this.trace[index];
        this.currentStep = index;
        this.processedSteps.push(step);

        switch (step.type) {
            case 'CALL':      this._handleCall(step); break;
            case 'RETURN':    this._handleReturn(step); break;
            case 'DECL':      this._handleDecl(step); break;
            case 'ASSIGN':    this._handleAssign(step); break;
            case 'LOOP':      this._handleLoop(step); break;
            case 'CONDITION': this._handleCondition(step); break;
            case 'BRANCH':    this._handleBranch(step); break;
        }
    }

    // ─── CALL ──────────────────────────────────────────────────────

    _handleCall(step) {
        const key = `fn_${step.name}_d${step.depth}`;
        if (!this.functionDistricts.has(key)) {
            this.functionDistricts.set(key, {
                key,
                name: step.name,
                depth: step.depth,
                enterStep: this.currentStep,
                exitStep: null,
                active: true,
                localVars: [],
                returnValue: null
            });
        } else {
            const d = this.functionDistricts.get(key);
            d.active = true;
            d.enterStep = this.currentStep;
            d.exitStep = null;
            d.returnValue = null;
        }
        this.callStack.push(key);
    }

    // ─── RETURN ────────────────────────────────────────────────────

    _handleReturn(step) {
        const key = this.callStack.length > 0
            ? this.callStack[this.callStack.length - 1]
            : null;

        if (key && this.functionDistricts.has(key)) {
            const d = this.functionDistricts.get(key);
            d.exitStep = this.currentStep;
            d.active = false;
            d.returnValue = step.value;

            // Deactivate local variables
            d.localVars.forEach(vk => {
                const house = this.variableHouses.get(vk);
                if (house) house.active = false;
            });
        }
        this.callStack.pop();
    }

    // ─── DECL ──────────────────────────────────────────────────────

    _handleDecl(step) {
        const scope = this.currentScope();
        const key = `var_${scope}_${step.name}_${step.address}`;

        if (!this.variableHouses.has(key)) {
            this.variableHouses.set(key, {
                key,
                name: step.name,
                address: step.address,
                scope,
                values: [{ value: step.value, step: this.currentStep }],
                currentValue: step.value,
                lastWriter: this.currentStep,
                declStep: this.currentStep,
                active: true
            });
        } else {
            // Re-declaration (e.g. loop variable in new iteration)
            const house = this.variableHouses.get(key);
            house.active = true;
            house.values.push({ value: step.value, step: this.currentStep });
            house.currentValue = step.value;
            house.lastWriter = this.currentStep;
        }

        // Register with parent function district
        const fnKey = this.callStack.length > 0
            ? this.callStack[this.callStack.length - 1]
            : null;
        if (fnKey && this.functionDistricts.has(fnKey)) {
            const d = this.functionDistricts.get(fnKey);
            if (!d.localVars.includes(key)) d.localVars.push(key);
        }

        // Register in memory layer
        this._registerMemoryNode(step.address, key);
    }

    // ─── ASSIGN ────────────────────────────────────────────────────

    _handleAssign(step) {
        const scope = this.currentScope();
        // Find the house — try current scope first, then any scope with same name+address
        let key = `var_${scope}_${step.name}_${step.address}`;
        if (!this.variableHouses.has(key)) {
            // Try to find by address
            for (const [k, v] of this.variableHouses) {
                if (v.name === step.name && v.address === step.address) {
                    key = k;
                    break;
                }
            }
        }

        if (this.variableHouses.has(key)) {
            const house = this.variableHouses.get(key);
            house.values.push({ value: step.value, step: this.currentStep });
            house.currentValue = step.value;
            house.lastWriter = this.currentStep;
        }
        // If we still don't have a house, the assign references an undeclared variable
        // — in that case, create one implicitly
        else {
            this._handleDecl({ ...step, type: 'DECL' });
        }
    }

    // ─── LOOP ──────────────────────────────────────────────────────

    _handleLoop(step) {
        const scope = this.currentScope();
        const key = `loop_${scope}_L${step.line}_${step.condition}`;

        if (!this.loopFactories.has(key)) {
            this.loopFactories.set(key, {
                key,
                subtype: step.subtype,
                condition: step.condition,
                iterations: 0,
                active: true,
                running: !!step.conditionResult,
                steps: [this.currentStep]
            });
        }

        const factory = this.loopFactories.get(key);
        factory.steps.push(this.currentStep);

        if (step.conditionResult) {
            factory.iterations++;
            factory.running = true;
            factory.active = true;
        } else {
            factory.running = false;
            factory.active = false;
        }
    }

    // ─── CONDITION ─────────────────────────────────────────────────

    _handleCondition(step) {
        const scope = this.currentScope();
        const key = `cond_${scope}_L${step.line}_${step.name}`;

        this.branchIntersections.set(key, {
            key,
            condition: step.name,
            result: !!step.conditionResult,
            chosenBranch: null,        // will be filled by BRANCH
            active: true,
            step: this.currentStep
        });
    }

    // ─── BRANCH ────────────────────────────────────────────────────

    _handleBranch(step) {
        // Try to find the most recent CONDITION for this branch
        const scope = this.currentScope();
        // Walk backward to find matching condition
        for (const [, intersection] of this.branchIntersections) {
            if (intersection.active && !intersection.chosenBranch) {
                intersection.chosenBranch = step.subtype || step.name || 'taken';
                break;
            }
        }
    }

    // ─── Memory layer ──────────────────────────────────────────────

    _registerMemoryNode(address, houseKey) {
        if (!address || address === '0') return;
        if (!this.memoryNodes.has(address)) {
            this.memoryNodes.set(address, {
                address,
                variables: new Set()
            });
        }
        this.memoryNodes.get(address).variables.add(houseKey);
    }

    // ─── Snapshot for renderer ─────────────────────────────────────

    /**
     * Return the full state of the world at the current step.
     * The renderer reads this to decide what to show.
     */
    getSnapshot() {
        return {
            step: this.currentStep,
            totalSteps: this.trace.length,
            functions: [...this.functionDistricts.values()],
            variables: [...this.variableHouses.values()],
            loops: [...this.loopFactories.values()],
            branches: [...this.branchIntersections.values()],
            memory: [...this.memoryNodes.values()],
            callStack: [...this.callStack],
            currentEvent: this.currentStep >= 0 ? this.trace[this.currentStep] : null
        };
    }
}
