<template>
  <div class="tech-background">
    <div class="stars"></div>
    <div class="grid"></div>
    <div class="glow"></div>
    <canvas ref="particleCanvas" class="particles"></canvas>
  </div>
</template>

<script>
export default {
  name: 'TechBackground',
  data() {
    return {
      particles: [],
      ctx: null,
      width: 0,
      height: 0,
      animationFrame: null
    }
  },
  mounted() {
    this.initCanvas();
    window.addEventListener('resize', this.resizeCanvas);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCanvas);
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  },
  methods: {
    initCanvas() {
      const canvas = this.$refs.particleCanvas;
      this.ctx = canvas.getContext('2d');
      this.resizeCanvas();
      this.createParticles();
      this.animate();
    },
    resizeCanvas() {
      const canvas = this.$refs.particleCanvas;
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      canvas.width = this.width;
      canvas.height = this.height;
      
      // 如果已经有粒子，重新创建以适应新尺寸
      if (this.particles.length > 0) {
        this.createParticles();
      }
    },
    createParticles() {
      this.particles = [];
      const particleCount = Math.floor(this.width * this.height / 15000);
      
      for (let i = 0; i < particleCount; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: Math.random() * 2 + 1,
          color: `rgba(57, 175, 253, ${Math.random() * 0.5 + 0.25})`,
          speedX: Math.random() * 0.5 - 0.25,
          speedY: Math.random() * 0.5 - 0.25,
          connections: []
        });
      }
    },
    animate() {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.updateParticles();
      this.drawParticles();
      this.animationFrame = requestAnimationFrame(this.animate);
    },
    updateParticles() {
      this.particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // 边界检查
        if (particle.x < 0 || particle.x > this.width) {
          particle.speedX = -particle.speedX;
        }
        
        if (particle.y < 0 || particle.y > this.height) {
          particle.speedY = -particle.speedY;
        }
        
        // 重置连接
        particle.connections = [];
      });
      
      // 计算粒子之间的连接
      const maxDistance = 150;
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const dx = this.particles[i].x - this.particles[j].x;
          const dy = this.particles[i].y - this.particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            this.particles[i].connections.push({
              particle: this.particles[j],
              distance: distance
            });
          }
        }
      }
    },
    drawParticles() {
      // 先绘制连线
      this.particles.forEach(particle => {
        particle.connections.forEach(connection => {
          const opacity = 1 - (connection.distance / 150);
          this.ctx.beginPath();
          this.ctx.moveTo(particle.x, particle.y);
          this.ctx.lineTo(connection.particle.x, connection.particle.y);
          this.ctx.strokeStyle = `rgba(57, 175, 253, ${opacity * 0.2})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        });
      });
      
      // 再绘制粒子
      this.particles.forEach(particle => {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = particle.color;
        this.ctx.fill();
      });
    }
  }
}
</script>

<style scoped>
.tech-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  background: #051231;
}

.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(2px 2px at 20px 30px, #8DD1FE, rgba(0,0,0,0)),
                    radial-gradient(2px 2px at 40px 70px, #8DD1FE, rgba(0,0,0,0)),
                    radial-gradient(2px 2px at 50px 160px, #8DD1FE, rgba(0,0,0,0)),
                    radial-gradient(2px 2px at 90px 40px, #8DD1FE, rgba(0,0,0,0)),
                    radial-gradient(2px 2px at 130px 80px, #8DD1FE, rgba(0,0,0,0)),
                    radial-gradient(2px 2px at 160px 120px, #8DD1FE, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  opacity: 0.3;
  z-index: 1;
}

.grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(to right, rgba(57, 175, 253, 0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(57, 175, 253, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.2;
  z-index: 2;
}

.glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: 60%;
  background: radial-gradient(circle, rgba(57, 175, 253, 0.1) 0%, rgba(5, 18, 49, 0) 70%);
  z-index: 3;
}
</style> 