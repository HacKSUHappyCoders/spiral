# Copilot Agent Instruction — What a “Building” Represents in the Visual Debugger

You are implementing a 3D visual debugger where a program execution trace is rendered as a spiral city.
**A building must never represent a line of code or an AST node.**
A building represents a *persistent runtime concept* — something that continues to exist across multiple execution events.

The visualization is driven by the execution trace (CALL, DECL, ASSIGN, LOOP, CONDITION, BRANCH, RETURN).
The user navigates forward along a spiral path that represents **time**. Each trace event advances time.

Your task: construct buildings based on runtime responsibility, not syntax.

---

## Core Rule

Create buildings only for entities that have lifetime:

1. Functions
2. Variables
3. Control Flow Structures (loops + branches)
4. Memory

Instructions are moments.
Buildings are things that persist across moments.

---

## Building Types

---

### 1. Function Buildings (Districts)

**Represents:** a stack frame / function invocation

Create a large landmark structure when a CALL event occurs:

```
CALL main
```

Behavior:

* Enter the function building when a CALL happens
* Exit when RETURN occurs
* Stack depth determines vertical placement (higher depth = higher floor)
* Nested calls are physically above the caller

Data displayed inside:

* Function name
* Current stack depth
* Active local variables
* Return value (when available)

Implementation mapping:

* CALL → create or activate function district
* RETURN → close the district and emit a return object leaving the building

The player should experience the call stack as moving between floors.

---

### 2. Variable Buildings (Houses)

**Represents:** a variable with storage location and lifetime

Create one persistent building per unique variable identity:
Key = (function_scope + variable_name + memory_address)

Example:

```
DECL sum address 000000660F5FF91C
```

The building must persist for the entire lifetime of the variable.

Inside the building store:

* Variable name
* Address (street address metaphor)
* Current value
* Value history
* Last writer (line/event)

Behavior:

* DECL → construct the house and turn lights on
* ASSIGN → deliver a value to the house and update visible display
* Variable value should be visibly displayed on the building exterior
* When scope ends → lights turn off

Important:
If the same address appears again, it is the same physical memory location and must reuse the same building.

---

### 3. Loop Buildings (Factories)

**Represents:** repetition machinery (NOT a place in code)

Create a factory when a LOOP event is encountered:

```
LOOP subtype=for condition="i<5"
```

The building represents a repeating process.

Behavior:

* Each LOOP event with condition_result = 1 is one machine cycle
* Increment an iteration counter
* Trigger the events occurring inside the loop
* When condition_result = 0 → the factory stops operating

Data to store:

* Loop condition
* Iteration count
* Exit reason (condition became false)

The user must be able to visually perceive repetition occurring.

---

### 4. Branch Buildings (Intersections)

**Represents:** a decision point

Create a road fork when a CONDITION event occurs:

```
CONDITION sum < 10 → false
BRANCH else
```

Behavior:

* Evaluate the condition
* Activate only the chosen path
* Non-taken paths must visibly deactivate

Data to store:

* Condition expression
* Boolean result
* Selected branch

The visualization should communicate that execution follows a path, not a jump.

---

### 5. Memory Layer (Underground System)

**Represents:** raw memory

All variable buildings must connect to a memory node using their address:

```
address = 000000660F5FF91C
```

Rules:

* Identical addresses share the same memory node
* Visualize shared memory connections
* Support pointer visualization later

This allows detection of aliasing and memory errors.

---

## Event → World Mapping

| Trace Event  | World Action            |
| ------------ | ----------------------- |
| CALL         | Enter function district |
| DECL         | Create variable house   |
| ASSIGN       | Update house value      |
| LOOP (true)  | Run factory cycle       |
| LOOP (false) | Stop factory            |
| CONDITION    | Evaluate intersection   |
| BRANCH       | Choose road             |
| RETURN       | Exit function           |

---


## Non-Goals

Do NOT:

* Render AST nodes as buildings
* Place one building per line number
* Treat statements as objects

This system is a runtime world simulation, not a code viewer.

---

Implement the world as a simulation of program execution state over time.
