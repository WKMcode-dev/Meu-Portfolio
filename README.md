# WKM // CODE — Portfólio

Portfólio de Wryell Kenneth, desenvolvedor full-stack e profissional de TI. Apresenta aplicações web e desktop, ferramentas próprias e o uso de IA no processo de desenvolvimento.

## Usar

Abra `index.html` em um navegador atual ou acesse https://wkmcode-dev.github.io/Meu-Portfolio/.
Não exige instalação nem compilação. Todos os scripts, animações, traduções e imagens são locais e funcionam também ao abrir o arquivo diretamente.

## Navegação e preferências

- Menu mobile com recortes SCI-FI, fechamento por Escape, clique fora ou escolha de seção.
- WKM no vermelho de destaque; inversão do fundo somente nos `//` e nos traços do ícone mobile. O painel de navegação segue as cores do tema. Navegadores sem backdrop-filter recebem uma alternativa sólida legível.
- Configurações em diálogo nativo: tema claro/escuro, português/inglês/espanhol e efeitos visuais.
- Preferências salvas somente no armazenamento deste navegador; sem cookies de rastreamento nem serviços externos de tradução.
- A preferência de movimento do sistema define o estado inicial; a escolha explícita em Efeitos visuais prevalece e fica salva.
- Animações GSAP de entrada, navegação, diálogos, interação e progresso de leitura. A rolagem permanece nativa.

## Organização

- `index.html`: conteúdo semântico em português e atributos de tradução.
- `css/styles.css`: identidade e componentes originais.
- `css/navigation.css`: navegação, temas, configurações e estados de movimento.
- `js/preferences.js`: preferências e aplicação inicial do tema.
- `js/i18n.js`: catálogos locais, metadados, textos e rótulos acessíveis.
- `js/navigation.js`: menu, seção ativa e configurações.
- `js/site.js`: contornos SVG, diálogos dos projetos e partículas.
- `js/motion.js`: animações e sua limpeza ao desativar efeitos.
- `js/vendor`: GSAP e ScrollTrigger, com avisos de origem e licença.
- `tests/browser.cjs`: verificações da navegação e das preferências em navegador real.

Os arquivos antigos não referenciados pelo HTML permanecem como histórico do projeto.

## Desenvolvimento

Requer Node.js 22 ou superior apenas para as ferramentas de desenvolvimento:

```sh
npm ci
npx playwright install chromium
npm run check
npm test
```

Para executar com um Chromium instalado em outro caminho, defina `TEST_BROWSER_EXECUTABLE`. `PORTFOLIO_SCREENSHOTS` define a pasta opcional de capturas de verificação. `npm run vendor` atualiza os dois arquivos locais a partir da versão fixada no lockfile.

## Publicação

A branch `main` é validada e publicada no GitHub Pages pelo workflow de publicação. Notas em `docs/release-v*.md` acionam a criação da release correspondente à versão de `package.json`, com um ZIP completo. Releases existentes são preservadas.

Os textos descrevem projetos e formas de trabalho; não declaram métricas de resultado, nível de senioridade ou clientes não comprovados.
