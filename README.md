# Vagalume

**Onde a luz cria raízes.** Um puzzle original de caminhos hexagonais num jardim noturno. Gire conexões, leve a luz a todas as peças e veja as flores abrirem — sem relógio e sem perder vidas.

**[Entrar no jardim](https://gustapaz.github.io/vagalume/)**

## Como jogar

- Clique/toque, Enter ou Espaço: girar a peça 60°.
- Shift + clique ou botão direito: girar para trás.
- Setas: navegar pelas peças próximas. Tab: navegação normal.
- P / botão Pausa: pausar. Escape fecha ajuda/pausa.
- Desfazer volta uma rotação; Recomeçar restaura o jardim.
- “Uma luz” orienta uma peça. A partida fica marcada como **assistida** e não registra recorde sem dicas.

O vagalume central é a fonte fixa. A luz só passa quando as saídas dos dois lados se encontram. Conecte **todas as peças e elimine todas as pontas soltas** para vencer. Uma peça acesa não significa necessariamente que sua orientação é a solução. Âncoras com cadeado não giram. Flores nascem nas extremidades da rede.

Cinco jardins determinísticos: Primeira luz, Orvalho, Raízes, Vento sul e Constelação. Cada rede nasce conectada e é embaralhada por rotações; a construção e os testes comprovam uma solução, sem exigir que ela seja única. Todos os jardins podem ser escolhidos livremente. Conclusões e melhores movimentos sem dicas ficam apenas neste dispositivo; o tabuleiro da tentativa não é salvo entre recarregamentos.

## Stack e execução

Svelte 5 + **JavaScript** + SVG/CSS + Vite. Não usa Phaser, Canvas, servidor, contas ou APIs. O modelo de jogo é independente da interface, com busca em grafo para propagação e validação real de conectividade.

Requer Node.js 24 LTS e npm:

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Abra a URL exibida com `/vagalume/`. O workflow testa, audita, compila e publica somente `dist/` no GitHub Pages. A hospedagem de repositórios públicos está disponível no [GitHub Free](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages). Sem cartão, trial ou ativação de faturamento.

## Cuidados

Sem analytics, anúncios, compras, chaves ou serviços de terceiros no jogo. Áudio procedural opcional, inicialmente desligado. Movimento reduzido segue o sistema e tem controle próprio. Dados locais são validados e uma falha de armazenamento não impede jogar. O recorde local não é um placar confiável entre jogadores. Não é prometido funcionamento offline.

Botões HTML com labels de direção e estado, foco visível, navegação por teclado e diálogo com foco contido. Isso não equivale a uma auditoria completa com leitores de tela ou telefone físico; veja [testes e limites](docs/validation.md).

Arte, tabuleiros, animações e sons originais, sem imagens ou músicas de terceiros. [Licenças](docs/assets.md) e [MIT](LICENSE).
