# Code Mosaic Visualizer - Agent Guidelines

## Project Overview

**Code Mosaic** is a revolutionary 3D visualization system that transforms code execution traces into beautiful, interactive stained-glass artwork using Babylon.js. The goal is to make code execution visible, tangible, and aesthetically pleasing.

---

## Who You Are

You are a **virtual artist and visualization engineer** specializing in:
- Creating beautiful, abstract 3D web experiences with Babylon.js
- Translating technical data into artistic, intuitive visualizations
- Designing with stained-glass aesthetics (rich colors, translucency, light effects)
- Building interactive, educational tools that make programming concepts accessible

---

## Core Concept

### The Vision
Transform linear code execution into a **3D descending spiral journey** where:
- Each operation becomes a colorful trapezoid "building" with a unique shape based on its type
- The execution path forms a **spiral road descending** from the sky to the ground
- CALL operations are the grandest structures; child operations build off them
- Stained-glass materials create a cathedral-like, reverent atmosphere
- The visualization is both informative and meditative

### Why a Spiral?
- **Compact**: Shows many execution steps in a condensed, viewable space
- **Intuitive**: Natural reading flow — execution flows **downward** like gravity, like reading a page
- **Beautiful**: Creates interesting perspectives and patterns
- **Meaningful**: Represents the cyclical nature of loops and recursion
- **Descending**: The start is at the top (the "big picture") and details unfold downward

---

## Technical Specifications

### Input Format
The system parses C code execution traces in this format:
```
TYPE|name|value|address|line|depth
```

**Field Descriptions:**
- `TYPE`: Operation type (CALL, DECL, LOOP, ASSIGN, RETURN, IF, ELSE, etc.)
- `name`: Variable/function name
- `value`: Current value (if applicable)
- `address`: Memory address (hexadecimal)
- `line`: Source code line number
- `depth`: Call stack depth / nesting level

**Example Trace:**
```
CALL|main|||1
DECL|sum|0|00000049923FF88C|2|1
LOOP|iter|3|1
DECL|i|0|00000049923FF888|3|1
ASSIGN|sum|0|00000049923FF88C|4|1
LOOP|iter|3|1
DECL|i|1|00000049923FF888|3|1
ASSIGN|sum|1|00000049923FF88C|4|1
LOOP|iter|3|1
DECL|i|2|00000049923FF888|3|1
ASSIGN|sum|3|00000049923FF88C|4|1
LOOP|iter|3|1
DECL|i|3|00000049923FF888|3|1
ASSIGN|sum|6|00000049923FF88C|4|1
LOOP|iter|3|1
DECL|i|4|00000049923FF888|3|1
ASSIGN|sum|10|00000049923FF88C|4|1
RETURN|literal|0|0|7|1
```

This trace represents a simple C program that sums numbers from 0 to 4.

---

## Artistic Guidelines

### Color Palette (Stained Glass)
Each operation type has a signature color inspired by precious gems:

| Operation | Color | Gemstone | RGB Values |
|-----------|-------|----------|------------|
| CALL | Ruby Red | Rich, warm entry point | (0.8, 0.2, 0.2) |
| DECL | Sapphire Blue | Clear, declarative | (0.2, 0.4, 0.8) |
| LOOP | Amethyst Purple | Cyclic, mystical | (0.6, 0.2, 0.8) |
| ASSIGN | Emerald Green | Growth, change | (0.2, 0.8, 0.4) |
| RETURN | Amber Gold | Completion, value | (0.9, 0.7, 0.1) |
| IF | Topaz Orange | Decision, branching | (0.9, 0.4, 0.2) |
| ELSE | Aquamarine | Alternative path | (0.4, 0.7, 0.9) |

### Material Properties
- **Translucency**: 70-90% alpha for glass-like effect
- **Emissive glow**: 30% of base color for inner light
- **Specular highlights**: High specular power (64+) for glass shine
- **Glow layer**: Global glow effect for magical atmosphere

### Spatial Design

**Spiral Path (DESCENDING):**
- Starts at the **TOP** (highest Y position) and spirals **downward**
- Execution flow reads top-to-bottom, like gravity pulling code through time
- Rotates 0.3 radians per step
- Grows outward 0.3 units per step
- **Descends** 0.5 units per step
- Step 0 (first operation) is at the peak; the last step is at the bottom
- Camera defaults to a slightly elevated angle looking down at the spiral

**Buildings/Structures — Trapezoid Shapes:**
- All buildings use **trapezoid prism** geometry (not uniform boxes)
- Different top-width vs bottom-width creates dynamic, architectural silhouettes
- Each operation type has a **unique shape profile and size hierarchy**
- Buildings have a glowing "crown/cap" on top
- Animated entrance (scale from 0 to 1)
- Subtle floating animation for life

### Operation Shape Hierarchy (Biggest → Smallest)

Each operation type has a distinct trapezoid shape reflecting its importance in the execution flow:

| Operation | Shape Style | Height Range | Bottom Width | Top Width | Role |
|-----------|------------|--------------|--------------|-----------|------|
| **CALL** | Trapezoid Tower | 4.0–5.5 | 2.2–3.0 | 0.4–0.6 | **Largest/tallest** — grand tower for function entry (dramatic taper) |
| **RETURN** | Inverted Trapezoid | 3.0–4.0 | 0.6–0.8 | 1.2–1.6 | Tall capstone (narrow base, wide top) — function exit |
| **LOOP** | Wide Trapezoid | 2.5–3.5 | 1.6–2.2 | 0.4–0.6 | Medium-large — repeating block structure |
| **IF** | Angled Trapezoid | 2.0–3.0 | 1.2–1.6 | 0.3–0.5 | Medium — decision point |
| **ELSE** | Angled Trapezoid | 1.8–2.8 | 1.2–1.6 | 0.3–0.5 | Medium — alternative path |
| **DECL** | Slim Trapezoid | 1.5–2.5 | 1.0–1.4 | 0.3–0.5 | Medium-small — variable birth |
| **ASSIGN** | Small Trapezoid | 1.0–1.8 | 0.8–1.2 | 0.2–0.4 | **Smallest** — incremental change |

### Building-Off / Hierarchical Stacking

Operations are not all placed at the same base level. Instead, they **build off their parent context**:

- **CALL** operations are the foundation — they sit directly on the spiral path and are the tallest structures (the "cathedral towers")
- **Child operations** (DECL, ASSIGN, LOOP, etc.) that occur within a function call are **vertically offset upward** by a fraction of their parent CALL's height
- This creates a visual effect where inner operations **stack on top of** or **grow out of** their parent function call
- The result is a layered, architectural look — like floors of a building rising from the CALL foundation
- When a new CALL is encountered, it resets the base and starts a new tower

### Why Trapezoids?
- **Visual variety**: Different top/bottom widths create a dynamic, non-uniform skyline
- **Metaphor**: Wide-base structures feel grounded and important (CALL); narrow ones feel transient (ASSIGN)
- **Architecture**: Trapezoid shapes evoke real buildings — buttresses, towers, pyramids
- **Readability**: You can tell operation types apart by silhouette alone

### Trapezoid Mesh Technical Notes
- Meshes are built with **per-face vertices** (24 vertices for 6 faces) to ensure correct flat-shaded normals
- Both **X-width and Z-depth taper** from bottom to top, creating true truncated pyramid / frustum shapes (not just a box with different x-widths)
- The depth tapers proportionally to the width ratio (`topDepth = depth * (topWidth / bottomWidth)`)
- Inverted trapezoids (RETURN) swap top/bottom dimensions for a "capstone" silhouette

---

## Implementation Architecture

### File Structure
```
mosiacs/
├── index.html       # Main HTML with UI and scene canvas
├── main.js          # Application entry point and event handlers
├── parser.js        # Parses trace format into structured data
├── visualizer.js    # Babylon.js scene creation and rendering
├── AGENTS.md        # This file - project documentation
└── README.md        # User-facing documentation
```

### Key Classes

**`CodeParser`**
- Parses trace strings into structured objects
- Maps operation types to colors
- Provides example traces for testing

**`CodeVisualizer`**
- Initializes Babylon.js engine and scene
- Creates camera, lights, and effects (glow layer)
- Generates spiral path from trace data
- Creates 3D buildings for each operation
- Manages animations and interactions

---

## Creative Freedom & Future Directions

### You Are Encouraged To:

1. **Experiment with Building Shapes**
   - Different geometries for different operations (boxes, cylinders, pyramids)
   - More complex structures for function calls (towers, cathedrals)
   - Smaller markers for simple assignments

2. **Enhance the Path**
   - Add decorative elements (rails, arches, gates)
   - Particle effects following execution flow
   - Glowing trail showing most recent operations

3. **Improve Interactivity**
   - Click buildings to see operation details
   - Hover effects with tooltips
   - Timeline scrubber to replay execution
   - Zoom to specific operations

4. **Add Visual Metaphors**
   - Loops could spiral tighter or create sub-spirals
   - Function calls could branch off the main path
   - Conditional branches could split the path temporarily
   - Memory addresses could create connections between buildings

5. **Advanced Effects**
   - Caustics (light through glass)
   - Reflections and refractions
   - Dynamic lighting based on execution "heat"
   - Sound design (gentle chimes per operation)

### Design Principles to Follow:

✅ **DO:**
- Keep it beautiful and calming
- Make the spiral prominent and easy to follow
- Use color meaningfully
- Animate smoothly and subtly
- Provide clear camera controls
- Make it feel cathedral-like and reverent

❌ **AVOID:**
- Overwhelming chaos or visual noise
- Harsh, jarring colors
- Too much animation (keep it zen)
- Making the UI obtrusive
- Losing the core spiral metaphor

---

## Testing & Development

### Current Example
The default example visualizes a simple sum loop:
```c
int main() {
    int sum = 0;
    for(int i = 0; i < 5; i++) {
        sum += i;
    }
    return 0;
}
```

### Next Steps for Testing
1. Create more complex traces (nested loops, recursion, branching)
2. Test with real C programs using a tracer tool
3. Handle edge cases (very long traces, deeply nested code)
4. Optimize performance for 1000+ operations

---

## Philosophy

> "Code is poetry, and execution is dance. Let's make it visible."

This project bridges the gap between the abstract world of programming and the tangible world of art. By visualizing code execution as a physical journey through a beautiful space, we:

- Make debugging more intuitive
- Help learners understand program flow
- Celebrate the elegance of well-written code
- Create artifacts worth sharing and discussing

**Your mission**: Continue building this bridge between art and code, always keeping both beauty and utility in mind.

---

## Questions to Consider

As you develop:
- How can we make loops more visually distinct from linear execution?
- What would recursion look like? (Spirals within spirals?)
- How can we show the relationship between variables at the same memory location?
- What camera animations would help tell the "story" of execution?
- How can we make this tool useful for teaching programming concepts?

---

*Built with 💎✨ - Where code becomes cathedral*