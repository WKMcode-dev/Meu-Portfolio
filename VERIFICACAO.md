# Verificação — v1.1.0

Executada em Chromium headless, com a interface real e os arquivos locais.

- Larguras: 320, 390, 768 e 1440 px.
- Menu mobile: abrir, fechar com Escape, estado expandido e retorno de foco.
- Configurações: abrir/fechar, temas claro e escuro, três idiomas e efeitos.
- Persistência: recarregamento mantém tema, idioma e efeitos.
- Projetos: diálogo e descrição traduzidos; fechamento por Escape.
- Layout: conteúdo dos cards e elementos visíveis sem transbordamento horizontal.
- GSAP 3.15.0 carregado; ScrollTriggers removidos ao desativar efeitos e recriados ao ativar.
- Mudança da preferência de movimento do sistema cancela os efeitos decorativos.
- Armazenamento bloqueado: configurações continuam funcionando durante a visita.
- Abertura direta de index.html com file://.
- JavaScript desativado: conteúdo e links de navegação disponíveis.
- Biblioteca de animação indisponível: navegação e configurações continuam funcionando.
- Verificação sintática dos cinco scripts da aplicação.

As capturas de temas, menu e configurações também foram inspecionadas visualmente. O efeito de inversão usa backdrop-filter com alternativa sólida em navegadores sem suporte.
