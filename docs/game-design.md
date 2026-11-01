# Vagalume — onde a luz cria raízes

Puzzle single-player local de rotação e conectividade, sem servidor. Svelte 5 + JavaScript + SVG e CSS. Público: quem gosta de lógica espacial em sessões curtas, sem pressão de tempo. Referência de gênero: caminhos rotativos; identidade, tabuleiros, código e áudio próprios.

## Regras e loop
Gire uma peça hexagonal 60° por clique/toque/Enter. Shift+clique ou botão direito gira no sentido inverso. A luz parte do vagalume central fixo e só atravessa conexões recíprocas. Conecte TODAS as peças e elimine todas as pontas abertas para florescer o jardim. Peças conectadas ficam luminosas e recebem uma marca visível; cores não são a única indicação. Uma peça pode acender antes de estar corretamente orientada. Não há relógio, limite de tentativas ou derrota artificial: configurações incompletas recebem diagnóstico e podem ser corrigidas.

Cinco jardins determinísticos: Primeira luz (7 peças), Orvalho, Raízes, Vento sul e Constelação (19 peças cada). Redes geradas como árvores abrangentes por seeds fixas, depois rotacionadas; construção garante ao menos uma solução, sem alegar unicidade. Fonte central bloqueada. Algumas peças dos jardins posteriores também ficam ancoradas na orientação da solução. Vitória por avaliação real da rede, não por comparação estrita com uma única solução.

Desfazer, reiniciar jardim, ajuda reabrível, pausa, seleção livre de jardim, progressão e conclusão da coleção. Dica opcional orienta uma peça usando a solução de referência e marca a partida como assistida, explicitamente. Recordes de movimentos sem assistência e conclusão ficam apenas no dispositivo. Undo não apaga o uso de assistência. Reiniciar mantém preferências/recordes, mas restaura o tabuleiro inicial.

## Visual e interação
Campo central orgânico, fundo de mata azul-petróleo, folhas e ramos autorais em SVG, caminhos de luz âmbar, flores violeta. Tipografia serifada leve, botões arredondados discretos e controles flutuantes abaixo do jardim; sem colunas editoriais ou arena retangular de arcade. Pulso de luz, asas do vagalume e florescimento comunicam estado. Movimento reduzido respeita o sistema e tem controle próprio. Sons Web Audio procedurais, desligados inicialmente, sem música externa.

Botões de peças em DOM, ativáveis por teclado; setas navegam pela proximidade no tabuleiro, Tab funciona normalmente, Enter/Espaço gira. Labels incluem coordenadas, direções de saída e conexão. Controles de toque são botões, sem exigir multitouch ou arraste. Fonte e âncoras são identificadas e não giram. Partida por turnos não avança em background; ocultar/foco perdido pausa a interface quando o navegador emite os eventos, retomada explícita.

## Aceitação
Testar coordenadas hexagonais/reciprocidade, gerador e soluções dos cinco jardins, rotações, vitória válida, dicas, undo, reinício, save inválido e lifecycle. Jogar no navegador até conclusão e reinício, incluindo uso explícito de dicas se necessário para cobrir toda a campanha. Testar teclado, viewport móvel, ajuda/pausa e preferências. Escanear staged, histórico e build com regras externas e redação. Publicar repo e Pages gratuitos sem cartão/faturamento, commits noreply com apenas gustapaz na main. Registrar limites reais de dispositivo/toque físico.
