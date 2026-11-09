import { useEffect, useRef, useState } from 'react';
import { startUniverse, type GameProgress, type GameMode } from './universe';
import { sitePath, yearFromPath } from './paths';
import { SleepingHelly } from './SleepingHelly';
function YearNav({ year }: { year: '2025' | '2026' }) {
  return <nav className="year-nav" aria-label="Birthday year">{(['2025', '2026'] as const).map(y => <a key={y} href={sitePath(y + "/")} aria-current={year === y ? 'page' : undefined}>{y}</a>)}</nav>;
}
type Theme = 'light' | 'dark';
const girlLines = [
 "Excuse me, I'm the birthday girl, not a doorbell!",
 "Boop received. Please pay the cake tax.",
 "Yes, I'm the main character. The universe confirmed it.",
 "Stop poking me and start catching my snacks!",
 "NASA called. They want their party legend back.",
 "My birthday wish? Unlimited cake. Obviously.",
 "I'm not ignoring you. I'm buffering in frosting.",
 "Personal space? I rented the whole galaxy!",
 "If you need me, I'll be in my cake era.",
 "That tickles! My frosting sensors are very sensitive.",
];
const catchLines: Record<GameMode, string[]> = {
 cake: [
  "Special delivery? Straight to my tummy, please!",
  "Caught it! My frosting reflexes are undefeated.",
  "Nom nom. That one tasted like birthday privilege.",
  "My spacesuit said stop. I said extra frosting.",
  "Another cake? Oh no… anyway, open wide!",
  "I catch cakes, not feelings. Okay, maybe both.",
  "That cake had no chance against my snack gravity.",
  "Delivery confirmed. Crumbs mysteriously missing.",
  "The tummy has accepted your generous donation.",
  "Cake secured. Please send the next delicious asteroid.",
 ],
 candy: [
  "Candy delivery! My sugar radar never misses.",
  "Caught it! Wrapper off, party on.",
  "Nom nom. My dentist just sensed a plot twist.",
  "Sugar rush loading… please send more candy.",
  "That lollipop chose the wrong birthday girl.",
  "Gummy bears? More like gummy GONE.",
  "Sweet catch! I was born for this very sticky moment.",
  "Candyland called. Apparently I ate the mayor.",
  "My tummy just gave that candy five stars.",
  "Another sweet? I'm collecting the whole galaxy.",
 ],
};
function SpaceCakes() {
 const [mode, setMode] = useState<GameMode>('cake');
 const treat = mode === 'candy' ? 'candy' : 'cake';
 const treats = mode === 'candy' ? 'candies' : 'cakes';
 const [girlReply, setGirlReply] = useState('');
 const replyIndex = useRef(0);
 useEffect(() => {
  if (!girlReply) return;
  const timer = window.setTimeout(() => setGirlReply(''), 4500);
  return () => window.clearTimeout(timer);
 }, [girlReply]);
 const [progress, setProgress] = useState<GameProgress>({calories:0,eaten:0,remaining:12,complete:false});
 const [girlEating, setGirlEating] = useState(false);
 useEffect(() => {
  if (!progress.eaten) { setGirlEating(false); setGirlReply(''); return; }
  setGirlReply(catchLines[mode][(progress.eaten - 1) % catchLines[mode].length]);
  setGirlEating(true);
  const timer = window.setTimeout(() => setGirlEating(false), 650);
  return () => window.clearTimeout(timer);
 }, [progress.eaten, mode]);
 const [theme, setTheme] = useState<Theme>('dark');
 const themeRef = useRef(theme);
 themeRef.current = theme;
 useEffect(() => {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('cosmic-theme', theme); } catch { /* The toggle still works without storage. */ }
  return () => { delete document.documentElement.dataset.theme; };
 }, [theme]);
 const canvasRef = useRef<HTMLCanvasElement>(null);
 useEffect(() => { if (canvasRef.current) return startUniverse(canvasRef.current, () => themeRef.current, setProgress, mode); }, [mode]);
 return <><canvas ref={canvasRef} id="space" aria-label={`Floating 3D ${treats}. Drag to orbit, scroll to zoom, and pop every ${treat}.`}></canvas><main data-world={mode}><header><div className="brand"><b>✳</b>Helly’s Wonderland<small>{mode === 'candy' ? 'A LITTLE MAGIC. A LOT OF CANDY.' : 'A LITTLE MAGIC. A LOT OF CAKE.'}</small></div><div className="header-right"><div className="calorie-score" aria-live="polite"><strong>{progress.calories.toLocaleString()}</strong><span>SPACE KCAL · {progress.eaten} ENJOYED</span></div><YearNav year="2026" /><div className="icons"><button className="theme-toggle" onClick={() => setTheme(current => current === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>{theme === 'dark' ? '☀' : '☾'}</button><button id="music" aria-label="Play music">♫</button><button id="pause" aria-label="Pause animation">Ⅱ</button><button id="reset" aria-label="Reset universe">↺</button></div></div></header><section className="intro"><div className="eyebrow">{mode === 'candy' ? 'SUNSHINE. SWEETS. MAXIMUM SUGAR RUSH.' : 'ZERO GRAVITY. EXTRA FROSTING.'}</div><h1>{mode === 'candy' ? 'A little trip' : 'A little slice'}{' '}{mode === 'candy' ? 'to ' : 'of the '}<em>{mode === 'candy' ? 'Candyland.' : 'universe.'}</em></h1><p>Somewhere out there, the {treats} are floating.<br />A world of sweet surprises, made just for Helly.</p></section><aside className="snack-companion" aria-label={`Birthday girl avatar. ${progress.eaten} ${treats} enjoyed.`}>
 <span className="companion-reply" role="status" aria-live="polite" aria-atomic="true">{girlReply}</span>
 <span className="companion-label">CAPTAIN HELLY</span>
 <button className={`girl-button${girlEating ? " is-eating" : ""}`} aria-label="Chat with Captain Helly" title="Tap me for birthday wisdom" onClick={() => {
  const lines = [...girlLines, ...(progress.eaten > 0 ? [
   `${progress.eaten} cakes down. My spacesuit just requested a vacation.`,
   `${progress.calories.toLocaleString()} space calories? I prefer to call it birthday fuel.`,
   "I'm not floating anymore. The cakes are orbiting ME.",
  ] : ["Zero cakes so far? This is a birthday emergency!"])];
  const line = lines[replyIndex.current++ % lines.length];
  setGirlReply(mode === 'candy' ? line.replaceAll('cakes', 'candies').replaceAll('cake', 'candy').replaceAll('frosting', 'sugar') : line);
 }}>
 <svg id="helly-avatar" viewBox="0 0 140 175" role="img" aria-label="A smiling birthday girl whose dress grows as she enjoys space cakes">
  <ellipse cx="70" cy="163" rx="43" ry="7" fill="currentColor" opacity=".12" />
  <path d="M56 133L54 157M84 133L86 157" stroke="#bf857b" strokeWidth="10" strokeLinecap="round" />
  <path d="M45 157h16M80 157h16" stroke="#624b7d" strokeWidth="9" strokeLinecap="round" />
  <g style={{transform:`translate(70px, 0) scaleX(${1 + Math.min(progress.eaten, 24) * .035}) translate(-70px, 0)`}}>
   <path d="M51 79Q70 69 89 79L104 139Q70 150 36 139Z" fill="#c27baa" />
   <path d="M48 89L31 117M92 89l17 28" stroke="#e6ac94" strokeWidth="10" strokeLinecap="round" />
   <path d="M48 116Q70 123 93 116" fill="none" stroke="#eac4dc" strokeWidth="4" />
   <path d="M65 96l5-7 5 7-5 7z" fill="#ffe3a2" />
  </g>
  <path d="M42 60Q25 10 70 15Q115 10 99 67L87 81H49Z" fill="#493549" />
  <ellipse cx="70" cy="50" rx="26" ry="30" fill="#edbaa1" />
  <path d="M43 44Q48 12 76 23Q90 19 98 44Q83 40 72 29Q63 43 43 44" fill="#493549" />
  <path d="M55 50q4-5 8 0M77 50q4-5 8 0" fill="none" stroke="#493549" strokeWidth="2.5" strokeLinecap="round" />
  <path d="M62 61q8 9 16 0" fill="#b95f78" />
  <ellipse cx="51" cy="59" rx="5" ry="3" fill="#e79399" /><ellipse cx="89" cy="59" rx="5" ry="3" fill="#e79399" />
  <path d="M56 22L70 1L84 22Z" fill="#ffe3a2" /><circle cx="70" cy="3" r="3" fill="#e899b9" />
 </svg>
 <span className="girl-tap-hint">{girlEating ? "Nom nom! ✨" : "Tap me ✧"}</span>
 </button>
 <span className="companion-caption">{progress.eaten===0?(mode==='candy'?'Ready for candy duty.':'Ready for cake duty.'):progress.eaten<4?'Room for one more.':progress.eaten<8?'My spacesuit is getting snug.':'I am the party planet now.'}</span>
 <div className="snack-meter"><span style={{width:`${Math.min(100,progress.eaten/12*100)}%`}} /></div>
</aside><div className="coord">{mode === 'candy' ? 'CANDYLAND / FOLLOW THE SUGAR RUSH' : 'SECTOR 04 / THE SWEET UNKNOWN'}</div><div id="toast" role="status" aria-live="polite"></div><div className="count"><strong id="count">12</strong><span>{treats.toUpperCase()} IN ORBIT</span></div><section className="birthday-finale" hidden={!progress.complete} aria-label="Birthday celebration">
 <div className="side-confetti" aria-hidden="true">{Array.from({length:32},(_,i)=><i key={i} style={{left:`${i%2?96-(i%5)*2:(i%5)*2}%`,animationDelay:`${i*.09}s`,background:['#ffb4cd','#d5bbff','#fbe3a2','#b5ddcc'][i%4]}} />)}</div>
 <div className="birthday-card" role="status" aria-live="polite"><span className="eyebrow">{mode === 'candy' ? 'EVERY LAST SWEET. EVERY LITTLE DREAM.' : 'EVERY LAST CRUMB. EVERY LAST STAR.'}</span><h2>Super Galactic<br />Happy Birthday<br /><em>Helly</em> ✨</h2><SleepingHelly mode={mode} />{girlReply && <blockquote className="finale-quote">“{girlReply}”</blockquote>}<p>{progress.eaten} {treats}. {progress.calories.toLocaleString()} space calories.<br />One legendary birthday girl.</p><button id="play-again" className="add">Another round of {treats}?</button></div>
</section><div className="bottom"><div className="hint">Drag to explore &nbsp; · &nbsp; Scroll to drift closer &nbsp; · &nbsp; Pop every {treat} for a birthday surprise</div><div className="toolbar"><div className="treat-selector" role="group" aria-label="Choose your birthday game">{(['cake','candy'] as const).map(choice=><button key={choice} aria-pressed={mode===choice} onClick={()=>{if(mode!==choice){setProgress({calories:0,eaten:0,remaining:12,complete:false});setGirlReply('');setTheme(choice === 'candy' ? 'light' : 'dark');setMode(choice);}}}>{choice==='cake'?'🎂 Cakes':'🍬 Candyland'}</button>)}</div><div className="modes"><button className="active" id="solid" aria-pressed="true">3D</button><button id="ascii" aria-pressed="false">ASCII</button></div><div className="speed"><label htmlFor="speed">Drift speed</label><input id="speed" aria-label="Drift speed" type="range" min="0" max="10" step=".1" defaultValue="7.5" aria-valuetext="75% drift speed" /><output id="speed-value" htmlFor="speed">75%</output></div><button id="add" className="add"><b>+</b>Add {mode === 'candy' ? 'candy' : 'a cake'}<small>C</small></button></div><footer><span className="live">ALL SYSTEMS DELICIOUS</span><span>BAKED WITH STARDUST &nbsp; ✧ &nbsp; {mode === 'candy' ? 'EXTRA CANDY FOR HELLY' : 'EXTRA FROSTING FOR HELLY'}</span></footer></div></main></>;
}
export default function App() {
 const year = yearFromPath(location.pathname);
 useEffect(() => { document.title = year === '2025' ? 'Helly’s Wonderland · 2025' : 'Helly’s Wonderland · 2026'; }, [year]);
 if (year === '2025') return <><header className="legacy-header"><span className="legacy-title">Helly’s Wonderland · 2025</span><YearNav year="2025" /></header><iframe className="legacy-frame" src={sitePath("2025/original.html")} title="Original 2025 birthday game" allow="autoplay; fullscreen" /></>;
 return <SpaceCakes />;
}
