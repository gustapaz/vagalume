# Testes e entrega

## Modelo

12 testes Node Test Runner: tabuleiros determinísticos e coordenadas válidas; solução dos cinco jardins; rotações e módulo negativo; fonte/âncoras fixas e entradas inválidas; conectividade recíproca; rejeição de rede iluminada com pontas abertas; undo/pausa; dicas até vitória e marca persistente de assistência na tentativa; reinício; save corrompido e tipos inválidos; recordes sem assistência; eventos de foco/visibilidade e cleanup.

O teste das soluções restaura a orientação de referência e inspeciona a rede. As dicas também usam rotações reais e a condição normal de vitória. Não há timer de simulação: o estado do puzzle só muda por ações.

## Build e dependências

Build Vite com JavaScript/Svelte e SVG, cerca de 59 kB JS (23 kB gzip) e 12 kB CSS. Sem imagens, fontes remotas ou loop JS por frame. CSS controla animações, com redução de movimento e quantidades limitadas de partículas.

Auditoria de runtime `npm audit --omit=dev`: zero vulnerabilidades reportadas em 01/11/2026. Auditoria completa: dois avisos baixos pela cadeia `vite-plugin-svelte → deepmerge`, sem versão corrigida informada. [Advisory oficial](https://github.com/advisories/GHSA-gcqx-w48m-w2h4). A ocorrência é na ferramenta de build, usada somente com configuração local confiável; deepmerge não é importado pelo cliente nem recebe objetos de visitantes. Nenhuma falha alta/crítica reportada. CI audita novamente com limite de severidade alta; não há supressão nem `audit fix --force`.

## Navegador

Build de produção, subpasta `/vagalume/`, Chromium integrado: primeiro jardim concluído com 20 rotações reais pela UI, seguindo a solução conhecida do tabuleiro, sem botão de dica; recorde local de 20 movimentos exibido. Enter para girar e Desfazer testados. Ajuda durante o segundo jardim preservou estado.

Orvalho, Raízes, Vento sul e Constelação foram concluídos pela UI usando o botão normal de dica, respectivamente 18, 16, 17 e 18 vezes. A tela final confirmou os cinco jardins floridos; [evidência local](local-completion.png). Reinício após conclusão restaurou o tabuleiro e os movimentos. P para pausa e Escape para retomar foram exercitados. Som/efeitos e cinco conclusões sobreviveram ao reload. A solução não foi injetada no navegador nem a condição de vitória contornada.

Viewport 390 × 844: tabuleiro de 19 peças sem overflow horizontal (documento 390 px); primeira peça com aproximadamente 61 × 71 px, rotação e desfazer após resize funcionaram. Mouse/pointer e viewport não equivalem a teste físico de toque, nem foi feita auditoria completa de leitor de tela. Eventos blur/visibility são cobertos com EventTarget; o navegador integrado historicamente não reproduz esses eventos ao ocultar/trocar suas abas. O puzzle não tem simulação que avance enquanto ausente.

Na [demo pública](https://gustapaz.github.io/vagalume/), o primeiro jardim foi novamente concluído com 20 rotações pela UI, sem dicas: [vitória publicada](public-victory.png). No segundo, 17 dicas iluminaram 18 das 19 peças, restando duas pontas soltas: [partida publicada](public-gameplay.png). A dica seguinte concluiu o jardim normalmente. Reinício restaurou zero movimentos; pausa e retomada por Escape funcionaram. Setas de navegação moveram o foco da peça 1 para a 2; botão direito efetuou rotação inversa. Houve ajuste de pose visual acumulada para manter o sentido de rotação ao atravessar 360°, sem alterar regras ou avaliar a vitória pela animação. O anúncio acessível também informa a retomada, em vez de permanecer com a mensagem de pausa.

## Segurança e custo

Projeto estático sem credenciais, APIs ou backend. Publicação contém apenas build e avisos de licença. `.env`, dependências e build local são ignorados pelo Git. Workflow tem checkout sem credenciais persistidas, build com leitura e deploy apenas Pages/OIDC. GitHub Pages público gratuito, sem cartão ou faturamento ativado.

Gitleaks 8.30.1, configuração padrão externa confiável, redação integral e exclusões locais desconsideradas: staged, histórico e build examinados sem achados de segredos. Secret scanning, proteção de push e alertas/atualizações de segurança habilitados. A conta foi verificada como gustapaz; autor e committer usam Gustavo Paz e noreply. API de contribuidores da main retornou somente gustapaz. Não há merge automático de PRs de dependências.
