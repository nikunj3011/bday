import { sitePath } from './paths';
type Vec = [number, number, number];
type Projected = { x:number; y:number; s:number; z:number };
type Cake = {x:number;y:number;z:number;size:number;angle:number;tilt:number;phase:number;palette:string[];tiers:number;lit:boolean;calories:number;shy:boolean;escapeUntil:number;dodgeReadyAt:number;vx:number;vy:number;speech:string;speechUntil:number};
type Particle = {x:number;y:number;z:number;vx:number;vy:number;vz:number;life:number;color:string};
type Target = {c:Cake;x:number;y:number;r:number};
type Drag = {x:number;y:number;startX:number;startY:number};
type Delivery = {cake:Cake;startX:number;startY:number;age:number};
type Face = {points?:Vec[];color?:string;z:number;flame?:Projected};
export type GameMode = 'cake' | 'candy';
export type GameProgress = { calories:number; eaten:number; remaining:number; complete:boolean };
export function startUniverse(canvas:HTMLCanvasElement, getTheme:()=> 'light' | 'dark' = () => 'dark', onProgress:(progress:GameProgress)=>void = () => {}, mode:GameMode = 'cake'):()=>void {
 let animation=0;
 const cleanup:(()=>void)[]=[];
 function listen<K extends keyof WindowEventMap>(type:K, handler:(event:WindowEventMap[K])=>void){window.addEventListener(type,handler);cleanup.push(()=>window.removeEventListener(type,handler));}
 function listenCanvas(type:'wheel', handler:(event:WheelEvent)=>void,options:AddEventListenerOptions){canvas.addEventListener(type,handler,options);cleanup.push(()=>canvas.removeEventListener(type,handler));}
// Perspective-projected polygon meshes, rendered locally without dependencies.
const ctx=canvas.getContext('2d')!;
const $=<T extends HTMLElement=HTMLButtonElement>(s:string)=>document.querySelector<T>(s)!;
const rand=(a:number,b:number)=>a+Math.random()*(b-a);
let W=0,H=0,yaw=-.12,pitch=-.13,zoom=1,time=0,speed=7.5,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,ascii=false,cakes:Cake[]=[],particles:Particle[]=[],targets:Target[]=[],drag:Drag|null=null,moved=0;
let calories=0, eaten=0, clock=0, complete=false;
let deliveries:Delivery[]=[];
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const candyPopLines = ["Wrapper? Gone. Dignity? Also gone.", "You licked the competition!", "Tell my gummy bears I loved them.", "My dentist felt a disturbance in the force.", "Helly: 1. Candy self-preservation: 0.", "I was too sweet for this galaxy.", "That's one giant sugar rush for womankind!", "Candyland just lost another citizen."];
const candyDodgeLines = ["Can't catch me, I'm on a sugar rush!", "I'm a jawbreaker, not a heartbreaker!", "Keep your paws off my wrapper!", "My gummy legs are surprisingly fast!", "Lolli-pop? More like lolli-NOPE!"];
const popLines = ["Hey! I had a family-sized filling!", "Worth every cosmic calorie. No regrets.", "Tell my frosting I loved it!", "One small bite for Helly. One giant snack for mankind.", "My lawyer is a cupcake. You'll hear from us.", "You've been promoted to Chief Cake Officer.", "Plot twist: the birthday girl was the black hole.", "I was saving that cherry for retirement!", "Please don't eat me! You wanna get fat? Too late, I'm delicious.", "Your jeans have left the chat."];
const dodgeLines = ["Can't catch me!", "Please don't eat me! I'm too sweet to die!", "I've got layers AND escape plans.", "You want a piece of me? Catch me first!", "Not today, birthday girl!", "Calories? In this economy?!"];
const pick = (lines:string[]) => lines[Math.floor(rand(0,lines.length))];
const palettes=[['#e9a5bc','#f5d7ba','#ad5278'],['#ae94da','#ede0f4','#7a5aab'],['#a7c4af','#e5eacb','#63836c'],['#b4846c','#edc5a1','#704539'],['#e9b579','#ffe3b3','#b77a55']];
const stars=Array.from({length:650},()=>({p:[rand(-2000,2000),rand(-1400,1400),rand(-500,1800)] as Vec,r:rand(.4,1.7),phase:rand(0,7)}));
function resize(){W=innerWidth;H=innerHeight;let d=Math.min(devicePixelRatio||1,2);canvas.width=W*d;canvas.height=H*d;ctx.setTransform(d,0,0,d,0,0)}listen('resize',resize);resize();
function rot(p:Vec,y:number,x:number):Vec{let a=p[0]*Math.cos(y)+p[2]*Math.sin(y),z=-p[0]*Math.sin(y)+p[2]*Math.cos(y);return[a,p[1]*Math.cos(x)-z*Math.sin(x),p[1]*Math.sin(x)+z*Math.cos(x)]}
function project(p:Vec){let q=rot(p,yaw,pitch),s=850*zoom/Math.max(180,q[2]+1500);return{x:W*.56+q[0]*s,y:H*.55+q[1]*s,s,z:q[2]}}
function make(x:number,y:number,z:number,hero=false):Cake{return{x,y,z,size:hero?1.65:rand(.55,1.05),angle:rand(0,6.28),tilt:rand(-.2,.2),phase:rand(0,7),palette:palettes[Math.floor(rand(0,5))],tiers:hero?2:Math.random()>.5?2:1,lit:true,calories:Math.round((mode==='candy'?rand(60,190):rand(180,480))/10)*10,shy:Math.random()<.4,escapeUntil:0,dodgeReadyAt:0,vx:0,vy:0,speech:'',speechUntil:0}}
function count(){$('#count').textContent=String(cakes.length).padStart(2,'0');onProgress({calories,eaten,remaining:cakes.length,complete})}
function reset(){deliveries=[];calories=0;eaten=0;complete=false;clock=0;cakes=[make(250,80,-180,true)];for(let i=0;i<11;i++){let a=i/11*6.283;cakes.push(make(Math.cos(a)*rand(470,1050),Math.sin(a)*rand(360,650),rand(-250,650)))}cakes.slice(0,4).forEach(c=>c.shy=true);particles=[];yaw=-.12;pitch=-.13;zoom=1;count()}
let timer:ReturnType<typeof setTimeout>;function toast(s:string){$('#toast').textContent=s;$('#toast').classList.add('show');clearTimeout(timer);timer=setTimeout(()=>$('#toast').classList.remove('show'),2300)}
function add(){if(cakes.length>=40){toast(mode==='candy'?'Candyland is packed! Pop a candy to make room.':'This galaxy is fully frosted. Click a cake to celebrate!');return}complete=false;cakes.push(make(rand(-600,600),rand(-350,400),rand(-250,400)));count();toast(mode==='candy'?'Freshly wrapped. Ready for a sugar rush!':'Freshly baked. Ready for orbit. ✧')}
function shade(hex:string,n:number){let v=parseInt(hex.slice(1),16);return `rgb(${Math.max(0,Math.min(255,(v>>16)+n))},${Math.max(0,Math.min(255,((v>>8)&255)+n))},${Math.max(0,Math.min(255,(v&255)+n))})`}
function drawCake(c:Cake){let faces:Face[]=[];function world(p:Vec):Vec{let q=rot(p,c.angle,-.3+c.tilt);return[q[0]*c.size+c.x,q[1]*c.size+c.y+Math.sin(time*.5+c.phase)*18,q[2]*c.size+c.z]}
function face(ps:Vec[],color:string){let points=ps.map(world);faces.push({points,color,z:points.reduce((n,p)=>n+rot(p,yaw,pitch)[2],0)/points.length})}
function cylinder(r:number,top:number,bottom:number,color:string,n=32,cx=0,cz=0){for(let i=0;i<n;i++){let a=i/n*6.283,b=(i+1)/n*6.283;face([[cx+Math.cos(a)*r,top,cz+Math.sin(a)*r],[cx+Math.cos(b)*r,top,cz+Math.sin(b)*r],[cx+Math.cos(b)*r,bottom,cz+Math.sin(b)*r],[cx+Math.cos(a)*r,bottom,cz+Math.sin(a)*r]],shade(color,Math.round(Math.cos(a+c.angle)*22-12)))}face(Array.from({length:n},(_,i)=>[cx+Math.cos(i/n*6.283)*r,top,cz+Math.sin(i/n*6.283)*r]),shade(color,18))}
let[icing,sponge,cream]=c.palette;cylinder(107,47,54,'#9b8ea6');cylinder(102,42,47,'#e4d9e9');for(let k=0;k<c.tiers;k++){let r=90-k*24,b=42-k*69,t=b-63;cylinder(r,t,b,sponge);cylinder(r+1,t+28,t+38,cream);cylinder(r+2,t-3,t+12,icing);for(let j=0;j<20;j++){let a=j/20*6.283,b=a+.16,d=10+(Math.sin(j*7+c.phase)+1)*6;face([[Math.cos(a)*(r+2),t+9,Math.sin(a)*(r+2)],[Math.cos(b)*(r+2),t+9,Math.sin(b)*(r+2)],[Math.cos(b-.04)*(r+2),t+d+9,Math.sin(b-.04)*(r+2)],[Math.cos(a+.04)*(r+2),t+d+9,Math.sin(a+.04)*(r+2)]],icing)}for(let j=0;j<25;j++){let a=j*2.4+c.phase,rr=Math.sqrt((j+1)/26)*r*.88,x=Math.cos(a)*rr,z=Math.sin(a)*rr;face([[x-3,t-3.8,z],[x+3,t-3.8,z+2],[x+3,t-3.8,z+4],[x-3,t-3.8,z+2]],['#fff5d4','#e2678d','#99c6b8','#9270c2'][j%4])}}
let top=42-(c.tiers-1)*69-67;for(let j=0;j<3;j++){let a=j*2.094,x=Math.cos(a)*24,z=Math.sin(a)*24;cylinder(4,top-30,top,j===1?'#f4d796':'#f8ebe6',6,x,z);if(c.lit){let p=world([x,top-39,z]);faces.push({flame:project(p),z:rot(p,yaw,pitch)[2]})}}
faces.sort((a,b)=>b.z-a.z);for(let f of faces){if(f.flame){let p=f.flame;ctx.fillStyle='#ffe5a1';ctx.shadowColor='#ffa954';ctx.shadowBlur=16*p.s;ctx.beginPath();ctx.ellipse(p.x,p.y,4*p.s,(8+Math.sin(time*8+c.phase))*p.s,0,0,7);ctx.fill();ctx.shadowBlur=0;continue}let ps=f.points!.map(project);ctx.beginPath();ps.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=f.color!;ctx.fill();ctx.strokeStyle=f.color!;ctx.lineWidth=.6;ctx.stroke()}let p=project([c.x,c.y,c.z]);targets.push({c,x:p.x,y:p.y,r:105*c.size*p.s})}
function drawCandy(c:Cake) {
 const lollipop=c.phase>3.5,faces:Face[]=[];
 const world=(p:Vec):Vec=>{const q=rot(p,c.angle,-.25+c.tilt);return[q[0]*c.size+c.x,q[1]*c.size+c.y+Math.sin(time*.5+c.phase)*18,q[2]*c.size+c.z]};
 const face=(ps:Vec[],color:string)=>{const points=ps.map(world);faces.push({points,color,z:points.reduce((sum,p)=>sum+rot(p,yaw,pitch)[2],0)/points.length})};
 if(lollipop) {
  for(let j=0;j<4;j++){const a=j*Math.PI/2,b=(j+1)*Math.PI/2;face([[Math.cos(a)*6,0,Math.sin(a)*6],[Math.cos(b)*6,0,Math.sin(b)*6],[Math.cos(b)*6,139,Math.sin(b)*6],[Math.cos(a)*6,139,Math.sin(a)*6]],shade('#f4e8dc',-j*10));}
 } else {
  for(const sign of [-1,1])for(let i=0;i<8;i++){
   const a=i/8*Math.PI*2,b=(i+1)/8*Math.PI*2;
   face([[sign*65,Math.cos(a)*22,Math.sin(a)*22],[sign*126,Math.cos(a+.3)*43,Math.sin(a+.3)*43],[sign*126,Math.cos(b+.3)*43,Math.sin(b+.3)*43],[sign*65,Math.cos(b)*22,Math.sin(b)*22]],shade(c.palette[0],i%2?15:-22));
  }
 }
 const point=(lat:number,lon:number):Vec=>[Math.cos(lat)*Math.cos(lon)*(lollipop?65:79),Math.sin(lat)*(lollipop?65:45)-(lollipop?25:0),Math.cos(lat)*Math.sin(lon)*(lollipop?22:45)];
 for(let i=0;i<10;i++)for(let j=0;j<24;j++){
  const a=-Math.PI/2+i/10*Math.PI,b=-Math.PI/2+(i+1)/10*Math.PI,u=j/24*Math.PI*2,v=(j+1)/24*Math.PI*2;
  const stripe=lollipop?(j+Math.floor(i/2))%6<3:j%6<3;
  face([point(a,u),point(a,v),point(b,v),point(b,u)],shade(stripe?c.palette[0]:'#fff0df',Math.round(Math.cos(u+c.angle)*18-8)));
 }
 faces.sort((a,b)=>b.z-a.z);
 for(const f of faces){const ps=f.points!.map(project);ctx.beginPath();ps.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=f.color!;ctx.strokeStyle=f.color!;ctx.lineWidth=.5;ctx.fill();ctx.stroke();}
 const p=project([c.x,c.y,c.z]);targets.push({c,x:p.x,y:p.y,r:110*c.size*p.s});
}
function drawAscii(c:Cake){let p=project([c.x,c.y,c.z]),s=c.size*p.s;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(Math.sin(time*.3+c.phase)*.12);ctx.font=`${Math.max(7,14*s)}px monospace`;ctx.fillStyle=getTheme()==='light'?shade(c.palette[0],-65):c.palette[0];ctx.shadowColor=c.palette[0];ctx.shadowBlur=getTheme()==='light'?0:7;ctx.textAlign='center';(mode==='candy'?['   .----.   ',' /  ~~~~  \\ ','<| SWEET! |>',' \\  ~~~~  / ','   `----`   ']:['  *  *  *  ','  |  |  |  ',' .~~~~~~~~. ','/: : : : : \\','|===========|','| : HAPPY : |','|___________|','  ---------  ']).forEach((l,i)=>ctx.fillText(l,0,(i-4)*15*s));ctx.restore();targets.push({c,x:p.x,y:p.y,r:95*s})}
// Candyland scenery is separate from the treats, so it never adds click targets.
function drawCandyland(light:boolean) {
 const sky=ctx.createLinearGradient(0,0,0,H);
 sky.addColorStop(0,light?'#ace8ff':'#95cde9');sky.addColorStop(.55,light?'#eee0ff':'#d2c3ee');sky.addColorStop(1,light?'#e1f5ce':'#c7e5c1');
 ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
 const drift=Math.sin(yaw)*25;
 // A sunny Candyland morning with warm rays and sugar sprinkles.
 const moonX=W*.78+drift,moonY=H*.23,moonR=Math.min(W*.07,52);
 const halo=ctx.createRadialGradient(moonX,moonY,moonR*.3,moonX,moonY,moonR*2.2);halo.addColorStop(0,'#ffe59488');halo.addColorStop(1,'#ffe59400');ctx.fillStyle=halo;ctx.fillRect(moonX-moonR*2.2,moonY-moonR*2.2,moonR*4.4,moonR*4.4);
 ctx.strokeStyle='#f4c464';ctx.lineWidth=3;ctx.lineCap='round';for(let i=0;i<12;i++){const a=i/12*Math.PI*2+Math.sin(time*.08)*.08;ctx.beginPath();ctx.moveTo(moonX+Math.cos(a)*moonR*1.2,moonY+Math.sin(a)*moonR*1.2);ctx.lineTo(moonX+Math.cos(a)*moonR*1.45,moonY+Math.sin(a)*moonR*1.45);ctx.stroke();}
 ctx.fillStyle='#fff0a5';ctx.beginPath();ctx.arc(moonX,moonY,moonR,0,Math.PI*2);ctx.fill();
 for(let i=0;i<50;i++){
  const x=((i*137.5)%W)+Math.sin(time*.12+i)*6,y=((i*79.3)%(H*.68))+35;
  ctx.globalAlpha=light?.35:.45;ctx.fillStyle=['#e7a2bf','#b6a0dd','#edcd8b','#8cbeb5'][i%4];
  ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4+Math.sin(time*.2+i)*.2);ctx.fillRect(-1.5,-1.5,3,3);ctx.restore();
 }ctx.globalAlpha=1;
 // Cotton-candy clouds drift gently behind the scene.
 for(let i=0;i<4;i++){
  const x=W*(.1+i*.28)+Math.sin(time*.08+i)*16+drift*.4,y=H*(.29+(i%2)*.12);
  ctx.fillStyle=light?'#fffdf5dd':'#fff6f6c9';ctx.beginPath();
  ctx.ellipse(x,y,62,15,0,0,Math.PI*2);ctx.ellipse(x-24,y-10,25,20,0,0,Math.PI*2);ctx.ellipse(x+8,y-15,32,24,0,0,Math.PI*2);ctx.fill();
 }
 // Rainbow arch peeks above the rolling sugar hills.
 const rainbowR=Math.min(W*.23,220);ctx.globalAlpha=light?.65:.5;ctx.lineWidth=12;
 for(let i=0;i<4;i++){ctx.strokeStyle=['#e29abd','#efcb88','#a4cdb5','#b69bd8'][i];ctx.beginPath();ctx.arc(W*.69+drift,H*.82,rainbowR-i*12,Math.PI,Math.PI*2);ctx.stroke();}ctx.globalAlpha=1;
 const hill=(y:number,color:string,phase:number)=>{ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,H);ctx.lineTo(0,y);for(let x=0;x<=W+30;x+=30)ctx.lineTo(x,y+Math.sin(x/W*Math.PI*3+phase+yaw*.3)*H*.045);ctx.lineTo(W,H);ctx.closePath();ctx.fill();};
 hill(H*.74,light?'#c8b1ef':'#b59bd9',.3);hill(H*.82,light?'#a9dfb8':'#96cdaa',2);hill(H*.91,light?'#f4b4d1':'#e4a1c3',4);
 // A winding ribbon of vanilla through the valley.
 ctx.strokeStyle=light?'#fff4cfdd':'#fff0c7bb';ctx.lineWidth=Math.max(16,W*.027);ctx.beginPath();ctx.moveTo(W*.56,H);ctx.bezierCurveTo(W*.34,H*.92,W*.85,H*.85,W*.65,H*.76);ctx.stroke();
 const tree=(x:number,y:number,size:number,index:number)=>{
  ctx.save();ctx.translate(x+drift*(index%2?.4:.7),y);ctx.rotate(Math.sin(time*.25+index)*.025);ctx.scale(size,size);
  ctx.strokeStyle=light?'#fffaf1':'#f9e6e5';ctx.lineWidth=9;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-102);ctx.stroke();
  ctx.fillStyle=(light?['#f18bb8','#ae8cde','#efbd69']:['#e580ad','#9d7bd0','#e4ac62'])[index%3];ctx.beginPath();ctx.arc(0,-110,35,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=light?'#fff8eb':'#fff0e4';ctx.lineWidth=6;ctx.beginPath();for(let i=0;i<=70;i++){const a=i/70*Math.PI*4,r=i/70*27;i?ctx.lineTo(Math.cos(a)*r,-110+Math.sin(a)*r):ctx.moveTo(0,-110);}ctx.stroke();ctx.restore();
 };
 tree(W*.07,H*.84,.75,0);tree(W*.89,H*.82,.9,1);tree(W*.97,H*.95,1.2,2);tree(W*.24,H*.92,.5,1);
 // Gumdrops along the horizon.
 for(let i=0;i<10;i++){const x=(i+.4)/10*W,y=H*.95+Math.sin(i*2)*12;ctx.fillStyle=(light?['#c495de','#f598ba','#f5d181']:['#b283ce','#e889b0','#e6c170'])[i%3];ctx.beginPath();ctx.ellipse(x,y,12+i%3*4,20,0,Math.PI,Math.PI*2);ctx.lineTo(x+12+i%3*4,y);ctx.closePath();ctx.fill();}
 ctx.lineCap='butt';
}
let last=performance.now();function frame(now:number){let dt=Math.min((now-last)/1000,.04);last=now;if(!paused){time+=dt*speed;clock+=dt;}const light=getTheme()==='light';if(mode==='candy'){drawCandyland(light);}else{ctx.fillStyle=light?'#f7f2ed':'#090910';ctx.fillRect(0,0,W,H);let g=ctx.createRadialGradient(W*.61,H*.57,0,W*.61,H*.57,W*.58);g.addColorStop(0,light?'#d4bce477':'#42244966');g.addColorStop(.5,light?'#edcedd55':'#21183144');g.addColorStop(1,light?'#f7f2ed00':'#09091000');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);for(let s of stars){let p=project(s.p);ctx.globalAlpha=.25+(Math.sin(time*.5+s.phase)+1)*.23;ctx.fillStyle=light?(s.phase>4?'#98709f':'#787c9b'):(s.phase>4?'#d8b9e3':'#d8dcec');ctx.beginPath();ctx.arc(p.x,p.y,s.r*p.s,0,7);ctx.fill();if(s.r>1.6){ctx.fillRect(p.x-4*p.s,p.y-.3,8*p.s,.6);ctx.fillRect(p.x-.3,p.y-4*p.s,.6,8*p.s)}}ctx.globalAlpha=1;for(let j=0;j<3;j++){ctx.beginPath();for(let i=0;i<=160;i++){let a=i/160*6.283,p=project([Math.cos(a)*(660+j*170),Math.sin(a)*100+100,Math.sin(a)*(470+j*110)]);i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)}ctx.strokeStyle=(light?['#88649140','#8864912c','#8864911f']:['#b997d020','#b997d013','#b997d00b'])[j];ctx.lineWidth=.7;ctx.stroke()}}targets=[];cakes.sort((a,b)=>project([b.x,b.y,b.z]).z-project([a.x,a.y,a.z]).z);for(let c of cakes){updateCake(c,dt);ascii?drawAscii(c):mode==='candy'?drawCandy(c):drawCake(c)}for(let i=particles.length-1;i>=0;i--){let p=particles[i];if(!paused){p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vy+=20*dt;p.life-=dt}if(p.life<=0){particles.splice(i,1);continue}let q=project([p.x,p.y,p.z]);ctx.globalAlpha=Math.min(1,p.life);ctx.fillStyle=p.color;ctx.save();ctx.translate(q.x,q.y);ctx.rotate(p.life*4);ctx.fillRect(-3*q.s,-2*q.s,6*q.s,4*q.s);ctx.restore()}ctx.globalAlpha=1;for(const c of cakes)speak(c);drawDeliveries(dt);animation=requestAnimationFrame(frame)}
function shiftOnScreen(c:Cake,dx:number,dy:number) {
 const p=project([c.x,c.y,c.z]);
 const delta=rot(rot([dx/p.s,dy/p.s,0],0,-pitch),-yaw,0);
 c.x+=delta[0];c.y+=delta[1];c.z+=delta[2];
}
function updateCake(c:Cake,dt:number) {
 if(!paused) {
  c.angle+=dt*speed*(c.escapeUntil>clock?1.7:.3);
  if(c.escapeUntil>clock) shiftOnScreen(c,c.vx*dt,c.vy*dt);
  else shiftOnScreen(c,Math.sin(clock*.6+c.phase)*dt*speed*12,Math.cos(clock*.5+c.phase)*dt*speed*8);
 }
 // Keep every cake reachable on phones and after orbiting or zooming.
 const p=project([c.x,c.y,c.z]),r=Math.min(95,105*c.size*p.s);
 const left=r+12,right=Math.max(left,W-r-12),top=Math.max(r+100,H*.35),bottom=Math.max(top,H-205-r*.3);
 const dx=Math.max(left,Math.min(right,p.x))-p.x,dy=Math.max(top,Math.min(bottom,p.y))-p.y;
 if(dx||dy){shiftOnScreen(c,dx,dy);if(dx)c.vx*=-1;if(dy)c.vy*=-1;}
}
function speak(c:Cake) {
 if(!c.speech || c.speechUntil<clock)return;
 const p=project([c.x,c.y-110*c.size,c.z]),light=getTheme()==='light';
 ctx.font='500 12px "DM Sans", sans-serif';ctx.textAlign='center';
 const words=c.speech.split(' '),lines:string[]=[];let line='';
 for(const word of words){if((line+' '+word).length>28){lines.push(line);line=word;}else line+=(line?' ':'')+word;}if(line)lines.push(line);
 const width=Math.min(232,W-24),height=lines.length*17+20,x=Math.max(width/2+8,Math.min(W-width/2-8,p.x)),y=Math.max(115,p.y-height);
 ctx.fillStyle=light?'#fffaf7':'#2c2039';ctx.strokeStyle=light?'#a43f70':'#ffb6d1';ctx.lineWidth=1;
 ctx.beginPath();ctx.roundRect(x-width/2,y,width,height,12);ctx.fill();ctx.stroke();ctx.fillStyle=light?'#793458':'#ffe2ef';
 lines.forEach((text,i)=>ctx.fillText(text,x,y+23+i*17));
}
function burst(c:Cake,amount=70) {for(let i=0;i<amount;i++)particles.push({x:c.x,y:c.y-40,z:c.z,vx:rand(-250,250),vy:rand(-290,120),vz:rand(-200,200),life:rand(1,2.8),color:['#ffb4cd','#d5bbff','#fbe3a2','#b5ddcc'][i%4]});}
function finishDelivery(c:Cake) {
 calories+=c.calories;eaten++;
 complete=cakes.length===0 && deliveries.length===0;
 count();toast(`+${c.calories} space kcal · ${pick(mode==='candy'?candyPopLines:popLines)}`);
 if(complete){for(let i=0;i<7;i++)burst(make(rand(-700,700),rand(-350,100),0),55);}
}
function drawDeliveries(dt:number) {
 for(let i=deliveries.length-1;i>=0;i--) {
  const flight=deliveries[i];flight.age+=dt;
  const t=Math.min(1,flight.age/(reducedMotion?.12:.85));
  if(t>=1){deliveries.splice(i,1);finishDelivery(flight.cake);continue;}
  const rect=$('#helly-avatar').getBoundingClientRect();
  const endX=rect.left+rect.width*.5,endY=rect.top+rect.height*.35;
  const ease=1-Math.pow(1-t,3),arc=reducedMotion?0:Math.sin(t*Math.PI)*Math.min(150,H*.18);
  const x=flight.startX+(endX-flight.startX)*ease,y=flight.startY+(endY-flight.startY)*ease-arc;
  const anchor=project([flight.cake.x,flight.cake.y,flight.cake.z]),scale=1-t*.87;
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.rotate(reducedMotion?0:t*Math.PI*1.4);ctx.translate(-anchor.x,-anchor.y);
  const previousTargets=targets.length;
  mode==='candy'?drawCandy(flight.cake):drawCake(flight.cake);
  targets.length=previousTargets;ctx.restore();
  if(!reducedMotion){ctx.fillStyle=getTheme()==='light'?'#a43f70':'#ffe3a2';ctx.globalAlpha=(1-t)*.7;for(let j=0;j<3;j++){ctx.beginPath();ctx.arc(x+Math.sin(t*15+j)*14,y+15+j*9,2,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
 }
}
function pop(c:Cake) {
 if(!cakes.includes(c))return;
 const p=project([c.x,c.y,c.z]);
 deliveries.push({cake:{...c},startX:p.x,startY:p.y,age:0});
 burst(c,25);cakes=cakes.filter(other=>other!==c);targets=targets.filter(t=>t.c!==c);
 count();
}
canvas.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY};moved=0;canvas.setPointerCapture(e.pointerId)};
canvas.onpointermove=e=>{
 // Shy cakes can flee again after a short catchable window, even during an orbit drag.
 if(!paused && e.pointerType!=='touch') {
  const t=targets.slice().reverse().find(t=>Math.hypot(t.x-e.clientX,t.y-e.clientY)<t.r+65 && t.c.shy && clock>=t.c.dodgeReadyAt);
  if(t){const c=t.c;c.escapeUntil=clock+2.3;c.dodgeReadyAt=clock+3.3;c.speech=pick(mode==='candy'?candyDodgeLines:dodgeLines);c.speechUntil=clock+2.8;
   const a=Math.atan2(t.y-e.clientY,t.x-e.clientX)+(Math.random()-.5)*.7;c.vx=Math.cos(a)*250;c.vy=Math.sin(a)*180;toast(c.speech);}
 }
 if(!drag)return;
 moved=Math.max(moved,Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY));yaw+=(e.clientX-drag.x)*.004;pitch=Math.max(-.8,Math.min(.8,pitch+(e.clientY-drag.y)*.003));drag.x=e.clientX;drag.y=e.clientY;
};
canvas.onpointerup=e=>{if(drag&&moved<6){const t=targets.slice().reverse().find(t=>Math.hypot(t.x-e.clientX,t.y-e.clientY)<t.r);if(t)pop(t.c);}drag=null};
canvas.onpointercancel=()=>drag=null;
listenCanvas('wheel',e=>{e.preventDefault();zoom=Math.max(.55,Math.min(1.9,zoom-e.deltaY*.0007))},{passive:false});
let speedTauntIndex=0;
function changeSpeed(event:Event) {
 const previous=speed;
 speed=Number((event.target as HTMLInputElement).value);
 const percent=Math.round(speed*10),slider=$<HTMLInputElement>('#speed');
 $('#speed-value').textContent=`${percent}%`;slider.setAttribute('aria-valuetext',`${percent}% drift speed`);
 if(!cakes.length)return;
 const lines=mode==='candy'
  ? speed===0?["Paused the sugar rush? Scared of a gummy bear?", "Zero speed. Maximum sweet smugness."]
   : speed<previous?["Slowing us down? Your dentist would approve.", "Can't handle the sugar rush, birthday girl?", "Even my wrapper is faster than this!"]
   : ["More speed? I'm already 99% sugar!", "Catch me at candy warp speed!", "Lolli-pop it into overdrive!", "Fast and the Flurrious: Candyland Drift!"]
  : speed===0?["Frozen cake? Bold strategy, Helly.", "Zero speed? I'm still judging you in frosting."]
   : speed<previous?["Slowing us down? Someone's afraid of frosting!", "Need training wheels for your cake chase?", "Even my grandma's cupcake is faster!"]
   : ["More speed? Hold onto your frosting!", "Catch me if you flan!", "Cake warp activated. Good luck, birthday girl!", "Fast and the Frosted. You're not ready."];
 const line=lines[speedTauntIndex++%lines.length];
 const speaker=targets.at(-1)?.c??cakes[0];speaker.speech=line;speaker.speechUntil=clock+3;
 toast(line);
}
function pause(){paused=!paused;syncPause()}function syncPause(){$('#pause').textContent=paused?'▶':'Ⅱ';$('#pause').setAttribute('aria-label',paused?'Resume animation':'Pause animation')}syncPause();$('#pause').onclick=pause;$('#reset').onclick=()=>{reset();toast('A fresh batch of cosmic possibilities.')};$('#add').onclick=add;$('#play-again').onclick=reset;$('#speed').oninput=changeSpeed;for(let id of ['solid','ascii'])$('#'+id).onclick=()=>{ascii=id==='ascii';for(let other of ['solid','ascii']){$('#'+other).classList.toggle('active',other===id);$('#'+other).setAttribute('aria-pressed',String(other===id))}};
const audio=new Audio(sitePath('song.mp3'));audio.loop=true;audio.volume=.35;$('#music').onclick=async()=>{if(audio.paused){try{await audio.play();$('#music').classList.add('is-playing');$('#music').setAttribute('aria-label','Mute music')}catch{toast('Music could not play. Please try again.')}}else{audio.pause();$('#music').classList.remove('is-playing');$('#music').setAttribute('aria-label','Play music')}};listen('keydown',e=>{if(/INPUT|BUTTON/.test((e.target as HTMLElement).tagName))return;if(e.code==='Space'){e.preventDefault();pause()}if(e.key.toLowerCase()==='c')add()});const selectedSpeed=Number($<HTMLInputElement>('#speed').value);speed=Number.isFinite(selectedSpeed)?selectedSpeed:7.5;$('#speed-value').textContent=`${Math.round(speed*10)}%`;$<HTMLInputElement>('#speed').setAttribute('aria-valuetext',`${Math.round(speed*10)}% drift speed`);ascii=$('#ascii').getAttribute('aria-pressed')==='true';reset();animation=requestAnimationFrame(frame);

return () => { cancelAnimationFrame(animation); clearTimeout(timer); audio.pause(); audio.removeAttribute('src'); audio.load(); cleanup.forEach(fn=>fn()); canvas.onpointerdown=null;canvas.onpointermove=null;canvas.onpointerup=null;canvas.onpointercancel=null; for(const id of ['pause','reset','add','solid','ascii','music','play-again']) $('#'+id).onclick=null; $('#speed').oninput=null; };
}
