# Verificação da recriação

## Executado
- Sintaxe do JavaScript validada pelo compilador do Node (vm.Script).
- HTML analisado com HTMLParser: tags balanceadas, IDs únicos, um h1, âncoras existentes, imagens com alt, sem elementos interativos aninhados.
- Referências locais verificadas contra a árvore original do repositório e os arquivos novos.
- Proteção noopener/noreferrer nos links que abrem nova aba.
- Verificação básica de equilíbrio das chaves CSS.
- JavaScript exercitado em DOM simulado: frames SVG em larguras de 320, 768 e 1180 px e redimensionamento para 280 px; ausência de NaN e de SVG duplicado; três diálogos abrem/fecham e retornam foco; botão de efeitos (a versão inicial também respeitava movimento reduzido); 24 barras decorativas.

## Limites
O navegador de testes não conseguiu acessar a prévia local (timeout). Portanto não foi confirmada a renderização visual, CSS completo, foco nativo/teclado ou carregamento real das imagens no navegador. Os testes de DOM simulam o comportamento e não substituem uma conferência visual.

## Conferência recomendada após extrair
1. Abra index.html no navegador atual.
2. Confira larguras 320, 768 e 1180 px e zoom de 200%: conteúdo legível, cards empilhados e sem barra horizontal.
3. Abra os detalhes de cada projeto: feche com botão, Escape e clique no fundo; confira o retorno de foco.
4. Use Tab para verificar links, controles e o atalho de pular ao conteúdo.
5. Confira que os efeitos iniciam ativos mesmo com movimento reduzido no sistema; pause e reative pelo botão.
6. Confira as imagens e os links dos projetos preservados do original.

Nenhuma alteração foi feita no motor do ClickLimit nem nas configurações do Windows.

## Ajuste de efeitos solicitado
Efeitos agora iniciam ativos mesmo com movimento reduzido no sistema. Mantidas pausa manual e pausa das partículas em aba oculta. Validação em DOM simulado: início ativo com preferência de movimento reduzido, pausa e reativação manual.

## Botão encaixado no recorte
O card de criação recebeu uma abertura inferior real no caminho SVG, medida a partir do botão HTML. Espaçamento de 12px entre peça e recorte, chanfros de 8px e botão projetado 8px para fora da borda. O conteúdo reserva altura para o botão, inclusive com quebra de linha. ResizeObserver acompanha card e botão.
Validação: sintaxe JavaScript e geometria em memória para larguras 280/320/480/768px; alturas de botão 56px e 80px; abertura na posição esperada e ausência de SVG duplicado. Não houve conferência visual no navegador.
