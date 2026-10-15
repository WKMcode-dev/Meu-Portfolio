/* Animações locais, sem alterar a rolagem nativa ou bloquear a navegação. */
(() => {
  if (!window.gsap || !window.ScrollTrigger) return;
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
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
