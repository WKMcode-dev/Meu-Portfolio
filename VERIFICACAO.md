# Verificação — logo prismática e ícones SVG

Executada em 31/10/2026 com Chrome/Chromium e WebKit do Playwright no Windows.

- `npm run check`: scripts válidos.
- `npm test`: suíte completa aprovada em 320, 390, 768 e 1440 px; menu, temas, três idiomas, efeitos, persistência, diálogos e ausência de transbordamento horizontal.
- `node tests/mobile.cjs`: WebKit aprovado nas mesmas larguras, nos três idiomas e dois temas, com toque e movimento reduzido.
- Nove SVGs decorativos preservados após tradução; nenhuma seta Unicode no texto da página.
- Logo com reflexos estáticos recortados no texto, sem máscara canvas, dependência do GSAP ou filtro SVG de backdrop. Alternativa sólida quando o recorte não existe e cor do sistema em contraste forçado.
- Suíte cobre JavaScript desativado, biblioteca de animação indisponível, armazenamento bloqueado e abertura por file://.
- Capturas de desktop/mobile e temas claro/escuro inspecionadas visualmente.
- WebKit automatizado não substitui uma verificação em iPhone físico; não foi usado dispositivo iOS real.

Para reproduzir: `npm ci`, `npx playwright install chromium webkit`, `npm run check`, `npm test`, `node tests/mobile.cjs`.
No Windows, `TEST_BROWSER_EXECUTABLE` pode apontar ao Chrome instalado. `PORTFOLIO_SCREENSHOTS` define a pasta das capturas.
