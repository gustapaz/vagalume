export const directions = [[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]];
export const directionNames = ['leste','sudeste','sudoeste','oeste','noroeste','nordeste'];
export const gardens = [
  {name:'Primeira luz', subtitle:'Todo caminho começa com uma pequena faísca.',radius:1,seed:91,anchors:0},
  {name:'Orvalho',subtitle:'Há beleza no encontro de dois caminhos.',radius:2,seed:282,anchors:0},
  {name:'Raízes',subtitle:'Nem toda conexão é visível à primeira vista.',radius:2,seed:1721,anchors:2},
  {name:'Vento sul',subtitle:'Mude a direção. Deixe a luz encontrar passagem.',radius:2,seed:408,anchors:1},
  {name:'Constelação',subtitle:'Pequenas luzes, um mesmo céu.',radius:2,seed:2301,anchors:0},
];
export const key = (q,r) => `${q},${r}`;
export const mod = x => ((x%6)+6)%6;
export function ports(tile) { return tile.base.map(d=>mod(d+tile.rotation)); }
export function makeBoard(level) {
  if (!Number.isInteger(level)||level<0||level>=gardens.length) throw new RangeError('Jardim inválido');
  const config=gardens[level], tiles=[], lookup=new Map();
  for(let r=-config.radius;r<=config.radius;r++) for(let q=-config.radius;q<=config.radius;q++) {
    if(Math.abs(q+r)>config.radius)continue;
    const tile={id:key(q,r),q,r,base:[],rotation:0,initial:0,locked:q===0&&r===0};tiles.push(tile);lookup.set(tile.id,tile);
  }
  let seed=config.seed;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const visited=new Set(['0,0']), stack=[lookup.get('0,0')];
  while(stack.length){
    const current=stack[stack.length-1];
    const choices=directions.map(([dq,dr],d)=>({d,tile:lookup.get(key(current.q+dq,current.r+dr))})).filter(v=>v.tile&&!visited.has(v.tile.id));
    if(!choices.length){stack.pop();continue;}
    const {d,tile}=choices[Math.floor(random()*choices.length)];
    current.base.push(d);tile.base.push(mod(d+3));visited.add(tile.id);stack.push(tile);
  }
  let anchors=config.anchors;
  for(const tile of tiles){
    if(!tile.locked&&anchors>0&&tile.base.length>1){tile.locked=true;anchors--;}
    if(!tile.locked)tile.rotation=1+Math.floor(random()*5);
    tile.initial=tile.rotation;tile.visualRotation=tile.rotation;
  }
  return tiles;
}
export function inspect(tiles) {
  const map=new Map(tiles.map(t=>[t.id,t]));const live=new Set();const source=map.get('0,0');
  if(!source)return {live,leaks:0,solved:false};
  const todo=[source];live.add(source.id);
  while(todo.length){const tile=todo.pop();for(const d of ports(tile)){
    const [dq,dr]=directions[d], next=map.get(key(tile.q+dq,tile.r+dr));
    if(next&&ports(next).includes(mod(d+3))&&!live.has(next.id)){live.add(next.id);todo.push(next);}
  }}
  let leaks=0;
  for(const tile of tiles) for(const d of ports(tile)){
    const [dq,dr]=directions[d],next=map.get(key(tile.q+dq,tile.r+dr));
    if(!next||!ports(next).includes(mod(d+3)))leaks++;
  }
  return {live,leaks,solved:tiles.length>0&&live.size===tiles.length&&leaks===0};
}
export class Garden {
  constructor(level=0){this.level=level;this.tiles=makeBoard(level);this.moves=0;this.hints=0;this.history=[];this.mode='playing';}
  get result(){return inspect(this.tiles);}
  turn(id,amount=1){
    const tile=this.tiles.find(t=>t.id===id);
    if(this.mode!=='playing'||!tile||tile.locked||!Number.isInteger(amount)||amount===0)return false;
    this.history.push({id,rotation:tile.rotation,visualRotation:tile.visualRotation});
    tile.rotation=mod(tile.rotation+amount);tile.visualRotation+=amount;this.moves++;
    if(this.result.solved)this.mode='won';return true;
  }
  undo(){if(this.mode!=='playing'||!this.history.length)return false;const prev=this.history.pop();const tile=this.tiles.find(t=>t.id===prev.id);tile.rotation=prev.rotation;tile.visualRotation=prev.visualRotation;this.moves=Math.max(0,this.moves-1);return true;}
  hint(){
    if(this.mode!=='playing')return null;
    const tile=this.tiles.find(t=>!t.locked&&ports(t).slice().sort().join(',')!==t.base.slice().sort().join(','));
    if(!tile)return null;
    this.hints++;this.turn(tile.id,-tile.rotation);return tile.id;
  }
  pause(){if(this.mode==='playing')this.mode='paused';}
  resume(){if(this.mode==='paused')this.mode='playing';}
}
export function readSave(raw){
  const fallback={version:1,muted:true,reduced:false,completed:[],best:[null,null,null,null,null]};
  try{const value=JSON.parse(raw||'null');if(value?.version!==1)return fallback;
    return {...fallback,muted:typeof value.muted==='boolean'?value.muted:true,reduced:typeof value.reduced==='boolean'?value.reduced:false,
      completed:Array.isArray(value.completed)?[...new Set(value.completed.filter(v=>Number.isInteger(v)&&v>=0&&v<5))]:[],
      best:Array.from({length:5},(_,i)=>Number.isSafeInteger(value.best?.[i])&&value.best[i]>=0&&value.best[i]<=100000?value.best[i]:null)};
  }catch{return fallback;}
}
export function record(save,game){
  if(game.mode!=='won'||!game.result.solved)return save;
  const next={...save,completed:[...new Set([...save.completed,game.level])],best:[...save.best]};
  if(!game.hints&&(next.best[game.level]===null||game.moves<next.best[game.level]))next.best[game.level]=game.moves;
  return next;
}
export function bindLifecycle(win,doc,onPause){
  const blur=()=>onPause(),visibility=()=>{if(doc.hidden)onPause();};
  win.addEventListener('blur',blur);doc.addEventListener('visibilitychange',visibility);
  return()=>{win.removeEventListener('blur',blur);doc.removeEventListener('visibilitychange',visibility);};
}
