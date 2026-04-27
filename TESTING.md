# Testing & Validation Guide

## Pre-Launch Testing Checklist

### 1. Environment Setup

- [ ] Node.js 14+ installed (`node -v`)
- [ ] npm 6+ installed (`npm -v`)
- [ ] Git installed (optional)
- [ ] 4GB+ RAM available
- [ ] Good internet connection (for model loading)
- [ ] Webcam working and accessible
- [ ] Modern browser (Chrome/Edge recommended)

### 2. Installation Verification

```bash
# Steps to verify
cd Air-Draw-React-App
npm install
npm start
```

- [ ] No errors during `npm install`
- [ ] No errors during `npm start`
- [ ] App opens at `http://localhost:3000`
- [ ] Browser console has no critical errors (F12)
- [ ] Camera access prompt appears

### 3. Camera & Hand Detection

- [ ] Camera permission granted
- [ ] Camera feed shows in left panel
- [ ] Camera feed is horizontally flipped
- [ ] Hand is visible in camera
- [ ] Wait 2-3 seconds for MediaPipe to load
- [ ] Hand landmarks appear (if visible in browser DevTools)

---

## Gesture Detection Testing

### Test 1: Index Finger Drawing

**Steps:**
1. Raise only index finger (keep others down)
2. Move hand around canvas
3. Gesture display should show "Drawing ✍️"
4. Canvas should show white line/dots

**Expected Results:**
- ✅ Gesture confidence > 80%
- ✅ Stability > 60%
- ✅ Lines appear on canvas
- ✅ Lines are smooth (no jumps)
- ✅ Line color matches selected color

**If Fails:**
- Check lighting (too dark?)
- Move hand closer (30-60cm)
- Keep fingers clearly separated
- Ensure good contrast

### Test 2: Two Finger Color Change

**Steps:**
1. Raise index and middle fingers
2. Keep for 1 second
3. Watch color square (top left)
4. Color should change
5. Repeat 2-3 times

**Expected Results:**
- ✅ Gesture shows "Change Color ✌️"
- ✅ Confidence > 80%
- ✅ Color square changes color
- ✅ New drawings use new color
- ✅ Cooldown prevents rapid changes

**If Fails:**
- Check that both fingers are extended
- Hold gesture for full 1 second
- Try slower, more deliberate motion
- Increase gesture cooldown if too sensitive

### Test 3: Three Finger Clear

**Steps:**
1. Draw something on canvas
2. Raise index, middle, and ring fingers
3. Hold for 1 second
4. Canvas should clear

**Expected Results:**
- ✅ Gesture shows "Clear Canvas 🤟"
- ✅ Confidence > 75%
- ✅ Canvas becomes white/empty
- ✅ Color square still shows current color
- ✅ Can draw again immediately

**If Fails:**
- Ensure 3 fingers are clearly extended
- Try holding gesture longer
- Check that pinky and thumb are down
- Verify gesture wasn't triggered too recently

### Test 4: Open Palm

**Steps:**
1. Draw a line (index finger up)
2. Extend all 5 fingers (open palm)
3. Continue drawing (index up again)
4. Should have gap between strokes

**Expected Results:**
- ✅ Gesture shows "Space 🖐️"
- ✅ Line stops
- ✅ Can start new line immediately
- ✅ No connection between lines

**If Fails:**
- Make sure all 5 fingers are clearly extended
- Try slower motion to extend fingers
- Check thumb is fully extended

### Test 5: Closed Fist Pause

**Steps:**
1. Start drawing (index up)
2. Make a fist (curl all fingers)
3. Raise index again
4. Continue drawing

**Expected Results:**
- ✅ Gesture shows "Stop Drawing ✊"
- ✅ Drawing stops when fist made
- ✅ Drawing resumes when index raised
- ✅ No accidental marks

**If Fails:**
- Ensure all fingers are curled
- Try more gradual motion
- Check lighting

---

## Drawing Features Testing

### Test 6: Brush Size Control

**Steps:**
1. Adjust brush size slider (1-20px)
2. Watch brush preview circle
3. Draw with different sizes
4. Check line thickness

**Expected Results:**
- ✅ Preview circle changes size
- ✅ Label shows correct px value
- ✅ Lines drawn match brush size
- ✅ Thick lines with size 15-20
- ✅ Thin lines with size 1-3

**If Fails:**
- Slider may be non-responsive (try double-click)
- Check that drawing is happening
- Try different colors to verify

### Test 7: Color Picker

**Steps:**
1. Click color square (top left of canvas)
2. Color picker should open
3. Select different colors
4. Draw and verify colors

**Expected Results:**
- ✅ Color picker dialog opens
- ✅ Can select any color
- ✅ Hex code updates
- ✅ Square preview updates
- ✅ Drawings use selected color

**If Fails:**
- Click exactly on color square
- Try clicking color label instead
- Check browser supports color input
- Verify JavaScript is enabled

### Test 8: Undo/Redo Functionality

**Steps:**
1. Draw 3-4 strokes
2. Click Undo button
3. First stroke disappears
4. Click Undo again
5. Second stroke disappears
6. Click Redo button
7. Second stroke reappears
8. Click Redo again
9. First stroke reappears

**Expected Results:**
- ✅ Undo button disabled initially
- ✅ Undo enabled after first stroke
- ✅ Redo disabled after undo
- ✅ Each undo removes one stroke
- ✅ Each redo restores one stroke
- ✅ Maximum 30 undo states
- ✅ Redo cleared after new drawing

**If Fails:**
- Ensure stroke is completed (index finger down)
- Buttons might be disabled (check)
- Try drawing longer strokes
- Check Settings for state count

### Test 9: Clear Canvas Button

**Steps:**
1. Draw on canvas
2. Click "🗑️ Clear Canvas" button
3. Entire canvas should clear

**Expected Results:**
- ✅ Canvas becomes white
- ✅ Undo history reset
- ✅ All drawings removed
- ✅ Can draw immediately after
- ✅ Undo button disabled again

**If Fails:**
- Button might be hard to click (try again)
- Check that drawing exists first
- Verify gesture detected or button clicked

---

## UI/UX Testing

### Test 10: Control Panel Layout

**Check Elements:**
- [ ] Left panel visible (dark background)
- [ ] Camera feed visible
- [ ] Gesture display visible
- [ ] Confidence bar visible
- [ ] Stability bar visible
- [ ] Start/Stop buttons visible
- [ ] Color & brush section visible
- [ ] Brush size slider visible
- [ ] Brush preview visible
- [ ] Undo/Redo buttons visible
- [ ] Save buttons visible
- [ ] Settings button visible

**If Layout Issues:**
- Zoom to 100% (Ctrl+0)
- Maximize browser window
- Try different screen resolutions
- Check scrolling in left panel

### Test 11: Visual Feedback

**Check:**
- [ ] Gesture text updates (test all 5 gestures)
- [ ] Confidence bar fills (0-100%)
- [ ] Stability bar fills (0-100%)
- [ ] Color square shows current color
- [ ] Brush preview circle updates size
- [ ] Status text shows "Capturing Hand" when active
- [ ] Error messages appear clearly
- [ ] Disabled buttons are grayed out

**If Feedback Missing:**
- Perform gesture slowly (3-5 seconds)
- Check gesture is recognized
- Try different hand positions
- Refresh page (F5)

### Test 12: Button Responsiveness

**Test All Buttons:**
- [ ] Start button (should disable after click)
- [ ] Stop button (should enable after click)
- [ ] Undo button (enable/disable correctly)
- [ ] Redo button (enable/disable correctly)
- [ ] Save PNG button (should download)
- [ ] Save JSON button (should download)
- [ ] Settings button (toggles settings panel)
- [ ] Clear Canvas button (clears canvas)
- [ ] Color picker button (opens picker)

**If Button Unresponsive:**
- Click directly on button center
- Wait 100ms between clicks
- Check JavaScript console for errors
- Try different browser

---

## Export/Save Testing

### Test 13: PNG Export

**Steps:**
1. Draw something on canvas
2. Click "📥 Save as PNG"
3. Check Downloads folder
4. Open PNG in image viewer

**Expected Results:**
- ✅ File downloads automatically
- ✅ Filename: `drawing-YYYY-MM-DD.png`
- ✅ File size: 5-50 KB
- ✅ Image opens correctly
- ✅ Drawing visible in image
- ✅ No artifacts or corruption
- ✅ Colors match canvas

**If PNG Export Fails:**
- Check browser download settings
- Verify Downloads folder has space
- Try different browser
- Allow pop-ups if prompted

### Test 14: JSON Export

**Steps:**
1. Draw something
2. Click "💾 Save as JSON"
3. Check Downloads folder
4. Open JSON in text editor

**Expected Results:**
- ✅ File downloads
- ✅ Filename: `drawing.json`
- ✅ File size: ~5 KB + image size
- ✅ Valid JSON (parseable)
- ✅ Contains timestamp
- ✅ Contains dimensions (900x600)
- ✅ Contains brush settings
- ✅ Contains base64 image data

**If JSON Export Fails:**
- Same troubleshooting as PNG
- Check that drawing exists
- Verify free disk space

---

## Performance Testing

### Test 15: Startup Performance

**Measure:**
1. Note time app loads
2. Note time camera appears
3. Note time model loads

**Expected Times:**
- ✅ App loads: < 3 seconds
- ✅ Camera appears: < 2 seconds
- ✅ Model loads: 2-5 seconds
- ✅ Hand detected: < 3 seconds after

**If Slow:**
- Close other apps
- Clear browser cache
- Check internet speed
- Use wired connection
- Try different browser

### Test 16: Drawing Performance

**Test:**
1. Draw continuously for 30 seconds
2. Monitor for lag or stuttering
3. Test with brush size 1 and 20

**Expected:**
- ✅ Smooth lines (no jumps)
- ✅ Frame rate: 30+ FPS
- ✅ No lag or stuttering
- ✅ Responsive to gestures
- ✅ Works equally at size 1 and 20

**If Performance Issues:**
- Close other apps
- Reduce browser zoom
- Lower system display quality
- Restart application

### Test 17: Memory Usage

**Test:**
1. Draw many strokes (100+)
2. Use 30 undo states
3. Monitor browser memory (F12 → Memory)
4. Run for 10+ minutes

**Expected:**
- ✅ Starts: 150-200 MB
- ✅ After 100 strokes: 200-250 MB
- ✅ Stays stable (no infinite growth)
- ✅ Undo history limited to 30 states

**If Memory Issues:**
- Check for memory leaks in browser
- Restart application
- Clear browser cache
- Reduce undo history size (in code)

---

## Cross-Browser Testing

### Test 18: Browser Compatibility

Test in each browser:

**Chrome/Edge/Brave:**
- [ ] App loads
- [ ] Webcam works
- [ ] Hand detection works
- [ ] Drawing smooth
- [ ] Exports work
- [ ] No console errors

**Firefox:**
- [ ] App loads
- [ ] Webcam works
- [ ] Hand detection works
- [ ] Drawing smooth
- [ ] Exports work
- [ ] Performance similar to Chrome

**Safari (Mac):**
- [ ] App loads
- [ ] HTTPS required for webcam
- [ ] Hand detection works
- [ ] Slightly slower (normal)
- [ ] Exports work

**If Browser Issues:**
- Update to latest version
- Disable ad blockers
- Clear cache/cookies
- Try private/incognito window

---

## Error Handling Testing

### Test 19: Error Recovery

**Scenarios:**
1. Disconnect webcam → App should show error
2. Close/reopen camera → Should recover
3. Network dropout → Model might reload
4. Gesture not detected → Show "No hand"
5. Failed export → Show error message

**Expected Behavior:**
- ✅ Clear error messages
- ✅ App doesn't crash
- ✅ Can recover without reload
- ✅ Errors logged to console
- ✅ UI remains responsive

**If Issues:**
- Check browser console (F12)
- Read error message carefully
- Check internet connection
- Refresh if completely stuck

### Test 20: Edge Cases

**Test:**
1. Very fast hand movements
2. Hand out of frame
3. Partial hand visible
4. Multiple gesture overlaps
5. Rapid clicks (spamming buttons)
6. Very large/small hand
7. Wearing gloves

**Expected:**
- ✅ App doesn't crash
- ✅ Graceful degradation
- ✅ No false positives
- ✅ Buttons debounced
- ✅ Reasonable behavior

---

## Accessibility Testing

### Test 21: Keyboard Navigation

- [ ] Tab through all buttons
- [ ] Enter activates buttons
- [ ] Can tab to color picker
- [ ] Can tab to slider
- [ ] Focus indicators visible

### Test 22: Screen Reader (NVDA/JAWS)

- [ ] Buttons have labels
- [ ] Images have alt text
- [ ] Status messages announced
- [ ] Errors announced clearly

### Test 23: Color Contrast

- [ ] Text readable on backgrounds
- [ ] Buttons distinguishable
- [ ] Color indicators clear
- [ ] No issues for colorblind users

---

## Regression Testing

### Before Deployment:

Run through all 23 tests:
- [ ] All tests passed
- [ ] No new bugs introduced
- [ ] Performance acceptable
- [ ] No breaking changes

---

## Test Automation Scripts

### Simple Test Script

```javascript
// Open browser console (F12) and paste:

async function testApp() {
  console.log('Testing Air-Draw App...');
  
  // Check DOM elements
  const canvas = document.querySelector('canvas');
  const buttons = document.querySelectorAll('button');
  const video = document.querySelector('video');
  
  console.log(`✓ Canvas found: ${!!canvas}`);
  console.log(`✓ Buttons found: ${buttons.length}`);
  console.log(`✓ Video found: ${!!video}`);
  
  // Check dimensions
  if (canvas) {
    console.log(`✓ Canvas size: ${canvas.width}x${canvas.height}`);
  }
  
  console.log('Basic tests complete!');
}

testApp();
```

---

## Performance Profiling

### Using Chrome DevTools

1. Open DevTools (F12)
2. Go to Performance tab
3. Click Record
4. Draw 5 strokes
5. Stop recording
6. Analyze frame rate

**Good Performance:**
- 30+ FPS (mostly green)
- <16ms per frame
- No long tasks

---

## Final Checklist

Before considering app "ready":

- [ ] All 23 tests passed
- [ ] No console errors
- [ ] Performance acceptable (30+ FPS)
- [ ] Memory stable
- [ ] Cross-browser tested
- [ ] Export works
- [ ] Documentation complete
- [ ] Code commented
- [ ] No security issues

---

**Testing Guide Complete ✅**

*Run through all tests before deploying to users*

*Last Updated: April 2026*
