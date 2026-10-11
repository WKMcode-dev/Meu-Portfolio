# Meu Portfólio — SCI-FI modernizado

Recriação do portfólio de Wryell Kenneth em HTML, CSS e JavaScript puro. Mantém grafite, vermelho, detalhes verdes/laranja e os assets originais.

## Abrir
Baixe o ZIP desta branch, extraia e abra index.html no Edge, Chrome ou Firefox atual. Não precisa instalar dependências. Os arquivos e imagens usam caminhos relativos, inclusive em subpastas de hospedagem.

## Arquivos principais
- index.html: conteúdo e estrutura semântica.
- css/styles.css: layout responsivo, identidade visual e estados de foco.
- js/site.js: contornos SVG, detalhes dos projetos, partículas e controle de efeitos.
- imgs/: imagens e SVGs do projeto original, preservados.

Os outros CSS/JS antigos permanecem como referência, mas index.html carrega apenas styles.css e site.js.

## Correções
- Conteúdo determina a altura dos cards; sem altura fixa ou corte de texto.
- Grades empilham em telas menores; tipografia legível e controles com espaço.
- Recortes SVG calculados a partir do tamanho real, com borda contínua.
- Links de imagens relativos corrigidos: imgs/ no HTML, não ../imgs/.
- Um único h1 e títulos hierárquicos; link para pular ao conteúdo.
- Links e botões separados; não há botão dentro de link ou link dentro de botão.
- Detalhes em dialog nativo: Escape, botão de fechar, fechamento por fundo e retorno de foco.
- Links externos com noopener/noreferrer.
- Efeitos pausáveis, ativos por padrão independentemente da preferência de movimento reduzido do sistema, partículas limitadas e pausadas em aba oculta.
- O código não inventa endereço de e-mail, telefone, métricas ou documentação de projetos.

## Como personalizar
Cores e largura máxima ficam em :root de css/styles.css. Conteúdo e links ficam no HTML.
Para estudar os recortes: drawFrame() em js/site.js cria a sequência M/L/Z. ResizeObserver atualiza as coordenadas quando o card muda de tamanho.
SVG é decorativo; os textos continuam HTML para quebra de linhas e acessibilidade.
Sem JavaScript, o conteúdo e links permanecem, com cards retangulares e borda CSS.

## Verificação
Consulte o relatório entregue com esta versão para os testes efetivamente executados. Links externos foram preservados do original; a disponibilidade dos projetos é responsabilidade dos respectivos repositórios.
