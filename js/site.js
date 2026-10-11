/* SVGs decorativos se adaptam às dimensões reais dos cards.
   O conteúdo permanece HTML: cresce, quebra linhas e é acessível. */
(() => {
  const panels = document.querySelectorAll(".panel");
  const svgNS = "http://www.w3.org/2000/svg";
  function drawFrame(panel) {
    const w = panel.clientWidth, h = panel.clientHeight;
    if (w < 100 || h < 60) return;
    let svg = panel.querySelector(":scope > .panel-frame");
    if (!svg) {
      svg = document.createElementNS(svgNS, "svg");
      svg.classList.add("panel-frame");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("focusable", "false");
      svg.append(document.createElementNS(svgNS, "path"));
      panel.prepend(svg);
    }
    // Coordenadas em pixels da caixa, sem esticar os cantos do desenho.
    const cut = 16, left = Math.min(65, w * .18), right = Math.min(left + 72, w - 50);
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    svg.querySelector("path").setAttribute("d",
      "M " + cut + " 1 L " + left + " 1 L " + (left + 8) + " 7 L " + (right - 8) + " 7 L " + right + " 1 " +
      "L " + (w - cut) + " 1 L " + (w - 1) + " " + cut + " L " + (w - 1) + " " + (h - cut) + " " +
      "L " + (w - cut) + " " + (h - 1) + " L " + cut + " " + (h - 1) + " L 1 " + (h - cut) + " L 1 " + cut + " Z");
    panel.classList.add("framed");
  }
  panels.forEach(drawFrame);
  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(entries => entries.forEach(entry => drawFrame(entry.target)));
    panels.forEach(panel => observer.observe(panel));
  } else {
    window.addEventListener("resize", () => panels.forEach(drawFrame), {passive:true});
  }

  // Uma janela nativa de diálogo oferece Escape e gerenciamento de foco.
  const projects = {
    cursor: {title:"Cursor Hub", description:"Projeto desktop desenvolvido em C#. Acesse o repositório para consultar o código e a documentação disponível.", url:"https://github.com/WKMcode-dev/Cursor_HUB"},
    occurrence: {title:"Occurrence System", description:"Sistema de ocorrências desenvolvido com Laravel, apresentado no portfólio original como versão V1.0.2. Consulte o repositório para informações atualizadas.", url:"https://github.com/WKMcode-dev/occurrence-system"},
    keyboard: {title:"Keyboard Logger Discord", description:"Projeto em Python apresentado no portfólio original como em desenvolvimento. A documentação disponível está no repositório.", url:"https://github.com/WKMcode-dev/KeyboardLoggerDiscord"}
  };
  const dialog = document.getElementById("project-dialog");
  let trigger = null;
  document.querySelectorAll("[data-project]").forEach(button => {
    if (!dialog || typeof dialog.showModal !== "function") {
      button.hidden = true; return;
    }
    button.addEventListener("click", () => {
      const project = projects[button.dataset.project];
      if (!project) return;
      document.getElementById("dialog-title").textContent = project.title;
      document.getElementById("dialog-description").textContent = project.description;
      document.getElementById("dialog-link").href = project.url;
      trigger = button;
      dialog.showModal();
    });
  });
  if (dialog) {
    dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
    dialog.addEventListener("close", () => { if(trigger) trigger.focus(); });
  }
  const dna = document.querySelector(".dna");
  if(dna) for(let i=0;i<24;i++){const bar=document.createElement("i");bar.style.setProperty("--i",i);dna.append(bar);}

  // Efeitos ativos por padrão; pausa manual e em aba oculta.
  const canvas = document.getElementById("snow");
  const context = canvas?.getContext("2d");
  const toggle = document.querySelector(".effects-toggle");
  let userEffects = true;
  let width=0,height=0,particles=[],raf=0,last=0;
  function resize(){
    if(!context)return;
    width=window.innerWidth;height=window.innerHeight;
    const ratio=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    context.setTransform(ratio,0,0,ratio,0,0);
    particles=Array.from({length:Math.min(64,Math.floor(width*height/22000))},()=>({x:Math.random()*width,y:Math.random()*height,r:.5+Math.random(),speed:8+Math.random()*15}));
  }
  function tick(time){
    const dt=Math.min((time-(last||time))/1000,.05);last=time;
    context.clearRect(0,0,width,height);context.fillStyle="#ffffff";
    for(const p of particles){p.y+=p.speed*dt;p.x+=3*dt;if(p.y>height){p.y=-2;p.x=Math.random()*width}if(p.x>width)p.x=0;context.beginPath();context.arc(p.x,p.y,p.r,0,Math.PI*2);context.fill();}
    raf=requestAnimationFrame(tick);
  }
  function syncEffects(){
    cancelAnimationFrame(raf);raf=0;last=0;
    const enabled=userEffects;
    document.body.dataset.effects=enabled?"on":"off";
    if(toggle){toggle.setAttribute("aria-pressed",String(enabled));toggle.textContent=enabled?"Efeitos: ativos":"Efeitos: pausados";toggle.disabled=false;}
    if(context)context.clearRect(0,0,width,height);
    if(context&&enabled&&!document.hidden)raf=requestAnimationFrame(tick);
  }
  if(toggle)toggle.addEventListener("click",()=>{userEffects=!userEffects;syncEffects();});
  document.addEventListener("visibilitychange",syncEffects);
  window.addEventListener("resize",resize,{passive:true});
  resize();syncEffects();
})();
