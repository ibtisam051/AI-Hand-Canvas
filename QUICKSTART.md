# 🚀 Quick Start Guide - Air-Draw v2.0

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm start
```

The app will open at `http://localhost:3000`

### 3. Build for Production
```bash
npm run build
```

---

## First Time Setup

### Camera Permissions
- Allow browser access to webcam when prompted
- Ensure camera is working (test with another app first)

### Hand Position
- Position hand 30-60cm from camera
- Keep fingers clear and visible
- Ensure good lighting (natural light preferred)

---

## Interface Guide

### Left Panel (Controls)
| Section | Function |
|---------|----------|
| **Live Camera** | Shows real-time hand tracking |
| **Gesture Detection** | Current gesture + confidence/stability |
| **Capture Controls** | Start/Stop hand tracking |
| **Color & Brush** | Pick color, adjust brush size (1-20px) |
| **Drawing Tools** | Undo/Redo functionality |
| **Save Options** | Export as PNG or JSON |
| **Settings** | View app statistics |

### Main Canvas
- **Bottom Left**: Gesture guide and controls legend
- **Bottom Right**: Clear canvas button
- **Top Right**: Canvas info (size & brush px)

---

## Quick Gestures

### Drawing
```
Index Finger Up ☝️
└─ Click to draw with selected color
```

### Color Change
```
Two Fingers Up ✌️
└─ Raise index + middle finger for 1 second
└─ Color changes automatically
```

### Clear Canvas
```
Three Fingers Up 🤟
└─ Raise index + middle + ring for 1 second
└─ Entire canvas clears
```

### Space/Separator
```
Open Palm 🖐️
└─ Extend all 5 fingers
└─ Stops current stroke (adds space)
```

### Pause
```
Closed Fist ✊
└─ Make a fist
└─ Pauses drawing
```

---

## Tips & Tricks

### For Better Gesture Detection:
- ✅ Face camera directly
- ✅ Use good lighting (avoid backlight)
- ✅ Keep hand steady when executing gesture
- ✅ Keep fingers clearly separated
- ✅ Avoid rapid hand movements initially

### Drawing Tips:
- 📝 Start with brush size 3-5px for thin lines
- 🎨 Experiment with different colors
- 🔄 Use Undo frequently while learning
- 💾 Save your work often
- 📏 Larger movements = faster drawing

### Performance:
- 🚀 Close unnecessary browser tabs
- 💻 Use modern browser (Chrome/Edge recommended)
- 🔌 Use hardwired internet if available
- ⚡ Ensure adequate system RAM (4GB minimum)

---

## Troubleshooting

### Hand Not Detected
1. Check webcam permissions
2. Improve lighting
3. Ensure hand is 30-60cm away
4. Restart the app

### Drawing Jumpy/Shaky
1. Hold hand more steady
2. Move slower
3. Increase brush size for better visibility

### Color Won't Change
1. Ensure both fingers are fully extended
2. Wait full 1 second between gestures
3. Check confidence bar (should be > 80%)
4. Try again

### Undo/Redo Not Working
1. You must complete a stroke first
2. Check "Settings" for drawing state count
3. Maximum 30 undo states available
4. Clear canvas to reset

### Export Not Working
1. Check browser download folder
2. Allow pop-ups if prompted
3. Ensure sufficient disk space
4. Try different file format

---

## Keyboard Shortcuts (Future)
- Ctrl+Z: Undo
- Ctrl+Y: Redo
- Delete: Clear Canvas
- S: Save PNG
- J: Save JSON

*(Currently requires UI clicks)*

---

## Advanced Features

### Drawing History
- Automatically saves after each stroke
- Max 30 states stored (oldest removed when limit reached)
- View current state count in Settings

### Gesture Confidence
- Shows detection reliability (0-100%)
- Green bar = reliable detection
- Red bar = unreliable (try again)

### Hand Stability
- Measures hand position consistency
- Higher = steadier hand
- Good for precision drawing

### Color Palette
- Click color square to pick custom color
- Two-finger gesture cycles through palette
- Palette auto-generates from selected color

---

## Export Formats

### PNG
- **Format**: Standard image file
- **Size**: Full canvas resolution (900x600px)
- **Use**: Share drawings, print, social media

### JSON
- **Format**: Text with metadata
- **Includes**: Timestamp, canvas size, brush settings
- **Use**: Backup, future editing, documentation

---

## Keyboard & Mouse Support

### Currently Supported:
- Mouse drawing (with index finger position)
- Trackpad support
- Touch screen support (experimental)

### Not Supported:
- Stylus pressure
- Multi-touch gestures
- Keyboard shortcuts (planned)

---

## Browser Requirements

### Recommended:
- Chrome 90+ (best support)
- Edge 90+
- Firefox 88+
- Safari 14+

### Requirements:
- WebGL support
- Webcam access
- JavaScript enabled
- 4GB+ RAM
- Stable internet (for model loading)

---

## Performance Metrics

### Typical Performance:
- **Hand Detection**: ~30ms per frame
- **Drawing Frame Rate**: 30-60 FPS
- **Model Loading**: 2-5 seconds
- **Memory Usage**: 150-250MB

---

## Settings & Configuration

### In-App Settings:
- Brush size: 1-20px (adjustable)
- Color: 16 million+ colors (full hex range)
- Canvas size: 900x600px (fixed)
- Gesture cooldown: 1000ms (fixed)
- Max history: 30 states (hardcoded)

### To Customize Code:
See `IMPROVEMENTS.md` for detailed configuration options

---

## Frequently Asked Questions

**Q: Can I draw with multiple hands?**
A: Not yet - detection is limited to 1 hand. Multi-hand support is planned.

**Q: Is my video recorded?**
A: No - all processing is local. Your camera feed never leaves your computer.

**Q: Can I use touch screen?**
A: Partially - hand tracking still requires webcam. Touch is experimental.

**Q: What if I mess up?**
A: Click Undo! You have up to 30 undo states.

**Q: Can I edit exported PNG?**
A: Yes - open in any image editor (Photoshop, GIMP, Paint, etc.)

**Q: How do I reload the app?**
A: Press F5 or Ctrl+R in your browser.

---

## Version History

### v2.0 - AI-Enhanced Edition (Current)
✅ Advanced gesture detection with confidence scoring
✅ Improved UI/UX with control panel
✅ Undo/Redo functionality
✅ Export as PNG/JSON
✅ Real-time gesture visualization
✅ Hand stability measurement
✅ Brush size customization

### v1.0 - Initial Release
- Basic gesture drawing
- Color changing
- Canvas clearing

---

## Support & Feedback

For bug reports or feature requests:
1. Check this guide and `IMPROVEMENTS.md`
2. Check browser console (F12) for errors
3. Test with different hand positions
4. Verify system meets requirements

---

## License
MIT License - Free to use and modify

---

**Happy Drawing! 🎨✨**

*Last Updated: April 2026*
