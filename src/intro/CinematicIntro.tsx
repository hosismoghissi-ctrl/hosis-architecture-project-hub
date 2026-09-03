import { type CSSProperties, type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Box, Pause, Play, RotateCcw } from 'lucide-react';
import { INTRO } from './videoConfig';

export function CinematicIntro() {
  const video = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [finished, setFinished] = useState(reduced);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [fallback, setFallback] = useState('');
  const [replay, setReplay] = useState(0);
  const [progress, setProgress] = useState(0);
  const [revealPoint, setRevealPoint] = useState({ x: 30, y: 52 });

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(preference.matches);
    preference.addEventListener('change', change);
    return () => preference.removeEventListener('change', change);
  }, []);

  useEffect(() => {
    const restart = () => setReplay(value => value + 1);
    document.addEventListener('hosis:intro:replay', restart);
    return () => document.removeEventListener('hosis:intro:replay', restart);
  }, []);

  useEffect(() => {
    setFinished(reduced); setReady(false); setPaused(false); setProgress(0); setFallback('');
    const media = video.current;
    if (reduced || !media) return;
    let cancelled = false;
    let resumeWhenVisible = false;
    const play = () => media.play().catch(() => { if (!cancelled) setPaused(true); });
    // Use one autoplay path so policy failures reliably expose Resume.
    void play();
    const visibility = () => {
      if (document.hidden) {
        resumeWhenVisible = !media.paused && !media.ended;
        media.pause();
      } else if (resumeWhenVisible) {
        resumeWhenVisible = false;
        void play();
      }
    };
    document.addEventListener('visibilitychange', visibility);
    const timeout = window.setTimeout(() => {
      if (media.readyState < 2) {
        media.pause(); setFallback('The video could not load. You can still enter the hub.'); setFinished(true);
      }
    }, 12000);
    return () => {
      cancelled = true; clearTimeout(timeout);
      document.removeEventListener('visibilitychange', visibility);
      media.pause();
    };
  }, [reduced, replay]);

  function enter() { video.current?.pause(); document.dispatchEvent(new Event('hosis:intro:enter')); }
  function togglePause() {
    const media = video.current;
    if (!media) return;
    if (media.paused) void media.play().catch(() => setPaused(true));
    else media.pause();
  }
  function fail() {
    video.current?.pause();
    setFallback('The video could not load. You can still enter the hub.'); setFinished(true);
  }
  function moveReveal(event: ReactPointerEvent<HTMLElement>) {
    if (!finished) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setRevealPoint({
      x: Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100)),
      y: Math.max(0, Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100)),
    });
  }
  const revealStyle = {
    '--reveal-x': `${revealPoint.x}%`,
    '--reveal-y': `${revealPoint.y}%`,
  } as CSSProperties;

  return <section className={`cinematic cinematic-video-intro ${finished ? 'has-arrived' : ''}`} aria-label="Hosis cinematic introduction" onPointerMove={moveReveal}>
    <img className="cinematic-video-poster" src={INTRO.poster} alt="" />
    {!reduced && <video key={replay} ref={video} className="cinematic-video" src={INTRO.video} poster={INTRO.poster}
      muted playsInline preload="auto" aria-label="Annotated architectural introduction"
      onLoadedData={() => setReady(true)} onError={fail}
      onPlay={() => setPaused(false)} onPause={() => setPaused(true)}
      onTimeUpdate={event => { const media = event.currentTarget; if (media.duration) setProgress(media.currentTime / media.duration); }}
      onEnded={() => { setProgress(1); setFinished(true); }} />}
    <div className={`architectural-reveal ${finished ? 'is-visible' : ''}`} style={revealStyle} aria-hidden="true">
      <img className="architectural-sketch" src={INTRO.sketch} alt="" />
      <span className="architectural-render-mask"><img className="architectural-render" src={INTRO.render} alt="" /></span>
      <span className="architectural-reveal-caption"><b>SKETCH TO DELIVERY</b><small>Move across the drawing to reveal the built vision.</small></span>
    </div>
    <div className="cinematic-shade" aria-hidden="true" />
    <header className="cinematic-header flex items-center justify-between">
      <div className="cinematic-logo flex items-center gap-3"><Box size={31} strokeWidth={1.25} aria-hidden="true" /><span>HOSIS<small>ARCHITECTURE</small></span></div>
      <button className="cinematic-skip flex items-center gap-3" onClick={enter}>Skip Intro <ArrowUpRight size={16} aria-hidden="true" /></button>
    </header>
    <footer className="cinematic-footer">
      <span className="cinematic-film-label">{reduced ? 'REDUCED MOTION' : 'ARCHITECTURE IN MOTION'}</span>
      <div className="cinematic-playback flex items-center gap-4">
        {!finished && <button onClick={togglePause} aria-label={paused ? 'Resume intro' : 'Pause intro'}>{paused ? <Play size={15} /> : <Pause size={15} />}</button>}
        <button onClick={() => setReplay(value => value + 1)} disabled={reduced} aria-label="Replay Intro"><RotateCcw size={15} /></button>
        <span>{finished ? '100' : String(Math.round(progress * 100)).padStart(2, '0')}%</span>
        <span className="cinematic-signal">{finished ? 'WELCOME' : paused ? 'PAUSED' : ready ? 'PLAYING' : 'LOADING VIDEO'}</span>
      </div>
      <div className="cinematic-progress"><div style={{ transform: `scaleX(${finished ? 1 : progress})` }} /></div>
    </footer>
    {fallback && <p className="cinematic-fallback" role="status">{fallback}</p>}
    <span className="sr-only" aria-live="polite">{finished ? 'Intro complete. Choose an Admin or User workspace.' : paused ? 'Intro paused. Select Resume intro to play.' : ''}</span>
  </section>;
}
