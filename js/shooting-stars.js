class ShootingStars {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.stars = [];
    this.meteors = [];
    this.animationId = null;
    this.resizeTimeout = null;
    this.init();
  }

  init() {
    this.createCanvas();
    this.setupEventListeners();
    this.createStars();
    this.animate();
  }

  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.id = 'shooting-stars-canvas';
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
    `;
    document.body.appendChild(this.canvas);
    this.resize();
  }

  setupEventListeners() {
    window.addEventListener('resize', () => {
      if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => this.resize(), 200);
    });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.createStars();
  }

  createStars() {
    const starCount = Math.floor((this.canvas.width * this.canvas.height) / 3000);
    this.stars = [];

    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinkleOffset: Math.random() * Math.PI * 2
      });
    }
  }

  createMeteor() {
    const meteor = {
      x: this.canvas.width * 0.8 + Math.random() * this.canvas.width * 0.3,
      y: -50 - Math.random() * 100,
      length: Math.random() * 100 + 60,
      speed: Math.random() * 10 + 6,
      angle: Math.PI * 0.75 + (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.7 + 0.3,
      width: Math.random() * 3 + 2,
      brightness: Math.random() * 0.5 + 0.5,
      trail: []
    };
    this.meteors.push(meteor);
  }

  updateMeteors() {
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const meteor = this.meteors[i];

      meteor.trail.push({
        x: meteor.x,
        y: meteor.y,
        opacity: meteor.opacity
      });

      if (meteor.trail.length > 20) {
        meteor.trail.shift();
      }

      meteor.x += Math.cos(meteor.angle) * meteor.speed;
      meteor.y += Math.sin(meteor.angle) * meteor.speed;

      meteor.opacity -= 0.002;

      if (meteor.x > this.canvas.width + 100 ||
        meteor.y > this.canvas.height + 100 ||
        meteor.opacity <= 0) {
        this.meteors.splice(i, 1);
      }
    }

    if (Math.random() < 0.015 && this.meteors.length < 5) {
      this.createMeteor();
    }
  }

  drawStars() {
    this.ctx.fillStyle = '#ffffff';
    const time = Date.now() * 0.001;

    for (const star of this.stars) {
      const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.5 + 0.5;
      this.ctx.globalAlpha = star.opacity * twinkle;
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;
  }

  drawMeteors() {
    for (const meteor of this.meteors) {
      const gradient = this.ctx.createLinearGradient(
        meteor.x - Math.cos(meteor.angle) * meteor.length,
        meteor.y - Math.sin(meteor.angle) * meteor.length,
        meteor.x,
        meteor.y
      );

      gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
      gradient.addColorStop(0.3, `rgba(200, 200, 255, ${meteor.opacity * 0.3})`);
      gradient.addColorStop(0.6, `rgba(150, 150, 255, ${meteor.opacity * 0.6})`);
      gradient.addColorStop(1, `rgba(255, 255, 255, ${meteor.opacity})`);

      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = meteor.width;
      this.ctx.lineCap = 'round';

      this.ctx.beginPath();
      this.ctx.moveTo(
        meteor.x - Math.cos(meteor.angle) * meteor.length,
        meteor.y - Math.sin(meteor.angle) * meteor.length
      );
      this.ctx.lineTo(meteor.x, meteor.y);
      this.ctx.stroke();

      this.ctx.fillStyle = `rgba(255, 255, 255, ${meteor.opacity})`;
      this.ctx.beginPath();
      this.ctx.arc(meteor.x, meteor.y, meteor.width * 1.5, 0, Math.PI * 2);
      this.ctx.fill();

      const glowGradient = this.ctx.createRadialGradient(
        meteor.x, meteor.y, 0,
        meteor.x, meteor.y, meteor.width * 8
      );
      glowGradient.addColorStop(0, `rgba(200, 200, 255, ${meteor.opacity * 0.4})`);
      glowGradient.addColorStop(0.5, `rgba(150, 150, 255, ${meteor.opacity * 0.1})`);
      glowGradient.addColorStop(1, 'rgba(100, 100, 255, 0)');

      this.ctx.fillStyle = glowGradient;
      this.ctx.beginPath();
      this.ctx.arc(meteor.x, meteor.y, meteor.width * 8, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawStars();
    this.updateMeteors();
    this.drawMeteors();

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ShootingStars();
});
