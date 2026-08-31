import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowRight, Box, Globe2, MapPin, Pause, Play, RotateCcw } from 'lucide-react';
import { INTRO, stageAt } from './config';
import type { createMapScene } from './mapScene';

const stages = ['World', 'Canada', 'Toronto', 'Your destination'];
type Scene = Awaited<ReturnType<typeof createMapScene>>;

export function CinematicIntro() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const marker = useRef<HTMLDivElement>(null);
  const cnLabel = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const timeLabel = useRef<HTMLSpanElement>(null);
  const clock = useRef(0);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [stage, setStage] = useState(0);
  const [ready, setReady] = useState(false);
  const [finished, setFinished] = useState(false);
  const [fallback, setFallback] = useState('');
  const [replay, setReplay] = useState(0);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [liveMessage, setLiveMessage] = useState('');

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(preference.matches);
    preference.addEventListener('change', change);
    return () => preference.removeEventListener('change', change);
  }, []);

  useEffect(() => {
    clock.current = 0; pausedRef.current = false;
    setPaused(false); setFinished(reduced); setStage(reduced ? 3 : 0); setReady(false); setFallback('');
    if (reduced) { setLiveMessage('Welcome to Hosis Architecture Project Hub'); return; }
    const aborter = new AbortController();
    let scene: Scene | undefined;
    let frame = 0;
    let previous = 0;
    let previousStage = 0;
    let cancelled = false;
    const hideListener = () => { previous = 0; };
    document.addEventListener('visibilitychange', hideListener);
    const frameTick = (now: number) => {
      if (cancelled || !scene) return;
      // Use elapsed time, not frame count: low-powered devices must not stretch a 12s intro into a minute.
      const delta = previous ? Math.max(0, now - previous) : 0;
      previous = now;
      if (!pausedRef.current && !document.hidden) {
        clock.current = Math.min(INTRO.duration, clock.current + delta);
        const time = clock.current;
        scene.update(time);
        const nextStage = stageAt(time);
        if (nextStage !== previousStage) { previousStage = nextStage; setStage(nextStage); }
        if (progress.current) progress.current.style.transform = `scaleX(${time / INTRO.duration})`;
        if (timeLabel.current) timeLabel.current.textContent = `${Math.round(time / INTRO.duration * 100).toString().padStart(2, '0')}%`;
        const pin = scene.map.project(INTRO.destination.coordinates);
        if (marker.current) {
          marker.current.style.transform = `translate(${pin.x}px, ${pin.y}px)`;
          marker.current.style.opacity = time > 8700 ? '1' : '0';
        }
        const cn = scene.map.project(INTRO.cnTower);
        if (cnLabel.current) {
          cnLabel.current.style.transform = `translate(${cn.x}px, ${cn.y}px)`;
          cnLabel.current.style.opacity = time > 5900 && time < 9300 ? '1' : '0';
        }
        if (time >= INTRO.duration) {
          setFinished(true); setLiveMessage('Arrived. Welcome to Hosis Architecture Project Hub');
          return;
        }
      }
      frame = requestAnimationFrame(frameTick);
    };
    const startupTimeout = window.setTimeout(() => {
      if (!scene && !cancelled) { aborter.abort(); setFallback('The live map is unavailable. You can still enter the hub.'); setFinished(true); setStage(3); }
    }, 14000);
    import('./mapScene').then(module => {
      if (cancelled || aborter.signal.aborted || !mapContainer.current) return undefined;
      return module.createMapScene(mapContainer.current, aborter.signal);
    }).then(result => {
      if (!result) return;
      if (cancelled || aborter.signal.aborted) { result.remove(); return; }
      clearTimeout(startupTimeout);
      scene = result; setReady(true);
      frame = requestAnimationFrame(frameTick);
    }).catch(error => {
      if (cancelled) return;
      console.warn('Hosis intro map unavailable:', error instanceof Error ? error.message : 'Unknown map error');
      clearTimeout(startupTimeout); aborter.abort();
      setFallback('The live map is unavailable. You can still enter the hub.'); setFinished(true); setStage(3);
    });
    return () => {
      cancelled = true; clearTimeout(startupTimeout); cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', hideListener);
      scene?.remove(); aborter.abort();
    };
  }, [replay, reduced]);

  function enter() { document.dispatchEvent(new Event('hosis:intro:enter')); }
  function togglePause() { pausedRef.current = !pausedRef.current; setPaused(pausedRef.current); }

  return <section className={`cinematic ${finished ? 'has-arrived' : ''} ${ready ? 'map-ready' : ''}`} aria-label="Hosis cinematic introduction" data-stage={stage}>
    <div className="cinematic-poster" aria-hidden="true" />
    <div className="cinematic-map" ref={mapContainer} aria-hidden="true" />
    <div className="cinematic-shade" aria-hidden="true" />
    <div className="cinematic-grain" aria-hidden="true" />

    <header className="cinematic-header flex items-center justify-between">
      <div className="cinematic-logo flex items-center gap-3"><Box size={31} strokeWidth={1.25} aria-hidden="true" /><span>HOSIS<small>ARCHITECTURE</small></span></div>
      <div className="cinematic-header-label">PROJECT DELIVERY & COORDINATION</div>
      <button className="cinematic-skip flex items-center gap-3" onClick={enter}>Skip Intro <ArrowUpRight size={16} aria-hidden="true" /></button>
    </header>

    <div className={`cinematic-title ${finished ? 'is-hidden' : ''}`} aria-hidden={finished}>
      <div className="cinematic-eyebrow"><span /> ARCHITECTURE, IN CONTEXT</div>
      <h1 key={stage}><span className="cinematic-title-serif">{stage < 2 ? 'A world of' : stage === 2 ? 'A city of' : 'A place to'}</span><br />{stage < 2 ? 'possibilities.' : stage === 2 ? 'perspectives.' : 'begin.'}</h1>
      <p>{stage < 2 ? 'Every project begins with a sense of place.' : stage === 2 ? 'Toronto, Canada · An architectural perspective' : INTRO.destination.label}</p>
    </div>

    <div ref={cnLabel} className="cinematic-map-label" aria-hidden="true"><span />CN TOWER<small>Schematic landmark</small></div>
    <div ref={marker} className="cinematic-destination" aria-hidden="true"><div className="destination-cross" /><div className="destination-caption"><MapPin size={13} /><span>HOSIS · DEMO DESTINATION</span></div></div>

    {finished && <div className="cinematic-welcome">
      <div className="cinematic-eyebrow"><span /> YOU HAVE ARRIVED</div>
      <h1>Welcome to<br /><span>Hosis Architecture</span><br />Project Hub.</h1>
      <p>Project Delivery & Coordination</p>
      <div className="cinematic-actions flex items-center gap-3 flex-wrap">
        <button className="cinematic-enter flex items-center gap-3" onClick={enter}>Enter Project Hub <ArrowRight size={18} aria-hidden="true" /></button>
        <button className="cinematic-replay flex items-center gap-2" onClick={() => setReplay(value => value + 1)} disabled={reduced}><RotateCcw size={15} aria-hidden="true" />{reduced ? 'Reduced motion' : 'Replay Intro'}</button>
      </div>
      {fallback && <p className="cinematic-fallback" role="status">{fallback}</p>}
    </div>}

    <div className="cinematic-location"><MapPin size={15} aria-hidden="true" /><div><strong>{finished || stage === 3 ? INTRO.destination.label : stage === 2 ? 'Toronto, Ontario' : 'A global perspective'}</strong><span>{finished || stage === 3 ? INTRO.destination.subtitle : 'HOSIS ARCHITECTURE'}</span></div></div>

    <footer className="cinematic-footer">
      <div className="cinematic-route flex items-center">
        <Globe2 size={17} strokeWidth={1.3} aria-hidden="true" />
        {stages.map((label, index) => <span key={label} className={stage === index ? 'current' : stage > index ? 'passed' : ''}><b>{`0${index + 1}`}</b>{label}{index < 3 && <i />}</span>)}
      </div>
      <div className="cinematic-playback flex items-center gap-4">
        {!finished && <button onClick={togglePause} disabled={!ready} aria-label={paused ? 'Resume intro' : 'Pause intro'}>{paused ? <Play size={15} /> : <Pause size={15} />}</button>}
        <span ref={timeLabel}>{finished ? '100%' : '00%'}</span><span className="cinematic-signal">{finished ? 'ARRIVED' : !ready ? 'LOADING MAP' : paused ? 'PAUSED' : 'EXPLORING'}</span>
      </div>
      <div className="cinematic-progress"><div ref={progress} style={finished ? { transform: 'scaleX(1)' } : undefined} /></div>
    </footer>
    <span className="cinematic-data-note">Illustrative 3D map · Demo destination</span>
    <span className="sr-only" aria-live="polite">{liveMessage}</span>
  </section>;
}
