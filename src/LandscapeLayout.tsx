import { useEffect, useState, type ReactNode } from 'react';

const portraitPhone = '(max-width: 1024px) and (orientation: portrait) and (any-pointer: coarse)';

export function LandscapeLayout({ children }: { children: ReactNode }) {
  const [portrait, setPortrait] = useState(() => matchMedia(portraitPhone).matches);
  const [hint, setHint] = useState('Turn your phone sideways for the full wonderland.');
  const [fullscreen, setFullscreen] = useState(false);
  useEffect(() => {
    const query = matchMedia(portraitPhone);
    const update = () => setPortrait(query.matches);
    const updateFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    query.addEventListener('change', update);
    document.addEventListener('fullscreenchange', updateFullscreen);
    return () => { query.removeEventListener('change', update); document.removeEventListener('fullscreenchange', updateFullscreen); };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.orientationBlocked = String(portrait);
    return () => { delete document.documentElement.dataset.orientationBlocked; };
  }, [portrait]);
  async function enterLandscape() {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      const orientation = screen.orientation as ScreenOrientation & { lock?: (value: string) => Promise<void> };
      if (orientation?.lock) await orientation.lock('landscape');
      else setHint('Rotate your phone sideways. If needed, turn off your phone’s rotation lock.');
    } catch {
      setHint('Rotate your phone sideways. This browser needs manual rotation; turn off rotation lock if needed.');
    }
  }
  return <>
    <div className="game-surface" inert={portrait} aria-hidden={portrait || undefined} style={portrait ? { visibility:'hidden' } : undefined}>{children}</div>
    {portrait && <section className="rotate-screen" aria-labelledby="rotate-title">
      <div className="rotate-phone" aria-hidden="true">▯<span>↻</span></div>
      <span className="eyebrow">HELLY’S WONDERLAND</span>
      <p>{hint}</p>
      <button className="add" onClick={enterLandscape}>Enter landscape ⛶</button>
    </section>}
    {!portrait && <button className="mobile-fullscreen" aria-label={fullscreen ? 'Exit fullscreen' : 'Enter landscape fullscreen'} title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} onClick={() => {
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
      else void enterLandscape();
    }}>{fullscreen ? '✕' : '⛶'}</button>}
  </>;
}
