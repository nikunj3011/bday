import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import ts from 'typescript';

const elements = {}, progress = [];
const drawing = new Proxy({ createRadialGradient: () => ({ addColorStop() {} }), createLinearGradient: () => ({ addColorStop() {} }) }, { get: (obj, key) => obj[key] || (() => {}) });
function element(id) {
  return elements[id] ??= { textContent:'', style:{}, classList:{add(){},remove(){},toggle(){}}, getBoundingClientRect(){return {left:18,top:500,width:70,height:90}}, setAttribute(){}, getAttribute(){return 'false'}, addEventListener(){}, removeEventListener(){}, getContext:()=>drawing, setPointerCapture(){} };
}
let frame;
const sandbox = {
 document:{querySelector:element}, window:{addEventListener(){},removeEventListener(){}}, innerWidth:390,innerHeight:844,devicePixelRatio:1,
 matchMedia:()=>({matches:false}),performance:{now:()=>0},requestAnimationFrame:fn=>(frame=fn,1),cancelAnimationFrame(){},setTimeout:()=>1,clearTimeout(){},
 Audio:class{pause(){}removeAttribute(){}load(){}},canvas:element('#space'),sitePath:p=>'/'+p,onProgress:p=>progress.push(p),console,
};
vm.createContext(sandbox);
let source = readFileSync('src/universe.ts','utf8').replace("import { sitePath } from './paths';",'');
// Observe the real engine's state without exposing a debug API in the application.
source = source.replace('return () => { cancelAnimationFrame', 'Object.assign(globalThis, { inspect:()=>({cakes,targets,clock,particles,deliveries}), pop, reset, drawDeliveries, advance:(seconds:number)=>{clock+=seconds} }); return () => { cancelAnimationFrame');
const code = ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText.replace('export function','function');
vm.runInContext(code+';globalThis.dispose=startUniverse(canvas,()=>"dark",onProgress)',sandbox);
frame(16);
element('#speed').oninput({target:{value:'9'}});
assert.equal(element('#speed-value').textContent,'90%');
assert.ok(sandbox.inspect().cakes.some(c=>c.speech.length>0),'slider changes make treats taunt');
element('#speed').oninput({target:{value:'0'}});
assert.equal(element('#speed-value').textContent,'0%');
assert.ok(element('#toast').textContent.length>0);
assert.equal(progress.at(-1).remaining,12);
const approach = sandbox.inspect().targets.find(t=>t.c.shy);
element('#space').onpointermove({clientX:approach.x,clientY:approach.y,pointerType:'mouse'});
const dodger={c:sandbox.inspect().cakes.find(c=>c.escapeUntil>0)};
assert.ok(dodger.c);
assert.ok(dodger.c.escapeUntil>sandbox.inspect().clock);
assert.ok(dodger.c.speech.length>0);
// Isolate this cake so overlap cannot redirect the next hover to a different shy cake.
for(const c of sandbox.inspect().cakes)c.shy=c===dodger.c;
const firstEscape=dodger.c.escapeUntil;
sandbox.advance(3);frame(32);
assert.ok(dodger.c.escapeUntil<sandbox.inspect().clock,'escape ends after a short interval');
let targetAgain=sandbox.inspect().targets.find(t=>t.c===dodger.c);
element('#space').onpointermove({clientX:targetAgain.x,clientY:targetAgain.y,pointerType:'mouse'});
assert.equal(dodger.c.escapeUntil,firstEscape,'cooldown leaves time to catch the cake');
sandbox.advance(.4);frame(48);
targetAgain=sandbox.inspect().targets.find(t=>t.c===dodger.c);
element('#space').onpointerdown({clientX:targetAgain.x,clientY:targetAgain.y,pointerId:5});
element('#space').onpointermove({clientX:targetAgain.x+8,clientY:targetAgain.y,pointerType:'mouse'});
assert.ok(dodger.c.escapeUntil>firstEscape,'the same cake escapes again during a drag');
element('#space').onpointercancel();
sandbox.advance(4);frame(64);
const beforeTouch=dodger.c.escapeUntil;
targetAgain=sandbox.inspect().targets.find(t=>t.c===dodger.c);
element('#space').onpointermove({clientX:targetAgain.x,clientY:targetAgain.y,pointerType:'touch'});
assert.equal(dodger.c.escapeUntil,beforeTouch,'touch interactions stay catchable');
assert.equal(progress.at(-1).remaining,12,'dodging must not consume cakes');
for(const target of sandbox.inspect().targets){assert.ok(target.x>=0&&target.x<=390);assert.ok(target.y>=0&&target.y<=844);}
const cakes=[...sandbox.inspect().cakes],expectedCalories=cakes.reduce((sum,c)=>sum+c.calories,0);
for(const c of cakes){sandbox.pop(c);sandbox.pop(c);}
assert.equal(progress.at(-1).eaten,0,'growth waits until the treats arrive');
assert.equal(progress.at(-1).complete,false,'finale waits for the last delivery');
assert.equal(sandbox.inspect().deliveries.length,12,'each treat flies only once');
sandbox.drawDeliveries(.4);
assert.equal(progress.at(-1).eaten,0,'treats remain in flight');
sandbox.drawDeliveries(.5);
assert.equal(sandbox.inspect().deliveries.length,0);
assert.equal(progress.at(-1).calories,expectedCalories,'score each cake exactly once');
assert.equal(progress.at(-1).eaten,12);assert.equal(progress.at(-1).remaining,0);assert.equal(progress.at(-1).complete,true);
assert.ok(sandbox.inspect().particles.length>600,'finale fireworks');
element('#play-again').onclick();assert.equal(progress.at(-1).complete,false);assert.equal(progress.at(-1).calories,0);assert.equal(progress.at(-1).remaining,12);
frame(3216);const target=sandbox.inspect().targets.at(-1);
element('#space').onpointerdown({clientX:target.x,clientY:target.y,pointerId:1});
element('#space').onpointerup({clientX:target.x,clientY:target.y,pointerId:1});
assert.equal(progress.at(-1).remaining,11,'touch/click pops a cake');
assert.equal(sandbox.inspect().deliveries.length,1);element('#add').onclick();assert.equal(progress.at(-1).remaining,12);sandbox.reset();sandbox.drawDeliveries(1);assert.equal(progress.at(-1).calories,0,'reset cancels pending deliveries');sandbox.dispose();assert.equal(element('#play-again').onclick,null);
assert.ok(!readFileSync('src/App.tsx','utf8').includes('github.com/stackedlol'));
// A new candy round must render different geometry, score candies, and finish independently.
progress.length=0;
vm.runInContext('globalThis.dispose=startUniverse(canvas,()=>"light",onProgress,"candy")',sandbox);
frame(16);
assert.equal(progress.at(-1).remaining,12);
assert.equal(progress.at(-1).calories,0);
assert.ok(sandbox.inspect().cakes.every(c=>c.calories>=60&&c.calories<=190));
for(const c of [...sandbox.inspect().cakes])sandbox.pop(c);
assert.equal(progress.at(-1).complete,false);sandbox.drawDeliveries(1);
assert.equal(progress.at(-1).complete,true);
assert.equal(progress.at(-1).eaten,12);
sandbox.dispose();
const ui=readFileSync('src/App.tsx','utf8');assert.ok(ui.includes('<SleepingHelly mode={mode} />'));assert.ok(ui.includes('setMode(choice)'));
const dream=readFileSync('src/SleepingHelly.tsx','utf8');assert.ok(dream.includes('DREAMING IN CANDYLAND'));assert.ok(dream.includes('DREAMING IN CAKE KINGDOM'));
console.log('Passed: flying cakes and candy, delayed growth/scoring, last-arrival finale, canceled deliveries on reset; candy mode, matching dreams, fresh-round scoring; cursor escape and expiry, phone reachability, pop interaction, unique calorie scoring, all-cakes finale, confetti, replay, adding cakes, cleanup, removed link.');
