import { type CSSProperties, type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Box } from 'lucide-react';
import { INTRO } from './videoConfig';

type CinematicIntroProps = {
  leaving?: boolean;
  onEnter: () => void;
};

export function CinematicIntro({ leaving = false, onEnter }: CinematicIntroProps) {
  const surface = useRef<HTMLElement>(null);
  const frame = useRef<number>();
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(preference.matches);
    preference.addEventListener('change', updatePreference);
    return () => preference.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => () => {
    if (frame.current) window.cancelAnimationFrame(frame.current);
  }, []);

  function moveReveal(event: ReactPointerEvent<HTMLElement>) {
    const target = event.currentTarget;
    const bounds = target.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100));
    const y = Math.max(0, Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100));
    if (frame.current) window.cancelAnimationFrame(frame.current);
    frame.current = window.requestAnimationFrame(() => {
      surface.current?.style.setProperty('--reveal-x', `${x}%`);
      surface.current?.style.setProperty('--reveal-y', `${y}%`);
      surface.current?.classList.add('has-interacted');
    });
  }

  const initialReveal = {
    '--reveal-x': reducedMotion ? '35%' : '29%',
    '--reveal-y': '54%',
  } as CSSProperties;

  return (
    <section
      ref={surface}
      className={`cinematic cinematic-architectural-intro${leaving ? ' is-leaving' : ''}`}
      style={initialReveal}
      aria-label="Hosis Architecture introduction"
      onPointerMove={moveReveal}
      onPointerDown={moveReveal}
    >
      <div className="cinematic-visual" aria-hidden="true">
        <img className="cinematic-sketch" src={INTRO.sketch} alt="" draggable="false" />
        <span className="cinematic-render-mask">
          <img className="cinematic-render" src={INTRO.render} alt="" draggable="false" />
        </span>
      </div>
      <div className="cinematic-vignette" aria-hidden="true" />

      <header className="cinematic-topline">
        <div className="cinematic-logo">
          <Box size={30} strokeWidth={1.25} aria-hidden="true" />
          <span>{INTRO.brand}<small>{INTRO.brandDescriptor}</small></span>
        </div>
        <span className="cinematic-study">{INTRO.studyLabel}</span>
      </header>

      <div className="cinematic-copy">
        <p className="cinematic-kicker">{INTRO.secondaryTitle}</p>
        <h1>{INTRO.title}<span>{INTRO.titleAccent}</span></h1>
        <p className="cinematic-supporting">{INTRO.supportingText}</p>
        <button className="cinematic-enter" type="button" onClick={onEnter}>
          <span>{INTRO.cta}</span>
          <ArrowUpRight size={18} aria-hidden="true" />
        </button>
      </div>

      <footer className="cinematic-footerline">
        <span>{INTRO.closingLine}</span>
        <span className="cinematic-reveal-hint">Move or touch to reveal</span>
      </footer>
    </section>
  );
}
