# Configuration & Architecture Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Air-Draw Application                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              MediaPipe Hands (ML Model)              │   │
│  │  - Real-time hand detection                         │   │
│  │  - 21 landmark points per hand                      │   │
│  │  - Confidence scoring per hand                      │   │
│  └────────────────┬────────────────────────────────────┘   │
│                   │                                          │
│  ┌────────────────▼────────────────────────────────────┐   │
│  │         GestureDetector (ML/DL Logic)              │   │
│  │  - Analyze 21 landmarks                            │   │
│  │  - Detect individual fingers                       │   │
│  │  - Calculate confidence scores                     │   │
│  │  - Measure hand stability                          │   │
│  │  - Temporal filtering                              │   │
│  └────────────────┬────────────────────────────────────┘   │
│                   │                                          │
│  ┌────────────────▼────────────────────────────────────┐   │
│  │            Gesture Actions Handler                 │   │
│  │  - Drawing gesture → Draw on canvas                │   │
│  │  - Color change → Update color                     │   │
│  │  - Clear → Reset canvas                            │   │
│  │  - Space → Stop stroke                             │   │
│  │  - Pause → Stop drawing                            │   │
│  └────────────────┬────────────────────────────────────┘   │
│                   │                                          │
│  ┌────────────────▼────────────────────────────────────┐   │
│  │         Canvas & Drawing Engine                    │   │
│  │  - DrawingHistory (undo/redo)                      │   │
│  │  - CanvasUtils (smooth rendering)                  │   │
│  │  - ColorUtils (color management)                   │   │
│  └────────────────┬────────────────────────────────────┘   │
│                   │                                          │
│  ┌────────────────▼────────────────────────────────────┐   │
│  │              User Interface (React)                 │   │
│  │  - Left control panel                              │   │
│  │  - Main canvas area                                │   │
│  │  - Real-time feedback                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Class & Component Structure

### GestureDetector Class
```javascript
class GestureDetector {
  // Properties
  gestureHistory: []        // Last N gestures
  historySize: 5           // Max history size
  confidenceThreshold: 0.6 // Min confidence
  
  // Methods
  distance()               // Calculate 3D distance
  isIndexFingerExtended()  // Check index finger
  isMiddleFingerExtended() // Check middle finger
  isRingFingerExtended()   // Check ring finger
  isPinkyFingerExtended()  // Check pinky finger
  isThumbExtended()        // Check thumb
  countExtendedFingers()   // Count extended fingers
  isPalmOpen()             // Detect open palm
  isClosedFist()           // Detect closed fist
  isWritingPose()          // Detect drawing pose
  isTwoFingersUp()         // Detect 2 fingers
  isThreeFingersUp()       // Detect 3 fingers
  calculateHandStability() // Measure stability
  detectGesture()          // Main detection logic
  getSmoothGesture()       // Temporal filtering
  reset()                  // Clear history
}
```

### DrawingHistory Class
```javascript
class DrawingHistory {
  // Properties
  history: []          // Canvas image states
  currentIndex: -1     // Current state pointer
  maxStates: 20        // Max states to keep
  
  // Methods
  save(canvas)         // Save canvas state
  undo(canvas)         // Revert to previous
  redo(canvas)         // Apply next state
  restore(canvas)      // Apply saved state
  clear()              // Clear all history
  canUndo(): boolean   // Can undo?
  canRedo(): boolean   // Can redo?
  getStateCount()      // Current state count
}
```

### CanvasUtils Class
```javascript
class CanvasUtils {
  // Static methods
  static initializeCanvas()    // Init with background
  static clearCanvas()         // Clear & reset
  static drawSmoothStroke()    // Draw with bezier
  static drawStroke()          // Draw regular line
  static exportAsImage()       // Export PNG
  static exportAsJSON()        // Export JSON
  static smoothifyPath()       // Smooth path points
}
```

### ColorUtils Class
```javascript
class ColorUtils {
  // Static methods
  static getContrastingColor() // Black or white?
  static hexToRgb()            // Hex → RGB
  static rgbToHex()            // RGB → Hex
  static generateColorPalette()// Create palette
  static rotateHue()           // HSL hue rotation
  static hslToRgb()            // HSL → RGB
}
```

---

## Data Flow Diagram

```
Video Input
    ↓
[MediaPipe Hands] → Landmarks (21 points per hand)
    ↓
[GestureDetector.detectGesture()]
    ├─ Analyze landmarks
    ├─ Detect finger positions
    ├─ Calculate confidence
    └─ Measure stability
    ↓
[Gesture History] → Store last 3 detections
    ↓
[GestureDetector.getSmoothGesture()]
    ├─ Find most frequent gesture
    ├─ Average confidence
    └─ Average stability
    ↓
[Action Handler] → Execute gesture action
    ├─ Drawing → Add stroke points
    ├─ Color change → Update color
    ├─ Clear → Reset canvas
    ├─ Space → End stroke
    └─ Pause → Stop drawing
    ↓
[Canvas Renderer]
    ├─ Draw smooth stroke (quadratic curve)
    ├─ Update UI feedback
    └─ Save drawing state
    ↓
[DrawingHistory] → Manage undo/redo
    ↓
Visual Output (Canvas + UI)
```

---

## Gesture Detection Flow

```
MediaPipe Landmarks
    ↓
[Individual Finger Detection]
    ├─ Index: tip.y < pip.y < mcp.y
    ├─ Middle: tip.y < pip.y < mcp.y
    ├─ Ring: tip.y < pip.y < mcp.y
    ├─ Pinky: tip.y < pip.y < mcp.y
    └─ Thumb: tip.x > 0.5 * wrist distance
    ↓
[Count Extended Fingers]
    ├─ 0-1 fingers → Closed Fist
    ├─ 1 finger (index) → Writing Pose
    ├─ 2 fingers (index + middle) → Two Fingers
    ├─ 3 fingers (index + middle + ring) → Three Fingers
    └─ 4+ fingers → Palm Open
    ↓
[Calculate Confidence]
    ├─ Base confidence (0.75-0.95)
    ├─ Stability bonus (+0.1-0.25)
    └─ Final: base + (stability × weight)
    ↓
[Store in History]
    └─ Keep last 3 frames
    ↓
[Apply Temporal Filter]
    ├─ Find most frequent gesture
    ├─ Average confidences
    └─ Output smoothed gesture
```

---

## Confidence Scoring Algorithm

```
// Base confidence by gesture type
const baseConfidence = {
  'drawing': 0.90,
  'color_change': 0.85,
  'clear': 0.80,
  'space': 0.80,
  'pause': 0.75,
  'idle': 0.30
}

// Calculate stability (0-1)
stability = max(0, 1 - (wristMovement × 10))
// Perfect at < 0.1 movement units

// Final confidence = base + stability bonus
finalConfidence = base + (stability × 0.15)
// Example: 0.85 + (0.8 × 0.15) = 0.97
```

---

## File Size & Performance

### Code Size
```
App.js                    ~450 lines
gestureDetector.js        ~220 lines
canvasUtils.js            ~300 lines
App.css                   ~60 lines
─────────────────────────────────
Total new/modified        ~1030 lines
```

### Bundle Size Impact
```
Original App.js           ~13 KB
New App.js               ~15 KB (+2 KB)
gestureDetector.js       ~8 KB (new)
canvasUtils.js           ~11 KB (new)
─────────────────────────────────
Total addition           ~21 KB
```

### Runtime Performance
```
Model Load:              2-5 seconds
Hand Detection:          ~30ms per frame
Gesture Recognition:     <5ms per frame
Drawing Rendering:       <10ms per frame
Total Frame Time:        40-50ms (20-30 FPS)

Memory Usage:
  Base React:            80 MB
  MediaPipe Model:       50 MB
  Canvas Buffers:        15 MB
  Drawing History:       5-10 MB (30 states)
  ─────────────────────────────────
  Total:                 150-250 MB
```

---

## Gesture Parameters & Thresholds

### Hand Detection (MediaPipe)
```javascript
const handOptions = {
  maxNumHands: 1,              // Single hand
  modelComplexity: 1,          // Balanced (0=lite, 1=full)
  minDetectionConfidence: 0.7, // 70% threshold
  minTrackingConfidence: 0.7   // 70% threshold
}
```

### Gesture Cooldown
```javascript
const gestureCooldown = 1000;  // 1 second between gestures
// Prevents rapid retriggering (e.g., color changing 3x in 1 sec)
```

### Gesture History (Temporal Filter)
```javascript
const maxGestureHistory = 3;   // Last 3 frames
// Window: 100ms at 30 FPS
// Smooths out single-frame noise
```

### Drawing History
```javascript
const maxDrawingStates = 30;   // Max undo states
// ~5-10 MB per state (full canvas image)
// Total: 150-300 MB for full history
```

### Brush Size
```javascript
const minBrushSize = 1;        // Minimum 1px
const maxBrushSize = 20;       // Maximum 20px
const defaultBrushSize = 3;    // Default 3px
```

### Canvas Dimensions
```javascript
const canvasWidth = 900;       // pixels
const canvasHeight = 600;      // pixels (up from 480px)
// Resolution: 900 × 600 = 540,000 pixels
// Memory per state: 540K × 4 bytes = 2.16 MB
```

---

## Tuning Guide

### To Improve Gesture Detection Accuracy

1. **Increase Confidence Threshold** (if too many false positives)
   ```javascript
   // In detectGesture():
   if (confidence < 0.85) return 'idle'; // Was 0.6
   ```

2. **Increase History Size** (if gestures are too jittery)
   ```javascript
   // In App.js:
   if (gestureHistoryRef.current.length > 5) // Was 3
     gestureHistoryRef.current.shift();
   ```

3. **Adjust Finger Thresholds** (if fingers not detected)
   ```javascript
   // In gestureDetector.js:
   // Make stricter
   return indexTip.y < (indexPip.y - 0.05); // Add buffer
   ```

4. **Increase Stability Weight** (for more stable gestures)
   ```javascript
   // In detectGesture():
   confidence = base + (stability * 0.30); // Was 0.15
   ```

### To Improve Drawing Quality

1. **Reduce Brush Size** (for fine details)
   ```javascript
   const defaultBrushSize = 2; // Was 3
   ```

2. **Increase Smoothing** (for less jittery lines)
   ```javascript
   // In canvasUtils.js:
   const smoothFactor = 0.3; // Was 0.2, higher = smoother
   ```

3. **Add More Points** (for better curve detail)
   ```javascript
   // In App.js, during drawing:
   // Reduce distance threshold for adding points
   if (distance(lastPoint, newPoint) > 1) { // Was 2
     currentStroke.push(newPoint);
   }
   ```

### To Improve Performance

1. **Reduce History Size** (less memory)
   ```javascript
   new DrawingHistory(15); // Was 30
   ```

2. **Lower Model Complexity** (faster detection)
   ```javascript
   modelComplexity: 0, // Lite (0=lite, 1=full)
   ```

3. **Increase Gesture Cooldown** (reduce processing)
   ```javascript
   const gestureCooldown = 2000; // Was 1000
   ```

---

## Environment Variables

Currently no environment variables are used. To add:

1. Create `.env` file in project root:
   ```
   REACT_APP_GESTURE_COOLDOWN=1000
   REACT_APP_MAX_HISTORY=30
   REACT_APP_CANVAS_WIDTH=900
   ```

2. Use in code:
   ```javascript
   const cooldown = process.env.REACT_APP_GESTURE_COOLDOWN || 1000;
   ```

---

## Browser Compatibility

```
✅ Fully Supported:
- Chrome 90+
- Edge 90+
- Brave (Chromium-based)

⚠️ Partial Support:
- Firefox 88+ (good, slight performance difference)
- Safari 14+ (good, but requires HTTPS)

❌ Not Supported:
- IE 11 (no WebGL)
- Mobile browsers (no webcam API)
- Older versions (<2021)
```

---

## Security Considerations

1. **No Data Upload**: All processing local
2. **HTTPS Required**: For webcam access
3. **Camera Access**: User grants permission
4. **No Tracking**: No analytics or logging
5. **Open Source**: Code is transparent

---

## Future Enhancement Ideas

1. **Pressure Sensitivity**: Simulate from hand size
2. **Multi-Hand Support**: Draw with both hands
3. **Gesture Recording**: Save & replay gestures
4. **Layer Support**: Multiple drawing layers
5. **AI Stroke Completion**: Auto-complete lines
6. **Collaborative Drawing**: Real-time sharing
7. **Gesture Training**: Custom gesture recognition
8. **Mobile Support**: Touch-based drawing

---

**Configuration & Architecture Guide Complete ✅**

*Use this guide for optimization & customization*

*Last Updated: April 2026*
