# Verificação — refração WebGL na logo WKM

Executada em 31/10/2026 no Windows.

- Material procedural em WebGL 1: letras usadas como máscara, normais de bisel, planos de cristal, refração com índices distintos para RGB, reflexos e cáusticas móveis. Nenhuma imagem de acabamento é usada.
- Mantidas tipografia, dimensões da logo, ícones SVG e demais seções.
- tests/prism.cjs: pixels mudam com o tempo; pausa de efeitos congela a imagem; resize mobile; ausência de erros WebGL/JavaScript; contraste forçado e perda de contexto retornam ao texto legível. Executado em Chrome e WebKit.
- npm run check: valida também js/prism.js.
- npm test: suíte completa de interface e teste WebGL. Chrome em 320, 390, 768 e 1440 px: menu, temas, idiomas, persistência, efeitos e diálogos.
- node tests/mobile.cjs: WebKit, quatro larguras, três idiomas, dois temas, toque, movimento reduzido e ausência de transbordamento horizontal.
- Efeitos respeitam preferências existentes. Sem movimento, o shader mantém um quadro estático; sem WebGL ou com contraste forçado, texto sólido. A animação pausa com página oculta ou logo fora da tela.
- Renderização limitada a 30 fps e pixel ratio 2, restrita à pequena área da logo. Textura das letras só é atualizada ao mudar de tamanho/fonte.
- Capturas desktop/mobile e quadros da animação inspecionados. Não foi usado iPhone físico.

Reprodução: npm ci; npx playwright install chromium webkit; npm run check; npm test; node tests/mobile.cjs.
No Windows, TEST_BROWSER_EXECUTABLE pode apontar ao Chrome. TEST_ENGINE=webkit seleciona WebKit em tests/prism.cjs. PORTFOLIO_SCREENSHOTS define a pasta opcional das capturas.
