(function () {
    const canvas = document.getElementById('snow');
    const ctx = canvas.getContext('2d');

    let w, h, particles;
    const density = 120;          // quantidade base de partículas
    const color = 'rgba(255,255,255,0.8)';
    const maxSize = 2.2;          // tamanho máximo do floco
    const wind = 0.25;            // vento horizontal
    const gravity = 0.3;          // queda vertical

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        const count = Math.floor((w * h) / 12000); // escala pela área
        particles = new Array(Math.min(count, density)).fill().map(() => ({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * maxSize + 0.5,
            vx: (Math.random() - 0.5) * wind,
            vy: Math.random() * gravity + 0.4,
            drift: Math.random() * 0.6 + 0.2
        }));
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = color;

        for (const p of particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();

            // movimento
            p.x += p.vx + Math.sin(p.y * 0.01) * p.drift;
            p.y += p.vy;

            // reaparecer ao sair da tela
            if (p.y > h + p.r) {
                p.y = -p.r;
                p.x = Math.random() * w;
            }
            if (p.x > w + p.r) p.x = -p.r;
            if (p.x < -p.r) p.x = w + p.r;
        }

        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    draw();
})();
