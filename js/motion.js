/* Animações locais, sem alterar a rolagem nativa ou bloquear a navegação. */
(() => {
  if (!window.gsap || !window.ScrollTrigger) return;
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  // Máscara gerada com a fonte real: o filtro atua somente nas letras,
  // deixando o conteúdo da página participar do reflexo prateado.
  const brandWord = document.querySelector(".brand-word");
  function prepareLogoMask() {
    if (!brandWord) return;
    const style = getComputedStyle(brandWord);
    const width = brandWord.offsetWidth, height = brandWord.offsetHeight;
    if (!width || !height) return;
    try {
      const canvas = document.createElement("canvas");
      const ratio = Math.min(devicePixelRatio || 1, 3);
      canvas.width = Math.ceil(width * ratio);
      canvas.height = Math.ceil(height * ratio);
      const ctx = canvas.getContext("2d");
      if (!ctx || !("letterSpacing" in ctx)) return;
      ctx.scale(ratio, ratio);
      ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      ctx.letterSpacing = style.letterSpacing;
      ctx.fillStyle = "white";
      const metrics = ctx.measureText("WKM");
      const ascent = metrics.fontBoundingBoxAscent;
      const descent = metrics.fontBoundingBoxDescent;
      if (!Number.isFinite(ascent + descent)) return;
      ctx.fillText("WKM", 0, (height - ascent - descent) / 2 + ascent);
      brandWord.style.setProperty("--brand-mask", `url("${canvas.toDataURL()}")`);
      brandWord.classList.add("chrome-ready");
    } catch { /* A logo vermelha e o reflexo CSS continuam disponíveis. */ }
  }
  prepareLogoMask();
  document.fonts?.ready.then(prepareLogoMask);
  if (brandWord && window.ResizeObserver)
    new ResizeObserver(prepareLogoMask).observe(brandWord);
  let context = null;
  let heroPlayed = false;
  let allowed = false;
  function run(animation) {
    if (allowed && context) context.add(animation);
  }
  function sync() {
    const next = window.PortfolioSettings.get().motionAllowed;
    if (next === allowed && context) {
      ScrollTrigger.refresh();
      return;
    }
    context?.revert();
    context = null;
    allowed = next;
    if (!allowed) return;
    context = gsap.context(() => {
      if (!heroPlayed && scrollY < 100) {
        heroPlayed = true;
        gsap
          .timeline({ defaults: { duration: 0.65, ease: "power3.out" } })
          .from(".intro .panel-meta, .intro .eyebrow", {
            y: 12,
            opacity: 0,
            stagger: 0.08,
          })
          .from(
            "#hero-title>span",
            { y: 24, opacity: 0, stagger: 0.1 },
            "-=.45",
          )
          .from(
            ".intro-name,.intro-description,.intro .actions,.intro-footer",
            { y: 18, opacity: 0, stagger: 0.09 },
            "-=.45",
          )
          .from(
            ".cta",
            { y: 22, opacity: 0, clearProps: "transform,opacity" },
            "-=.8",
          );
      }
      document
        .querySelectorAll(
          ".section-heading,.about-copy,.toolkit,.custom-project-card,.contact-panel,.dna-strip",
        )
        .forEach((element) => {
          // Conteúdo já visível permanece legível após mudar as preferências.
          if (element.getBoundingClientRect().top < innerHeight * 0.9) return;
          gsap.from(element, {
            y: 26,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            immediateRender: false,
            clearProps: "transform,opacity",
            scrollTrigger: { trigger: element, start: "top 92%", once: true },
          });
        });
      // O reflexo percorre as letras conforme o conteúdo passa sob o cabeçalho.
      gsap.fromTo(".brand-word", { "--chrome-position": "-110%" }, {
        "--chrome-position": "210%",
        ease: "none",
        repeat: 7,
        yoyo: true,
        scrollTrigger: { start: 0, end: "max", scrub: 0.35 },
      });
      gsap.fromTo(
        ".reading-progress",
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: 0.25 },
        },
      );
    });
  }
  window.addEventListener("portfolio:menu", (event) => {
    if (!event.detail.open) {
      gsap.killTweensOf(".site-nav,.site-nav a,.site-nav button");
      gsap.set(".site-nav,.site-nav a,.site-nav button", {
        clearProps: "transform,opacity,visibility",
      });
      return;
    }
    run(() => {
      gsap.fromTo(
        ".site-nav",
        { y: -10, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.32,
          ease: "power3.out",
          clearProps: "transform,opacity",
        },
      );
      gsap.fromTo(
        ".site-nav a,.site-nav button",
        { x: -12, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.35,
          stagger: 0.045,
          ease: "power2.out",
          clearProps: "transform,opacity",
          overwrite: true,
        },
      );
    });
  });
  document.querySelectorAll("dialog").forEach((dialog) => {
    const observer = new MutationObserver(() => {
      if (dialog.open)
        run(() => {
          gsap.fromTo(
            dialog,
            { y: 14, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.3,
              ease: "power3.out",
              clearProps: "transform,opacity",
              overwrite: true,
            },
          );
          gsap.fromTo(
            dialog.querySelectorAll(
              "h2,fieldset,.setting-row,#dialog-description,#dialog-link",
            ),
            { y: 8, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.3,
              stagger: 0.045,
              clearProps: "transform,opacity",
              overwrite: true,
            },
          );
        });
    });
    observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });
  });
  document
    .querySelectorAll(".custom-project-card,.button")
    .forEach((element) => {
      element.addEventListener("pointerenter", (event) => {
        if (event.pointerType === "touch") return;
        run(() =>
          gsap.to(element, {
            y: -5,
            duration: 0.25,
            ease: "power2.out",
            overwrite: "auto",
          }),
        );
      });
      element.addEventListener("pointerleave", () =>
        run(() =>
          gsap.to(element, {
            y: 0,
            duration: 0.3,
            ease: "power2.out",
            clearProps: "transform",
            overwrite: "auto",
          }),
        ),
      );
    });
  // Resposta ao toque sem depender de hover, que não existe em telas touch.
  document.querySelectorAll(".project-cover,.button").forEach((element) => {
    element.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "touch") return;
      run(() =>
        gsap.to(element, { scale: 0.98, duration: 0.12, overwrite: "auto" }),
      );
    });
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
      element.addEventListener(type, (event) => {
        if (event.pointerType !== "touch") return;
        run(() =>
          gsap.to(element, { scale: 1, duration: 0.22, overwrite: "auto" }),
        );
      });
    }
  });
  window.addEventListener("portfolio:settings", sync);
  window.addEventListener("pagehide", () => {
    context?.revert();
    context = null;
    allowed = false;
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) sync();
  });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  sync();
})();
