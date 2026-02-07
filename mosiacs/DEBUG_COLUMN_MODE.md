# Debug Column Mode for Shattered Pieces

## Overview
The Debug Column Mode is a new feature that allows developers to easily inspect the shattered pieces (variable data) from exploded buildings by displaying them in a vertical column on the side of the screen, always visible in front of the camera.

## Feature Description

When you click on a building to explode it, the shattered pieces represent variables and data from that code block. In normal mode, these pieces fly outward in rings around the building. In **Debug Column Mode**, they instead fly to the right side of your screen and arrange themselves in a neat vertical column that:

1. **Stays in front of the camera** - The pieces are parented to the camera, so they move with your view
2. **Always visible** - Positioned on the right side of the screen in your field of view
3. **Organized vertically** - Arranged in a column from top to bottom for easy reading
4. **Easy to inspect** - All pieces are clearly visible without needing to rotate the camera

## How to Use

### Toggle Debug Column Mode
You can toggle between Debug Column Mode and the original ring explosion mode:

```javascript
// From the browser console or your UI code:
visualizer.toggleDebugColumnMode();
```

This will return `true` if debug mode is now ON, or `false` if it's now OFF.

### Default Mode
By default, **Debug Column Mode is ENABLED** (`debugColumnMode = true`). This makes it easier for developers to debug and inspect variable data.

### Switching Modes
- **Debug Mode ON**: Shards fly to a vertical column on the right side of the screen
- **Debug Mode OFF**: Shards explode in concentric rings around the building (original behavior)

## Implementation Details

### Key Changes in `ExplodeManager.js`

1. **New Property**: `debugColumnMode` (boolean, default: `true`)
2. **Toggle Method**: `toggleDebugMode()` switches between modes
3. **Shard Positioning**: 
   - Debug mode: Calculates position relative to camera using camera's right, up, and forward vectors
   - Normal mode: Uses original ring-based positioning
4. **Shard Parenting**: Shards remain in world space in both modes (no camera parenting)
5. **Animation**: Different animation logic for each mode
   - Debug: Animates in world space to a vertical column beside the building
   - Normal: Animates in world space to concentric rings
6. **Camera Behavior**: 
   - Debug mode: Camera moves to view the building + column (outside the spiral)
   - Normal mode: Camera zooms to view the explosion

### Configuration Parameters (in `_calcDebugColumnTarget`)

```javascript
const maxColumnHeight = 14;     // Max world-space height for the column
const defaultSpacing = 1.8;     // Default spacing (auto-shrinks for many shards)
const rightOffset = 6;          // How far to the right of the building
```

You can adjust these values to customize the column position and spacing.

## Benefits for Developers

1. **Better Debugging**: All variable data is clearly visible without navigation
2. **Persistent View**: Shards stay in view as you rotate/pan the camera
3. **Organized Layout**: Vertical column is easier to read than scattered rings
4. **Quick Inspection**: No need to zoom/rotate to see all pieces
5. **Toggle-able**: Can switch back to artistic ring view when needed

## Example Usage in UI

You can add a button to your HTML interface:

```html
<button id="toggleDebugBtn">Toggle Debug Column Mode</button>
```

```javascript
document.getElementById('toggleDebugBtn').addEventListener('click', () => {
    const debugMode = visualizer.toggleDebugColumnMode();
    console.log(`Debug Column Mode: ${debugMode ? 'ON' : 'OFF'}`);
});
```

## Visual Comparison

### Debug Column Mode (ON)
```
                    ┌─────────────┐
                    │ CALL main   │ ← Header
                    ├─────────────┤
                    │ DECL x = 5  │ ← Variable 1
                    ├─────────────┤
                    │ @0x1234...  │ ← Address
                    ├─────────────┤
                    │ line 10     │ ← Line number
      [Camera View] ├─────────────┤
                    │ ASSIGN y=10 │ ← Variable 2
                    └─────────────┘
```

### Normal Mode (OFF)
```
      ╱─────╲
    ╱   ╱─╲   ╲      Shards arranged
   │   │   │   │  ← in concentric rings
    ╲   ╲─╱   ╱      around building
      ╲─────╱
```

## Technical Notes

- Shards use billboard mode to always face the camera
- In debug mode, shards use camera-local coordinates
- Animation uses Babylon.js Animation system with cubic easing
- Parent-child relationship ensures shards follow camera movement
- Cleanup properly handles both parented and non-parented shards

## Future Enhancements

Possible improvements:
- Adjustable column position (left/right/top/bottom)
- Keyboard shortcuts for toggling
- Multiple columns for many shards
- Pinning specific shards
- Filter/search functionality for shard content
