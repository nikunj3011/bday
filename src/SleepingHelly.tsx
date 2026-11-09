import { useId } from 'react';
import type { GameMode } from './universe';

export function SleepingHelly({ mode }: { mode: GameMode }) {
  const titleId = useId();
  return (
    <figure className="sleeping-helly">
      <div className="dream-bubble">
       <span className="dream-label">{mode === 'candy' ? 'DREAMING IN CANDYLAND' : 'DREAMING IN CAKE KINGDOM'}</span>
       <svg viewBox="0 0 340 145" role="img" aria-label={mode === 'candy' ? 'An animated Candyland dream with lollipop trees, floating candies and candy hills' : 'An animated cake kingdom dream with cake castles, floating slices and frosting hills'}>
        <rect x="2" y="2" width="336" height="140" rx="35" fill="#eee1fa" />
        <path d="M4 110Q55 50 110 103Q180 38 230 104Q290 65 336 108V141H4Z" fill="#b9dbca" />
        <path d="M3 123Q100 83 172 122Q260 80 337 122V142H3Z" fill="#e7abc8" />
        <path d="M155 142Q235 110 189 94Q169 83 191 77" fill="none" stroke="#fff2ce" strokeWidth="13" />
        <g className="dream-clouds" fill="white" opacity=".85"><ellipse cx="55" cy="35" rx="24" ry="8"/><ellipse cx="260" cy="26" rx="30" ry="9"/></g>
        {mode === 'candy' ? <>
         {[48,275].map((x,i)=><g key={x} className="dream-tree" style={{animationDelay:`${i*.6}s`}}><path d={`M${x} 109V59`} stroke="#fff3e0" strokeWidth="7"/><circle cx={x} cy="58" r="25" fill={i?'#b397de':'#e881a9'}/><path d={`M${x-14} 58q0-18 23-11q18 20-9 26q-17-4-8-17q10-6 12 4`} fill="none" stroke="#fff1d5" strokeWidth="5" strokeLinecap="round"/></g>)}
         <g className="dream-treat treat-one"><path d="M126 47l-13-9v24l13-9M151 47l13-9v24l-13-9" fill="#b08bd5"/><rect x="124" y="39" width="29" height="23" rx="9" fill="#f3c674"/><path d="M132 40l8 20M142 40l8 16" stroke="#fff1dc" strokeWidth="4"/></g>
         <g className="dream-treat treat-two"><path d="M211 64l-12-8v23l12-8M235 64l12-8v23l-12-8" fill="#efc277"/><rect x="209" y="58" width="29" height="22" rx="9" fill="#e58fb8"/></g>
        </> : <>
         {[45,270].map((x,i)=><g key={x} className="dream-tree"><rect x={x-26} y="81" width="52" height="31" rx="5" fill="#edbe8f"/><rect x={x-20} y="59" width="40" height="27" rx="4" fill={i?'#b397de':'#e881a9'}/><path d={`M${x-25} 85h50M${x-19} 63h38`} stroke="#fff2de" strokeWidth="7"/><path d={`M${x} 58V44`} stroke="#fff2de" strokeWidth="4"/><ellipse cx={x} cy="41" rx="3" ry="6" fill="#f2b955"/></g>)}
         <g className="dream-treat treat-one"><path d="M125 57l27-14v29h-27Z" fill="#edbc8b"/><path d="M125 56l27-14 10 12-24 13Z" fill="#f3a6c4"/><path d="M127 65h25" stroke="#fff0d7" strokeWidth="4"/></g>
         <g className="dream-treat treat-two"><path d="M208 74l25-14v29h-25Z" fill="#c095d6"/><path d="M208 73l25-14 10 11-25 14Z" fill="#f5c1d4"/></g>
        </>}
        <g fill="#fff6cf"><path d="M90 22l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/><path d="M231 39l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z"/></g>
       </svg>
       <span className="dream-dot dot-one"/><span className="dream-dot dot-two"/>
      </div>
      <svg viewBox="0 0 340 170" role="img" aria-labelledby={titleId}>
        <title id={titleId}>Helly sleeping peacefully after her birthday feast, with a full tummy and floating Zzzs</title>
        <ellipse cx="166" cy="148" rx="139" ry="10" fill="currentColor" opacity=".09" />
        <g className="sleep-float">
          <path d="M21 131Q162 106 320 132L313 145H28Z" fill="#a18bbd" />
          <rect x="26" y="78" width="92" height="54" rx="24" fill="#e9d9f1" transform="rotate(-8 72 105)" />
          <path d="M241 112L289 114Q309 114 308 128L247 130" fill="#edbaa1" />
          <path d="M288 113Q312 107 317 120L316 132H288Z" fill="#674f83" />
          <g className="sleep-tummy">
            <path d="M104 116Q100 82 139 65Q174 28 215 65Q250 75 262 120Q182 139 104 128Z" fill="#c27baa" />
            <path d="M125 116Q184 128 247 115" fill="none" stroke="#ecc5de" strokeWidth="5" />
            <path d="M183 76l5-8 5 8-5 8Z" fill="#ffe3a2" />
          </g>
          <path d="M111 90Q143 83 155 96L181 101" stroke="#edbaa1" strokeWidth="12" fill="none" strokeLinecap="round" />
          <ellipse cx="182" cy="102" rx="10" ry="7" fill="#edbaa1" transform="rotate(12 182 102)" />
          <path d="M41 106Q25 56 60 54Q95 44 111 74L106 115Z" fill="#493549" />
          <ellipse cx="76" cy="88" rx="29" ry="28" fill="#edbaa1" transform="rotate(-15 76 88)" />
          <path d="M45 87Q41 48 77 55Q99 53 109 77Q82 79 71 65Q62 83 45 87" fill="#493549" />
          <path d="M60 88q6 5 12-1M83 84q6 5 12-1" fill="none" stroke="#493549" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M75 100q5 4 10-1" fill="none" stroke="#ac6279" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="58" cy="99" rx="5" ry="3" fill="#df949d" />
          <path d="M51 62L53 36L77 53Z" fill="#ffe3a2" /><circle cx="53" cy="36" r="4" fill="#e899b9" />
          <path d="M133 137l6 2-4 4M147 140l4-2 3 4" stroke="#e4be8d" strokeWidth="3" fill="none" />
        </g>
        <g className="sleep-zzz" fill="currentColor" fontFamily="'Space Grotesk', sans-serif" fontWeight="600" aria-hidden="true">
          <text className="sleep-z z-one" x="113" y="56" fontSize="16">z</text>
          <text className="sleep-z z-two" x="130" y="37" fontSize="21">z</text>
          <text className="sleep-z z-three" x="153" y="18" fontSize="27">Z</text>
        </g>
      </svg>
      <figcaption>{mode === 'candy' ? 'Do not disturb. Taking a sugar-nap in Candyland…' : 'Do not disturb. Downloading cake dreams…'}</figcaption>
    </figure>
  );
}
