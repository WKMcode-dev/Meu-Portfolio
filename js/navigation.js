/* Navegação por disclosure: links nativos, sem prender o foco em um menu fechado. */
(() => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("site-nav");
  const settings = document.getElementById("settings-dialog");
  const mobile = matchMedia("(max-width: 700px)");
  let opener = null;
  function setMenu(open, focus = false) {
    toggle.setAttribute("aria-expanded", String(open));
    header.dataset.menu = open ? "open" : "closed";
    toggle.setAttribute(
      "aria-label",
      window.PortfolioI18n.t(open ? "nav.close" : "nav.open"),
    );
    if (focus) toggle.focus();
    window.dispatchEvent(
      new CustomEvent("portfolio:menu", { detail: { open } }),
    );
  }
  function reflect() {
    const state = window.PortfolioSettings.get();
    document.querySelectorAll('input[name="theme"]').forEach((input) => {
      input.checked = input.value === state.theme;
    });
    document.getElementById("language").value = state.language;
    document.getElementById("effects").checked = state.effects;
    toggle.setAttribute(
      "aria-label",
      window.PortfolioI18n.t(
        toggle.getAttribute("aria-expanded") === "true"
          ? "nav.close"
          : "nav.open",
      ),
    );
  }
  document.documentElement.classList.add("js-ready");
  setMenu(false);
  toggle.addEventListener("click", () =>
    setMenu(toggle.getAttribute("aria-expanded") !== "true"),
  );
  nav
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      !settings.open &&
      toggle.getAttribute("aria-expanded") === "true"
    )
      setMenu(false, true);
  });
  header.addEventListener("focusout", (event) => {
    if (event.relatedTarget && !header.contains(event.relatedTarget))
      setMenu(false);
  });
  mobile.addEventListener("change", () => setMenu(false));
  document
    .querySelector(".settings-open")
    .addEventListener("click", (event) => {
      opener = mobile.matches ? toggle : event.currentTarget;
      setMenu(false);
      settings.showModal();
    });
  document
    .querySelector(".settings-close")
    .addEventListener("click", () => settings.close());
  settings.addEventListener("click", (event) => {
    const box = settings.getBoundingClientRect();
    if (
      event.target === settings &&
      (event.clientX < box.left ||
        event.clientX > box.right ||
        event.clientY < box.top ||
        event.clientY > box.bottom)
    )
      settings.close();
  });
  settings.addEventListener("close", () => opener?.focus());
  document
    .querySelectorAll('input[name="theme"]')
    .forEach((input) =>
      input.addEventListener("change", () =>
        window.PortfolioSettings.set({ theme: input.value }),
      ),
    );
  document
    .getElementById("language")
    .addEventListener("change", (event) =>
      window.PortfolioSettings.set({ language: event.target.value }),
    );
  document
    .getElementById("effects")
    .addEventListener("change", (event) =>
      window.PortfolioSettings.set({ effects: event.target.checked }),
    );
  window.addEventListener("portfolio:settings", reflect);
  const sections = document.querySelectorAll("main>section[id]");
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries.find((item) => item.isIntersecting);
      if (!entry) return;
      nav.querySelectorAll("a").forEach((link) => {
        if (link.hash === "#" + entry.target.id)
          link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-85px 0px -55% 0px" },
  );
  sections.forEach((section) => sectionObserver.observe(section));
  reflect();
})();
