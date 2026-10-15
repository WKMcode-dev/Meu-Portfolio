const { copyFileSync, mkdirSync } = require("node:fs");
const { dirname, join } = require("node:path");
const source = dirname(require.resolve("gsap"));
const target = join(__dirname, "..", "js", "vendor");
mkdirSync(target, { recursive: true });
for (const file of ["gsap.min.js", "ScrollTrigger.min.js"])
  copyFileSync(join(source, file), join(target, file));
console.log(
  "GSAP e ScrollTrigger copiados para js/vendor. Preserve os avisos de licença nos arquivos.",
);
