<script>
  import { onMount, tick } from 'svelte';
  import { Garden, gardens, ports, inspect, directionNames, readSave, record, bindLifecycle } from './game.js';

  let game = new Garden(0), started = false, panel = null, message = '', highlighted = null;
  let save;
  try { save = readSave(localStorage.getItem('vagalume.save')); } catch { save = readSave(null); }
  let audio, lastFocus;
  $: report = inspect(game.tiles);
  $: unit = gardens[game.level].radius === 1 ? 76 : 54;
  $: allComplete = save.completed.length === gardens.length;
  function persist() { try { localStorage.setItem('vagalume.save', JSON.stringify(save)); } catch { /* Local play remains available. */ } }
  function sound(note = 420) {
    if (save.muted) return;
    try {
      audio ??= new AudioContext(); if (audio.state === 'suspended') void audio.resume();
      const now = audio.currentTime, oscillator = audio.createOscillator(), gain = audio.createGain();
      oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(note, now); oscillator.frequency.exponentialRampToValueAtTime(note * 1.5, now + .15);
      gain.gain.setValueAtTime(.035, now); gain.gain.exponentialRampToValueAtTime(.001, now + .24);
      oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(); oscillator.stop(now + .25);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    } catch { /* Sound is optional. */ }
  }
  function announce(text) { message = text; }
  async function focusBoard() { await tick(); document.querySelector('.cell:not(:disabled)')?.focus({preventScroll:true}); }
  async function openPanel(kind) {
    lastFocus = document.activeElement; panel = kind;
    if (kind !== 'won') game.pause(); game = game;
    await tick(); document.querySelector('.modal button')?.focus({preventScroll:true});
  }
  async function closePanel() {
    panel = null; game.resume(); game = game; await tick();
    if (lastFocus?.isConnected && !lastFocus.disabled) lastFocus.focus({preventScroll:true});
    else if (started) focusBoard();
  }
  function changed(text) {
    game = game; announce(text);
    if (game.mode === 'won') {
      save = record(save, game); persist(); sound(660); openPanel('won');
      announce(`${gardens[game.level].name} floresceu. ${game.moves} movimentos${game.hints ? ', com dicas' : ', sem dicas'}.`);
    }
  }
  function turn(id, backwards = false) {
    if (!started || panel) return;
    if (game.turn(id, backwards ? -1 : 1)) {
      highlighted = null; sound(300 + game.result.live.size * 19);
      changed(`${game.result.live.size} de ${game.tiles.length} peças iluminadas. ${game.result.leaks} pontas soltas.`);
    }
  }
  function hint() {
    const id = game.hint(); highlighted = id;
    if (id) { sound(540); changed('Uma peça foi orientada. Partida assistida: dicas não contam para o recorde sem ajuda.'); }
  }
  function undo() { if (game.undo()) { highlighted = null; changed('Última rotação desfeita.'); sound(250); } }
  function restart() { game = new Garden(game.level); panel = null; highlighted = null; announce('Jardim recomeçado.'); focusBoard(); }
  function selectLevel(level) { game = new Garden(level); started = true; panel = null; highlighted = null; announce(`Jardim ${level + 1}: ${gardens[level].name}. Conecte todas as peças sem pontas soltas.`); focusBoard(); }
  function start() { started = true; sound(480); announce('Gire as peças para levar a luz a todo o jardim. O vagalume do centro não gira.'); focusBoard(); }
  function backHome() { started = false; panel = null; game = new Garden(0); highlighted = null; tick().then(()=>document.querySelector('.start')?.focus()); }
  function pause() { if (started && !panel && game.mode === 'playing') { openPanel('pause'); announce('Jardim em pausa.'); } }
  function keyboard(event) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (panel && event.key === 'Escape') { event.preventDefault(); if(panel !== 'won') closePanel(); }
    else if (!panel && started && event.key.toLowerCase() === 'p') { event.preventDefault(); pause(); }
    if (panel && event.key === 'Tab') {
      const list = [...document.querySelectorAll('.modal button:not(:disabled),.modal a')];
      const first=list[0], last=list[list.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    }
  }
  function navigate(event, tile) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
    event.preventDefault(); const position = t => ({x:t.q+t.r/2,y:t.r*1.5});
    const origin=position(tile);const candidates=game.tiles.filter(t=>!t.locked&&t.id!==tile.id).map(t=>({tile:t,...position(t)}));
    const horizontal=event.key==='ArrowLeft'||event.key==='ArrowRight', sign=['ArrowLeft','ArrowUp'].includes(event.key)?-1:1;
    const next=candidates.filter(t=>sign*((horizontal?t.x:t.y)-(horizontal?origin.x:origin.y))>.01).sort((a,b)=>{
      const distance=t=>Math.hypot(t.x-origin.x,t.y-origin.y)+Math.abs(horizontal?t.y-origin.y:t.x-origin.x)*2;
      return distance(a)-distance(b);
    })[0];
    if(next)document.getElementById(`tile-${next.tile.id}`)?.focus({preventScroll:true});
  }
  function label(tile,i) { return `Peça ${i+1}, ${tile.locked ? 'âncora fixa' : 'girar'}, ${report.live.has(tile.id)?'iluminada':'apagada'}, saídas: ${ports(tile).map(d=>directionNames[d]).join(', ')}`; }
  function tileStyle(tile) { return `left:${(280+Math.sqrt(3)*unit*(tile.q+tile.r/2))/560*100}%;top:${(250+1.5*unit*tile.r)/500*100}%;width:${Math.sqrt(3)*unit/560*100}%;height:${unit*2/500*100}%;`; }
  function toggleSound(){save={...save,muted:!save.muted};persist();sound();}
  function toggleEffects(){save={...save,reduced:!save.reduced};persist();}
  onMount(()=>{
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)save={...save,reduced:true};
    return bindLifecycle(window,document,pause);
  });
</script>

<svelte:window onkeydown={keyboard}/>
<div class:reduced={save.reduced} class="world">
  <svg class="botanical left-leaves" viewBox="0 0 240 700" aria-hidden="true"><path d="M10 700Q210 430 48 45"/><path d="M98 260Q5 240 23 130Q130 144 98 260M112 366Q218 280 207 195Q92 235 112 366M97 472Q-6 445 8 344Q119 355 97 472M77 559Q205 525 201 412Q78 441 77 559M40 649Q-25 575 1 509Q84 550 40 649"/></svg>
  <svg class="botanical right-leaves" viewBox="0 0 240 700" aria-hidden="true"><path d="M10 700Q210 430 48 45"/><path d="M98 260Q5 240 23 130Q130 144 98 260M112 366Q218 280 207 195Q92 235 112 366M97 472Q-6 445 8 344Q119 355 97 472M77 559Q205 525 201 412Q78 441 77 559"/></svg>
  <div class="dust" aria-hidden="true">{#each Array(15) as _,i}<i style={`--i:${i};left:${(i*37)%100}%;top:${(i*23+15)%100}%`}></i>{/each}</div>
  <div class="shell" inert={panel!==null}>
    <header><a class="brand" href="./" aria-label="Vagalume, início"><svg viewBox="0 0 44 44" aria-hidden="true"><ellipse cx="15" cy="15" rx="9" ry="13" transform="rotate(-30 15 15)"/><ellipse cx="29" cy="15" rx="9" ry="13" transform="rotate(30 29 15)"/><circle cx="22" cy="30" r="7"/></svg>vagalume<span>um jardim de conexões</span></a><nav aria-label="Preferências e ajuda"><button onclick={toggleSound} aria-pressed={!save.muted}>{save.muted?'Som desligado':'Som ligado'}</button><button onclick={toggleEffects} aria-pressed={save.reduced}>{save.reduced?'Movimento reduzido':'Reduzir movimento'}</button><button onclick={()=>openPanel('help')}>Como jogar <span>?</span></button></nav></header>
    <main>
      <div class="heading" class:playing={started}><p class="eyebrow">{started?`JARDIM ${String(game.level+1).padStart(2,'0')} / 05`:'UM PUZZLE PARA DESACELERAR'}</p><h1>{#if started}{gardens[game.level].name}{:else}Onde a luz cria <em>raízes.</em>{/if}</h1><p class="subtitle">{started?gardens[game.level].subtitle:'Gire os caminhos. Encontre as conexões. Deixe florescer.'}</p></div>
      <section class="garden-stage" aria-label="Tabuleiro do jardim">
        <div class="orbit orbit-one" aria-hidden="true"></div><div class="orbit orbit-two" aria-hidden="true"></div>
        <div class="readout lights"><span class="little-spark">✧</span><strong>{report.live.size}<small> / {game.tiles.length}</small></strong><span>peças com luz</span></div>
        <div class="readout moves"><strong>{String(game.moves).padStart(2,'0')}</strong><span>movimentos</span></div>
        <div class="board" class:preview={!started}>
          {#each game.tiles as tile,i (tile.id)}
            <button id={`tile-${tile.id}`} class="cell" class:lit={report.live.has(tile.id)} class:anchored={tile.locked} class:hinted={highlighted===tile.id} style={tileStyle(tile)} disabled={!started||tile.locked||game.mode!=='playing'} aria-label={label(tile,i)} title={label(tile,i)} onclick={e=>turn(tile.id,e.shiftKey)} oncontextmenu={e=>{e.preventDefault();turn(tile.id,true);}} onkeydown={e=>navigate(e,tile)}>
              <svg viewBox="0 0 100 116" aria-hidden="true">
                <path class="hex-shadow" d="M50 2L98 30V86L50 114L2 86V30Z"/>
                <path class="hex" d="M50 2L98 30V86L50 114L2 86V30Z"/>
                <g class="channels" style={`transform:rotate(${tile.rotation*60}deg)`}>
                  {#each tile.base as d}<path class="channel" d={`M50 58 L${50+Math.cos(d*Math.PI/3)*49} ${58+Math.sin(d*Math.PI/3)*49}`}/>{/each}
                  {#if report.live.has(tile.id)}{#each tile.base as d}<path class="flow" d={`M50 58 L${50+Math.cos(d*Math.PI/3)*49} ${58+Math.sin(d*Math.PI/3)*49}`}/>{/each}{/if}
                </g>
                <circle class="junction" cx="50" cy="58" r="7"/>
                {#if tile.id==='0,0'}<g class="firefly"><ellipse class="wing l" cx="39" cy="43" rx="9" ry="15" transform="rotate(-30 39 43)"/><ellipse class="wing r" cx="61" cy="43" rx="9" ry="15" transform="rotate(30 61 43)"/><ellipse class="body" cx="50" cy="59" rx="8" ry="13"/><circle cx="50" cy="64" r="5"/></g>
                {:else if tile.base.length===1}<g class="flower">{#each [0,60,120,180,240,300] as angle}<ellipse cx="50" cy="47" rx="5" ry="10" transform={`rotate(${angle} 50 58)`}/>{/each}<circle cx="50" cy="58" r="4"/></g>{/if}
                {#if tile.locked&&tile.id!=='0,0'}<path class="lock" d="M45 30V25A5 5 0 0 1 55 25V30M43 30H57V39H43Z"/>{/if}
                <text x="50" y="98" class="tile-id">{tile.id==='0,0'?'✦':String(i+1).padStart(2,'0')}</text>
                {#if report.live.has(tile.id)&&tile.id!=='0,0'}<circle class="lit-mark" cx="50" cy="19" r="2"/>{/if}
              </svg>
            </button>
          {/each}
        </div>
      </section>
      {#if !started}<div class="invitation"><button class="start pill primary" onclick={start}>Entrar no jardim <span>↗</span></button><p>Sem pressa. Sem perder vidas. Só mais uma conexão.</p></div>
      {:else}<div class="game-controls"><p class="diagnosis">{report.solved?'O jardim floresceu.':`${report.leaks} pontas soltas · conecte todas as peças`} {#if game.hints}<span>· com assistência</span>{/if}</p><div class="tools"><button class="pill" onclick={undo} disabled={!game.history.length||game.mode!=='playing'}>↶ <span>Desfazer</span></button><button class="pill" onclick={hint} disabled={game.mode!=='playing'}>✧ <span>Uma luz</span></button><button class="pill" onclick={restart}>⟳ <span>Recomeçar</span></button><button class="pill" onclick={pause} disabled={game.mode!=='playing'}>Ⅱ <span>Pausa</span></button></div><p class="tip">Clique para girar · Shift + clique para voltar · a peça central é fixa</p></div>{/if}
      <nav class="garden-select" aria-label="Escolher jardim">{#each gardens as garden,i}<button class:active={game.level===i} aria-label={`Jardim ${i+1}: ${garden.name}${save.completed.includes(i)?', concluído':''}`} aria-current={game.level===i?'step':undefined} onclick={()=>selectLevel(i)}><span>{save.completed.includes(i)?'✿':String(i+1).padStart(2,'0')}</span><small>{garden.name}</small></button>{/each}</nav>
    </main>
    <footer><span>FEITO DE PEQUENOS ENCONTROS</span><a href="https://github.com/gustapaz/vagalume" target="_blank" rel="noopener noreferrer">Código & bastidores ↗</a><span>{save.completed.length} de 5 jardins floridos · neste dispositivo</span></footer>
  </div>
  {#if panel}<div class="veil"><div class="modal" role="dialog" tabindex="-1" aria-modal="true" aria-labelledby="dialog-title">
    <span class="modal-symbol" aria-hidden="true">{panel==='won'?'✿':panel==='pause'?'☾':'✧'}</span>
    <p class="eyebrow">{panel==='won'?'UM PEQUENO MILAGRE':panel==='pause'?'O JARDIM PODE ESPERAR':'MANUAL DE CULTIVO'}</p>
    <h2 id="dialog-title">{panel==='won'?(allComplete?'A noite inteira floresceu.':'Você fez a luz chegar.'):panel==='pause'?'Respire um pouco.':'Uma conexão de cada vez.'}</h2>
    {#if panel==='help'}<ol><li>Gire as peças para unir os caminhos. A luz parte do vagalume central, que é fixo.</li><li>As saídas devem se encontrar dos dois lados. Ilumine <strong>todas as peças</strong> e não deixe pontas soltas.</li><li>Clique, toque, Enter ou Espaço gira 60°. Shift + clique ou botão direito gira para trás. As setas navegam entre peças.</li><li>Flores nascem nas pontas do caminho. Peças com cadeado são âncoras fixas.</li><li>“Uma luz” orienta uma peça. É uma dica de verdade e marca a partida como assistida; não registra recorde sem ajuda.</li></ol><p class="modal-note">Sem tempo limite. Sem conta. Seus jardins floridos e recordes ficam neste dispositivo.</p><button class="pill primary" onclick={closePanel}>Vou cultivar ↗</button>
    {:else if panel==='pause'}<p>Nenhuma luz vai fugir. Sua configuração permanece aqui até você decidir continuar.</p><button class="pill primary" onclick={closePanel}>Voltar ao jardim ↗</button><button class="text-button" onclick={backHome}>Voltar ao início</button>
    {:else}<p><strong>{gardens[game.level].name}</strong> floresceu em {game.moves} movimentos. {game.hints?`${game.hints} dicas usadas · partida assistida.`:'Sem dicas. O caminho foi todo seu.'}</p>{#if save.best[game.level]!==null}<p class="modal-note">Seu melhor sem dicas: {save.best[game.level]} movimentos.</p>{/if}<button class="pill primary" onclick={()=>game.level<4?selectLevel(game.level+1):backHome()}>{game.level<4?'Descobrir próximo jardim ↗':'Contemplar e voltar ↗'}</button><button class="text-button" onclick={restart}>Cultivar este jardim de novo</button>{/if}
  </div></div>{/if}
  <p class="sr-only" role="status">{message}</p>
</div>
