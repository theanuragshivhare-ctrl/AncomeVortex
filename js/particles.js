/**
 * AncomeVortex - Cyber Particle Node Network
 * Interactive background canvas with glowing interconnected nodes
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('hero-particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particlesArray = [];
  let animationFrameId;

  // Set Canvas Dimensions
  function setCanvasSize() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  }
  setCanvasSize();

  // Mouse Interaction Coordinates
  const mouse = {
    x: null,
    y: null,
    radius: 120
  };

  window.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Particle Class
  class Particle {
    constructor(x, y, directionX, directionY, size, color) {
      this.x = x;
      this.y = y;
      this.directionX = directionX;
      this.directionY = directionY;
      this.size = size;
      this.color = color;
      this.baseX = x;
      this.baseY = y;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00f2fe';
      ctx.fill();
      ctx.shadowBlur = 0; // reset
    }

    update() {
      // Bounce off edges
      if (this.x > canvas.width || this.x < 0) {
        this.directionX = -this.directionX;
      }
      if (this.y > canvas.height || this.y < 0) {
        this.directionY = -this.directionY;
      }

      // Mouse collision repulsion
      if (mouse.x !== null && mouse.y !== null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const maxDistance = mouse.radius;
          const force = (maxDistance - distance) / maxDistance;
          const directionX = forceDirectionX * force * 3;
          const directionY = forceDirectionY * force * 3;

          this.x -= directionX;
          this.y -= directionY;
        }
      }

      this.x += this.directionX;
      this.y += this.directionY;
      this.draw();
    }
  }

  // Initialize Particles
  function init() {
    particlesArray = [];
    const numberOfParticles = Math.floor((canvas.width * canvas.height) / 12000);
    const count = Math.min(Math.max(numberOfParticles, 40), 95);

    for (let i = 0; i < count; i++) {
      let size = Math.random() * 2 + 1;
      let x = Math.random() * (canvas.width - size * 2) + size * 2;
      let y = Math.random() * (canvas.height - size * 2) + size * 2;
      let directionX = (Math.random() * 0.8) - 0.4;
      let directionY = (Math.random() * 0.8) - 0.4;
      let color = (Math.random() > 0.3) ? 'rgba(0, 242, 254, 0.7)' : 'rgba(56, 189, 248, 0.5)';

      particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
  }

  // Connect Particles with Glowing Cyber Lines
  function connect() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
      for (let b = a; b < particlesArray.length; b++) {
        let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
          + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));

        if (distance < (canvas.width / 8) * (canvas.height / 8) && distance < 14000) {
          opacityValue = 1 - (distance / 14000);
          ctx.strokeStyle = `rgba(0, 242, 254, ${opacityValue * 0.25})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
          ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
          ctx.stroke();
        }
      }
    }
  }

  // Animation Loop
  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
    }
    connect();
  }

  // Resize Handler with Debounce
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      setCanvasSize();
      init();
    }, 150);
  });

  init();
  animate();
});
