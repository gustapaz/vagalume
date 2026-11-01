import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Garden, gardens, makeBoard, ports, inspect, mod, readSave, record, bindLifecycle } from '../src/game.js';

test('five deterministic gardens start unsolved with valid unique hex coordinates',()=>{
  for(let i=0;i<5;i++){
    const board=makeBoard(i); assert.equal(board.length,i===0?7:19);
    assert.deepEqual(board,makeBoard(i)); assert.equal(new Set(board.map(t=>t.id)).size,board.length);
    assert.equal(inspect(board).solved,false);
    assert.ok(board.find(t=>t.id==='0,0').locked);
    for(const t of board){assert.ok(t.base.length>0);assert.equal(new Set(t.base).size,t.base.length);if(t.locked)assert.equal(t.rotation,0);}
  }
  assert.throws(()=>makeBoard(8),RangeError);
});
test('restoring reference orientation proves all five gardens solvable and fully connected',()=>{
  for(let i=0;i<5;i++){
    const board=makeBoard(i);for(const tile of board)tile.rotation=0;
    const result=inspect(board);assert.equal(result.live.size,board.length);assert.equal(result.leaks,0);assert.equal(result.solved,true);
    assert.equal(board.reduce((sum,t)=>sum+t.base.length,0),2*(board.length-1));
  }
});
test('six rotations return ports to original orientation; negative rotations wrap',()=>{
  const game=new Garden();const tile=game.tiles.find(t=>!t.locked), original=ports(tile);
  const initialVisual=tile.visualRotation;
  for(let i=0;i<6;i++)game.turn(tile.id);assert.deepEqual(ports(tile),original);assert.equal(game.moves,6);assert.equal(mod(-1),5);assert.equal(tile.visualRotation,initialVisual+6);
});
test('fixed source and invalid moves cannot mutate board or score',()=>{
  const game=new Garden();const before=JSON.stringify(game.tiles);
  for(const [id,delta] of [['0,0',1],['bad',1],[game.tiles[0].id,NaN],[game.tiles[0].id,0]])assert.equal(game.turn(id,delta),false);
  assert.equal(JSON.stringify(game.tiles),before);assert.equal(game.moves,0);
});
test('light requires reciprocal ports, not adjacent geometry alone',()=>{
  const source={id:'0,0',q:0,r:0,base:[0],rotation:0};const tile={id:'1,0',q:1,r:0,base:[3],rotation:1};
  assert.equal(inspect([source,tile]).live.size,1);assert.equal(inspect([source,tile]).solved,false);
  tile.rotation=0;assert.equal(inspect([source,tile]).solved,true);
});
test('all pieces lit is insufficient when an extra open port exists',()=>{
  const tiles=[{id:'0,0',q:0,r:0,base:[0],rotation:0},{id:'1,0',q:1,r:0,base:[3,0],rotation:0}];
  const result=inspect(tiles);assert.equal(result.live.size,2);assert.equal(result.leaks,1);assert.equal(result.solved,false);
  assert.equal(inspect([]).solved,false);
});
test('undo restores orientation/moves and pause blocks actions until explicit resume',()=>{
  const game=new Garden(), tile=game.tiles.find(t=>!t.locked), before=tile.rotation;
  game.turn(tile.id);assert.equal(game.moves,1);game.undo();assert.equal(tile.rotation,before);assert.equal(game.moves,0);
  game.pause();assert.equal(game.turn(tile.id),false);assert.equal(game.hint(),null);game.resume();assert.equal(game.turn(tile.id),true);
});
test('hints complete all gardens through real rotations and mark assistance permanently for that attempt',()=>{
  for(let i=0;i<5;i++){
    const game=new Garden(i);let count=0;
    while(game.mode==='playing'&&count<30){assert.ok(game.hint());count++;}
    assert.equal(game.mode,'won');assert.equal(game.result.solved,true);assert.ok(game.hints>0);assert.equal(game.turn(game.tiles[0].id),false);
  }
  const game=new Garden();game.hint();game.undo();assert.equal(game.hints,1);
});
test('fresh garden restores exact scramble and resets attempt without mutating another game',()=>{
  const first=new Garden(2);first.hint();const fresh=new Garden(2);
  assert.deepEqual(fresh.tiles,makeBoard(2));assert.equal(fresh.hints,0);assert.equal(fresh.moves,0);assert.equal(fresh.history.length,0);
});
test('save validates version, malformed JSON, ranges, duplicates and preference types',()=>{
  for(const raw of [null,'{','null','{"version":9}'])assert.equal(readSave(raw).completed.length,0);
  const save=readSave('{"version":1,"muted":"no","completed":[0,0,4,5,-1,"2"],"best":[-1,42,"3",null,1e20]}');
  assert.deepEqual(save.completed,[0,4]);assert.deepEqual(save.best,[null,42,null,null,null]);assert.equal(save.muted,true);
});
test('assisted completion cannot set best; unassisted wins improve but never worsen best',()=>{
  let save=readSave(null);const assisted=new Garden();while(assisted.mode==='playing')assisted.hint();save=record(save,assisted);
  assert.deepEqual(save.completed,[0]);assert.equal(save.best[0],null);
  const solo=new Garden();for(const tile of solo.tiles){if(tile.locked)continue;while(tile.rotation!==0&&solo.mode==='playing')solo.turn(tile.id);}
  assert.equal(solo.mode,'won');save=record(save,solo);assert.equal(save.best[0],solo.moves);
  const previous=save.best[0];solo.moves+=10;assert.equal(record(save,solo).best[0],previous);
  assert.deepEqual(record(save,new Garden()),save);
});
test('lifecycle pauses on blur/hidden, visible does not resume and cleanup removes handlers',()=>{
  const win=new EventTarget(),doc=Object.assign(new EventTarget(),{hidden:false});let game=new Garden();
  const cleanup=bindLifecycle(win,doc,()=>game.pause());win.dispatchEvent(new Event('blur'));assert.equal(game.mode,'paused');
  game.resume();doc.hidden=true;doc.dispatchEvent(new Event('visibilitychange'));assert.equal(game.mode,'paused');
  doc.hidden=false;doc.dispatchEvent(new Event('visibilitychange'));assert.equal(game.mode,'paused');
  cleanup();game.resume();win.dispatchEvent(new Event('blur'));assert.equal(game.mode,'playing');
});
