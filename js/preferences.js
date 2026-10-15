/* Aplicado antes da pintura para restaurar o tema sem um flash da outra aparência. */
(() => {
  const key = "wkm-portfolio-preferences-v1";
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    /* Modo privado ou armazenamento indisponível. */
  }
  const state = {
    theme: saved.theme === "light" ? "light" : "dark",
    language: ["pt-BR", "en", "es"].includes(saved.language)
      ? saved.language
      : "pt-BR",
    effects:
      typeof saved.effects === "boolean"
        ? saved.effects
        : !reducedMotion.matches,
  };
  let reflectedMotion;
  function reflect() {
    reflectedMotion = state.effects && !reducedMotion.matches;
    document.documentElement.dataset.theme = state.theme;
    document.documentElement.dataset.effects =
      state.effects && !reducedMotion.matches ? "on" : "off";
    document.documentElement.lang = state.language;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", state.theme === "dark" ? "#191a1e" : "#f7f7f5");
  }
  function set(patch) {
    if (["dark", "light"].includes(patch.theme)) state.theme = patch.theme;
    if (["pt-BR", "en", "es"].includes(patch.language))
      state.language = patch.language;
    if (typeof patch.effects === "boolean") state.effects = patch.effects;
    reflect();
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* Leitura e navegação continuam disponíveis. */
    }
    window.dispatchEvent(
      new CustomEvent("portfolio:settings", { detail: { ...state } }),
    );
  }
  window.PortfolioSettings = {
    get: () => ({
      ...state,
      motionAllowed: state.effects && !reducedMotion.matches,
    }),
    set,
  };
  function syncSystemMotion() {
    if (reflectedMotion === (state.effects && !reducedMotion.matches)) return;
    reflect();
    window.dispatchEvent(new CustomEvent("portfolio:settings"));
  }
  // Alguns navegadores atualizam matches sem entregar o evento change.
  // Reconciliação leve, sem redesenhar nem notificar quando nada mudou.
  let motionTimer;
  function watchSystemMotion() {
    clearInterval(motionTimer);
    syncSystemMotion();
    motionTimer = setInterval(() => {
      if (!document.hidden) syncSystemMotion();
    }, 500);
  }
  reducedMotion.addEventListener("change", syncSystemMotion);
  window.addEventListener("focus", syncSystemMotion);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) syncSystemMotion();
  });
  window.addEventListener("pagehide", () => clearInterval(motionTimer));
  window.addEventListener("pageshow", watchSystemMotion);
  reflect();
  watchSystemMotion();
})();
