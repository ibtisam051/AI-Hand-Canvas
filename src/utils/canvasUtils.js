/**
 * Canvas and Drawing Utilities
 */

export class DrawingHistory {
  constructor(maxStates = 20) {
    this.history = [];
    this.currentIndex = -1;
    this.maxStates = maxStates;
  }

  save(canvas) {
    // Remove any states after current index (for redo)
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // Add new state
    const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    this.history.push(imageData);
    
    // Limit history size
    if (this.history.length > this.maxStates) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
  }

  undo(canvas) {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.restore(canvas);
      return true;
    }
    return false;
  }

  redo(canvas) {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      this.restore(canvas);
      return true;
    }
    return false;
  }

  restore(canvas) {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      const ctx = canvas.getContext('2d');
      ctx.putImageData(this.history[this.currentIndex], 0, 0);
    }
  }

  clear() {
    this.history = [];
    this.currentIndex = -1;
  }

  canUndo() {
    return this.currentIndex > 0;
  }

  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  getStateCount() {
    return this.history.length;
  }
}

export class CanvasUtils {
  static initializeCanvas(canvas, backgroundColor = 'white') {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return ctx;
  }

  static clearCanvas(canvas, backgroundColor = 'white') {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  static drawSmoothStroke(ctx, points, color, lineWidth) {
    if (points.length === 0) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (points.length === 1) {
      const p = points[0];
      ctx.beginPath();
      ctx.arc(p.x, p.y, lineWidth / 2, 0, 2 * Math.PI);
      ctx.fill();
      return;
    }

    if (points.length === 2) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[1].x, points[1].y);
      ctx.stroke();
      return;
    }

    // Use quadratic curves for smooth strokes
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }

    ctx.quadraticCurveTo(
      points[points.length - 2].x,
      points[points.length - 2].y,
      points[points.length - 1].x,
      points[points.length - 1].y
    );
    ctx.stroke();
  }

  static drawStroke(ctx, points, color, lineWidth) {
    if (points.length < 2) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.stroke();
  }

  static exportAsImage(canvas, filename = 'drawing.png') {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = filename;
    link.click();
  }

  static exportAsJSON(canvas, metadata = {}) {
    const data = {
      timestamp: new Date().toISOString(),
      dimensions: {
        width: canvas.width,
        height: canvas.height
      },
      imageData: canvas.toDataURL('image/png'),
      metadata
    };
    
    const link = document.createElement('a');
    link.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));
    link.download = 'drawing.json';
    link.click();
  }

  static smoothifyPath(points, factor = 0.2) {
    if (points.length < 2) return points;

    const smoothed = [points[0]];
    for (let i = 1; i < points.length; i++) {
      const prev = smoothed[smoothed.length - 1];
      const current = points[i];
      
      const smoothX = prev.x + (current.x - prev.x) * factor;
      const smoothY = prev.y + (current.y - prev.y) * factor;
      
      smoothed.push({ x: smoothX, y: smoothY });
    }
    return smoothed;
  }
}

export class ColorUtils {
  static getContrastingColor(hex) {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  static hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  static rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  }

  static generateColorPalette(baseColor, count = 6) {
    const colors = [baseColor];
    const rgb = this.hexToRgb(baseColor);
    
    for (let i = 1; i < count; i++) {
      const angle = (i / count) * 360;
      const newRgb = this.rotateHue(rgb, angle);
      colors.push(this.rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    }
    
    return colors;
  }

  static rotateHue(rgb, angle) {
    // Convert RGB to HSL, rotate hue, convert back
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: break;
      }
      h /= 6;
    }

    h = (h * 360 + angle) % 360;
    h /= 360;

    const q = l < 0.5 ? l * (1 + l) : l + l - l * l;
    const p = 2 * l - q;

    const newR = this.hslToRgb(p, q, h + 1/3);
    const newG = this.hslToRgb(p, q, h);
    const newB = this.hslToRgb(p, q, h - 1/3);

    return {
      r: Math.round(newR * 255),
      g: Math.round(newG * 255),
      b: Math.round(newB * 255)
    };
  }

  static hslToRgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  }
}

const CanvasUtilities = {
  DrawingHistory,
  CanvasUtils,
  ColorUtils
};

export default CanvasUtilities;
