/**
 * Advanced Gesture Detection with Confidence Scoring
 * Uses MediaPipe hand landmarks to detect drawing gestures
 */

class GestureDetector {
  constructor() {
    this.gestureHistory = [];
    this.historySize = 5;
    this.confidenceThreshold = 0.6;
  }

  /**
   * Calculate distance between two 3D points
   */
  distance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = p1.z - p2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Detect if index finger is extended
   */
  isIndexFingerExtended(landmarks) {
    const indexTip = landmarks[8];
    const indexPip = landmarks[6];
    const indexMcp = landmarks[5];
    
    // Index should be higher (smaller y) than PIP and MCP
    return indexTip.y < indexPip.y && indexPip.y < indexMcp.y;
  }

  /**
   * Detect if middle finger is extended
   */
  isMiddleFingerExtended(landmarks) {
    const middleTip = landmarks[12];
    const middlePip = landmarks[10];
    const middleMcp = landmarks[9];
    
    return middleTip.y < middlePip.y && middlePip.y < middleMcp.y;
  }

  /**
   * Detect if ring finger is extended
   */
  isRingFingerExtended(landmarks) {
    const ringTip = landmarks[16];
    const ringPip = landmarks[14];
    const ringMcp = landmarks[13];
    
    return ringTip.y < ringPip.y && ringPip.y < ringMcp.y;
  }

  /**
   * Detect if pinky finger is extended
   */
  isPinkyFingerExtended(landmarks) {
    const pinkyTip = landmarks[20];
    const pinkyPip = landmarks[18];
    const pinkyMcp = landmarks[17];
    
    return pinkyTip.y < pinkyPip.y && pinkyPip.y < pinkyMcp.y;
  }

  /**
   * Detect if thumb is extended
   */
  isThumbExtended(landmarks) {
    const thumbTip = landmarks[4];
    const wrist = landmarks[0];
    
    // Thumb extended to the side
    const thumbDistance = Math.abs(thumbTip.x - wrist.x);
    const indexDistance = Math.abs(landmarks[8].x - wrist.x);
    
    return thumbDistance > indexDistance * 0.5;
  }

  /**
   * Count extended fingers
   */
  countExtendedFingers(landmarks) {
    let count = 0;
    if (this.isIndexFingerExtended(landmarks)) count++;
    if (this.isMiddleFingerExtended(landmarks)) count++;
    if (this.isRingFingerExtended(landmarks)) count++;
    if (this.isPinkyFingerExtended(landmarks)) count++;
    if (this.isThumbExtended(landmarks)) count++;
    
    return count;
  }

  /**
   * Detect palm open (all fingers extended)
   */
  isPalmOpen(landmarks) {
    const extendedCount = this.countExtendedFingers(landmarks);
    return extendedCount >= 4;
  }

  /**
   * Detect closed fist
   */
  isClosedFist(landmarks) {
    const extendedCount = this.countExtendedFingers(landmarks);
    return extendedCount <= 1;
  }

  /**
   * Detect writing pose (index finger extended, others not)
   */
  isWritingPose(landmarks) {
    return (
      this.isIndexFingerExtended(landmarks) &&
      !this.isMiddleFingerExtended(landmarks) &&
      !this.isRingFingerExtended(landmarks) &&
      !this.isPinkyFingerExtended(landmarks)
    );
  }

  /**
   * Detect two fingers up (index and middle extended)
   */
  isTwoFingersUp(landmarks) {
    return (
      this.isIndexFingerExtended(landmarks) &&
      this.isMiddleFingerExtended(landmarks) &&
      !this.isRingFingerExtended(landmarks) &&
      !this.isPinkyFingerExtended(landmarks)
    );
  }

  /**
   * Detect three fingers up (index, middle, ring extended)
   */
  isThreeFingersUp(landmarks) {
    return (
      this.isIndexFingerExtended(landmarks) &&
      this.isMiddleFingerExtended(landmarks) &&
      this.isRingFingerExtended(landmarks) &&
      !this.isPinkyFingerExtended(landmarks)
    );
  }

  /**
   * Calculate hand stability (how stable the hand position is)
   */
  calculateHandStability(landmarks) {
    if (this.gestureHistory.length < 2) return 1.0;
    
    const lastLandmark = this.gestureHistory[this.gestureHistory.length - 1];
    const currentWrist = landmarks[0];
    const lastWrist = lastLandmark[0];
    
    const movement = this.distance(currentWrist, lastWrist);
    // Normalize movement (smaller = more stable, max 0.1 is considered perfectly stable)
    return Math.max(0, 1 - movement * 10);
  }

  /**
   * Detect gesture with confidence score
   */
  detectGesture(landmarks, width, height) {
    if (!landmarks || landmarks.length === 0) {
      return {
        gesture: 'idle',
        confidence: 0,
        description: 'No hand detected',
        stability: 0
      };
    }

    // Add to history for stability calculation
    this.gestureHistory.push(landmarks);
    if (this.gestureHistory.length > this.historySize) {
      this.gestureHistory.shift();
    }

    const stability = this.calculateHandStability(landmarks);
    const indexTip = landmarks[8];
    const palmPosition = {
      x: (1 - indexTip.x) * width,
      y: indexTip.y * height
    };

    // Detect gestures with confidence scores
    if (this.isWritingPose(landmarks)) {
      return {
        gesture: 'drawing',
        confidence: 0.9 + stability * 0.1,
        description: 'Drawing ✍️',
        palmPosition,
        stability
      };
    }

    if (this.isTwoFingersUp(landmarks)) {
      return {
        gesture: 'color_change',
        confidence: 0.85 + stability * 0.15,
        description: 'Change Color ✌️',
        palmPosition,
        stability
      };
    }

    if (this.isThreeFingersUp(landmarks)) {
      return {
        gesture: 'clear',
        confidence: 0.8 + stability * 0.2,
        description: 'Clear Canvas 🤟',
        palmPosition,
        stability
      };
    }

    if (this.isPalmOpen(landmarks)) {
      return {
        gesture: 'space',
        confidence: 0.8 + stability * 0.2,
        description: 'Space 🖐️',
        palmPosition,
        stability
      };
    }

    if (this.isClosedFist(landmarks)) {
      return {
        gesture: 'pause',
        confidence: 0.75 + stability * 0.25,
        description: 'Stop Drawing ✊',
        palmPosition,
        stability
      };
    }

    return {
      gesture: 'idle',
      confidence: 0.3,
      description: 'Idle',
      palmPosition,
      stability
    };
  }

  /**
   * Get smoothed gesture from history (temporal filtering)
   */
  getSmoothGesture(gestures) {
    if (gestures.length === 0) {
      return {
        gesture: 'idle',
        confidence: 0,
        description: 'No hand detected',
        stability: 0
      };
    }

    // Count gesture frequency in recent history
    const gestureCounts = {};
    let totalConfidence = 0;
    let totalStability = 0;

    gestures.forEach(g => {
      gestureCounts[g.gesture] = (gestureCounts[g.gesture] || 0) + 1;
      totalConfidence += g.confidence;
      totalStability += g.stability;
    });

    // Get most frequent gesture
    const mostCommonGesture = Object.keys(gestureCounts).reduce((a, b) =>
      gestureCounts[a] > gestureCounts[b] ? a : b
    );

    const matchingGestures = gestures.filter(g => g.gesture === mostCommonGesture);
    
    return {
      gesture: mostCommonGesture,
      confidence: totalConfidence / gestures.length,
      description: matchingGestures[0]?.description || 'Unknown',
      stability: totalStability / gestures.length,
      frequency: gestureCounts[mostCommonGesture]
    };
  }

  reset() {
    this.gestureHistory = [];
  }
}

export default GestureDetector;
