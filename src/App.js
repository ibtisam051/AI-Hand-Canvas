import React, { useEffect, useRef, useState, useCallback } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import GestureDetector from "./utils/gestureDetector";
import { DrawingHistory, CanvasUtils, ColorUtils } from "./utils/canvasUtils";
import "./App.css";

export default function App() {
  // Canvas and video refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);

  // Gesture and drawing state
  const gestureDetectorRef = useRef(new GestureDetector());
  const drawingHistoryRef = useRef(new DrawingHistory(30));
  const currentStrokeRef = useRef([]);
  const isDrawingRef = useRef(false);
  const lastGestureTimeRef = useRef(0);
  const gestureHistoryRef = useRef([]);
  const lastSavedStateRef = useRef(null);

  // UI State
  const [color, setColor] = useState("#ff007f");
  const [brushSize, setBrushSize] = useState(3);
  const [currentGesture, setCurrentGesture] = useState("Initializing...");
  const [gestureConfidence, setGestureConfidence] = useState(0);
  const [handStability, setHandStability] = useState(0);
  const [isCapturing, setIsCapturing] = useState(true);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [writingMode, setWritingMode] = useState(false);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = CanvasUtils.initializeCanvas(canvas, 'white');
    ctxRef.current = ctx;

    // Save initial state
    drawingHistoryRef.current.save(canvas);
    lastSavedStateRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }, []);

  const updateUndoRedoState = () => {
    setCanUndo(drawingHistoryRef.current.canUndo());
    setCanRedo(drawingHistoryRef.current.canRedo());
  };

  const clearCanvasAction = useCallback(() => {
    const canvas = canvasRef.current;
    CanvasUtils.clearCanvas(canvas, 'white');
    drawingHistoryRef.current.save(canvas);
    updateUndoRedoState();
    currentStrokeRef.current = [];
    isDrawingRef.current = false;
  }, []);

  // MediaPipe setup
  useEffect(() => {
    if (!isCapturing) return;

    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    if (!videoElement || !canvasElement) return;

    const ctx = ctxRef.current;
    if (!ctx) return;

    // Initialize MediaPipe Hands
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    const gestureCooldown = 1000; // 1 second cooldown between gestures
    const width = canvasElement.width;
    const height = canvasElement.height;

    hands.onResults((results) => {
      let detectedGesture = {
        gesture: 'idle',
        confidence: 0,
        description: 'No hand detected',
        stability: 0,
        palmPosition: { x: 0, y: 0 }
      };

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        detectedGesture = gestureDetectorRef.current.detectGesture(
          landmarks,
          width,
          height
        );
      }

      // Add to gesture history for temporal filtering
      gestureHistoryRef.current.push(detectedGesture);
      if (gestureHistoryRef.current.length > 3) {
        gestureHistoryRef.current.shift();
      }

      // Get smoothed gesture
      const smoothedGesture = gestureDetectorRef.current.getSmoothGesture(
        gestureHistoryRef.current
      );

      // Update UI with gesture info
      const gestureDesc = smoothedGesture.gesture === 'drawing'
        ? (writingMode ? 'Writing ✍️' : 'Drawing 🎨')
        : smoothedGesture.description;
      setCurrentGesture(gestureDesc);
      setGestureConfidence(smoothedGesture.confidence);
      setHandStability(smoothedGesture.stability);

      const now = Date.now();

      // Handle gestures
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        const indexTip = landmarks[8];

        // Use fingertip position for more precise drawing/writing
        const fingerTipPosition = {
          x: (1 - indexTip.x) * width,
          y: indexTip.y * height
        };

        // Drawing gesture - use fingertip for precision
        if (smoothedGesture.gesture === 'drawing') {
          const point = { x: fingerTipPosition.x, y: fingerTipPosition.y };

          if (!isDrawingRef.current) {
            currentStrokeRef.current = [point];
            isDrawingRef.current = true;
          } else {
            // Add smoothing for text writing - only add point if moved enough
            const lastPoint = currentStrokeRef.current[currentStrokeRef.current.length - 1];
            const distance = Math.sqrt(
              Math.pow(point.x - lastPoint.x, 2) + Math.pow(point.y - lastPoint.y, 2)
            );

            // Minimum distance threshold - smaller for writing mode for smoother text
            const minDistance = writingMode ? 1 : 2;
            if (distance > minDistance) {
              currentStrokeRef.current.push(point);
            }
          }

          // Use smaller brush size for writing mode
          const effectiveBrushSize = writingMode ? Math.max(1, brushSize * 0.5) : brushSize;

          CanvasUtils.drawSmoothStroke(
            ctx,
            currentStrokeRef.current,
            color,
            effectiveBrushSize
          );
        } else {
          // End drawing stroke
          if (isDrawingRef.current && currentStrokeRef.current.length > 0) {
            isDrawingRef.current = false;
            currentStrokeRef.current = [];
            // Save state after stroke
            drawingHistoryRef.current.save(canvasElement);
            updateUndoRedoState();
          }
        }

        // Color change gesture
        if (
          smoothedGesture.gesture === 'color_change' &&
          now - lastGestureTimeRef.current > gestureCooldown
        ) {
          const colorPalette = ColorUtils.generateColorPalette(color, 6);
          const currentIndex = colorPalette.indexOf(color);
          const newColor = colorPalette[(currentIndex + 1) % colorPalette.length];
          setColor(newColor);
          lastGestureTimeRef.current = now;
        }

        // Clear canvas gesture
        if (
          smoothedGesture.gesture === 'clear' &&
          now - lastGestureTimeRef.current > gestureCooldown
        ) {
          clearCanvasAction();
          lastGestureTimeRef.current = now;
        }

        // Space/separator gesture
        if (
          smoothedGesture.gesture === 'space' &&
          now - lastGestureTimeRef.current > gestureCooldown
        ) {
          if (isDrawingRef.current && currentStrokeRef.current.length > 0) {
            isDrawingRef.current = false;
            currentStrokeRef.current = [];
            drawingHistoryRef.current.save(canvasElement);
            updateUndoRedoState();
          }
          lastGestureTimeRef.current = now;
        }
      } else {
        // No hand detected
        if (isDrawingRef.current) {
          isDrawingRef.current = false;
          currentStrokeRef.current = [];
          drawingHistoryRef.current.save(canvasElement);
          updateUndoRedoState();
        }
      }
    });

    handsRef.current = hands;

    let camera = null;
    if (videoElement) {
      camera = new Camera(videoElement, {
        onFrame: async () => {
          try {
            await hands.send({ image: videoElement });
          } catch (err) {
            console.error("MediaPipe error:", err);
            setError("Hand detection failed. Please refresh the page.");
          }
        },
        width: 640,
        height: 480,
      });
      camera.start();
      cameraRef.current = camera;
    }

    return () => {
      camera?.stop();
      hands?.close();
    };
  }, [isCapturing, color, brushSize, clearCanvasAction, writingMode]);

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (drawingHistoryRef.current.undo(canvas)) {
      updateUndoRedoState();
    }
  };

  const handleRedo = () => {
    const canvas = canvasRef.current;
    if (drawingHistoryRef.current.redo(canvas)) {
      updateUndoRedoState();
    }
  };

  const handleSaveImage = () => {
    const canvas = canvasRef.current;
    const timestamp = new Date().toISOString().split('T')[0];
    CanvasUtils.exportAsImage(canvas, `drawing-${timestamp}.png`);
  };

  const handleSaveJSON = () => {
    const canvas = canvasRef.current;
    CanvasUtils.exportAsJSON(canvas, {
      color,
      brushSize,
      timestamp: new Date().toISOString()
    });
  };

  const startCapturing = async () => {
    setError(null);
    setIsCapturing(true);
  };

  const stopCapturing = () => {
    setIsCapturing(false);
    if (cameraRef.current) cameraRef.current.stop();
    if (handsRef.current) handsRef.current.close();
  };

  // Confidence bar component
  const ConfidenceBar = ({ value, label }) => (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-300 w-20">{label}:</span>
      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all"
          style={{ width: `${value * 100}%` }}
        />
      </div>
      <span className="text-xs text-gray-300 w-8">{(value * 100).toFixed(0)}%</span>
    </div>
  );

  return (
    <div className="flex w-screen h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white overflow-hidden">
      {/* Left Panel - Camera & Controls */}
      <div className="flex flex-col w-72 p-6 gap-4 bg-black/40 backdrop-blur-xl border-r border-white/10 overflow-y-auto">
        
        {/* Camera Feed */}
        <div>
          <h3 className="text-sm font-semibold mb-2 text-cyan-400">Live Camera</h3>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full rounded-lg shadow-lg border border-cyan-400/30 transform -scale-x-100"
          />
          <div className="text-xs text-gray-400 mt-2 text-center">Hand Tracking Feed</div>
        </div>

        {/* Gesture Detection */}
        <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 p-4 rounded-lg border border-blue-400/30">
          <h3 className="text-sm font-semibold mb-3 text-blue-300">Gesture Detection</h3>
          <div className="space-y-2">
            <p className="text-lg font-bold text-cyan-300">{currentGesture}</p>
            <ConfidenceBar value={gestureConfidence} label="Confidence" />
            <ConfidenceBar value={handStability} label="Stability" />
          </div>
        </div>

        {/* Writing Instructions */}
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 p-4 rounded-lg border border-purple-400/30">
          <h3 className="text-sm font-semibold mb-3 text-purple-300">How to Write Text</h3>
          <div className="text-xs text-gray-300 space-y-1">
            <p><strong>1.</strong> Switch to "✍️ Write" mode</p>
            <p><strong>2.</strong> Extend only your index finger</p>
            <p><strong>3.</strong> Use fingertip for precise control</p>
            <p><strong>4.</strong> Keep hand steady for best results</p>
            <p><strong>5.</strong> Try writing slowly and smoothly</p>
          </div>
        </div>

        {/* Capture Controls */}
        <div className="flex gap-2">
          <button
            onClick={startCapturing}
            disabled={isCapturing}
            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg text-sm font-semibold transition-all"
          >
            Start
          </button>
          <button
            onClick={stopCapturing}
            disabled={!isCapturing}
            className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg text-sm font-semibold transition-all"
          >
            Stop
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-600/20 border border-red-500/50 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Color Controls */}
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 p-4 rounded-lg border border-purple-400/30">
          <h3 className="text-sm font-semibold mb-3 text-purple-300">Color & Brush</h3>
          
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-lg border-2 border-white/50 shadow-lg cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              onClick={() => document.getElementById('colorPicker').click()}
              title="Click to pick color"
            />
            <input
              id="colorPicker"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="hidden"
            />
            <span className="text-xs text-gray-300 flex-1 font-mono">{color}</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-300">Brush Size: {brushSize}px</label>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            {/* Brush preview */}
            <div className="flex items-center justify-center h-12 bg-white/5 rounded-lg border border-white/10">
              <div
                className="rounded-full transition-all"
                style={{
                  width: brushSize * 2,
                  height: brushSize * 2,
                  backgroundColor: color
                }}
              />
            </div>
          </div>

          {/* Writing Mode Toggle */}
          <div className="space-y-2">
            <label className="text-xs text-gray-300">Drawing Mode</label>
            <div className="flex gap-2">
              <button
                onClick={() => setWritingMode(false)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  !writingMode
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                🎨 Draw
              </button>
              <button
                onClick={() => setWritingMode(true)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  writingMode
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                ✍️ Write
              </button>
            </div>
            <p className="text-xs text-gray-400">
              {writingMode ? 'Precise fingertip control for text writing' : 'Palm control for artistic drawing'}
            </p>
          </div>
        </div>

        {/* Drawing Tools */}
        <div className="flex gap-2">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-sm font-semibold transition-all"
          >
            ↶ Undo
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-sm font-semibold transition-all"
          >
            ↷ Redo
          </button>
        </div>

        {/* Save Options */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleSaveImage}
            className="w-full px-3 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm font-semibold transition-all"
          >
            📥 Save as PNG
          </button>
          <button
            onClick={handleSaveJSON}
            className="w-full px-3 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm font-semibold transition-all"
          >
            💾 Save as JSON
          </button>
        </div>

        {/* Settings */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition-all"
        >
          ⚙️ Settings
        </button>

        {showSettings && (
          <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-600/30 text-xs space-y-2">
            <p className="text-gray-300">
              <strong>Drawing States:</strong> {drawingHistoryRef.current.getStateCount()}
            </p>
            <p className="text-gray-300">
              <strong>Gesture Cooldown:</strong> 1000ms
            </p>
            <p className="text-gray-300">
              <strong>Max History:</strong> 30 states
            </p>
            <p className="text-gray-400 text-xs mt-2">
              💡 Tip: Use hand gestures to control drawing. Face the camera for better detection.
            </p>
          </div>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex justify-center items-center p-6 overflow-hidden">
        <div className="relative w-full h-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={900}
            height={600}
            className="absolute inset-0 w-full h-full cursor-crosshair"
          />

          {/* Gesture Guide */}
          <div className="absolute bottom-6 left-6 bg-gradient-to-br from-indigo-600 to-blue-600 backdrop-blur-md px-6 py-4 rounded-xl text-sm text-white font-semibold shadow-lg max-w-xs">
            <div className="mb-2">✨ Gesture Guide:</div>
            <div className="text-xs space-y-1 opacity-90">
              <p>👆 Index Up = Drawing</p>
              <p>✌️ Two Fingers = Change Color</p>
              <p>🤟 Three Fingers = Clear</p>
              <p>🖐️ Open Palm = Space</p>
              <p>✊ Closed Fist = Stop</p>
            </div>
          </div>

          {/* Clear Button */}
          <button
            onClick={clearCanvasAction}
            className="absolute bottom-6 right-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-6 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all hover:scale-105"
          >
            🗑️ Clear Canvas
          </button>

          {/* Top Info Bar */}
          <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg text-xs text-gray-200 border border-white/20">
            Canvas: 900x600 | Brush: {brushSize}px
          </div>
        </div>
      </div>
    </div>
  );
}