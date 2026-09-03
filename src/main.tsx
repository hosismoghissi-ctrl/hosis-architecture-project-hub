import { createRoot } from 'react-dom/client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CinematicIntro } from './intro/CinematicIntro';
import { INTRO } from './intro/videoConfig';
import './index.css';

type EntryStage = 'intro' | 'leaving' | 'login';

function IntroHost() {
  const [stage, setStage] = useState<EntryStage>('intro');
  const transitionTimer = useRef<number>();

  const showLogin = useCallback(() => {
    window.clearTimeout(transitionTimer.current);
    setStage('login');
  }, []);

  const enterWorkspace = useCallback(() => {
    if (stage !== 'intro') return;
    setStage('leaving');
    transitionTimer.current = window.setTimeout(showLogin, 720);
  }, [showLogin, stage]);

  useEffect(() => {
    const entry = document.getElementById('intro');
    entry?.style.setProperty('--entry-image', `url("${INTRO.render}")`);
    entry?.classList.toggle('entry-mode', stage === 'login');

    if (stage === 'login') {
      window.requestAnimationFrame(() => {
        document.dispatchEvent(new Event('hosis:intro:enter'));
      });
    }
  }, [stage]);

  useEffect(() => {
    const close = () => showLogin();
    const returnToLogin = () => showLogin();
    document.addEventListener('hosis:intro:closed', close);
    document.addEventListener('hosis:intro:replay', returnToLogin);
    return () => {
      window.clearTimeout(transitionTimer.current);
      document.removeEventListener('hosis:intro:closed', close);
      document.removeEventListener('hosis:intro:replay', returnToLogin);
    };
  }, [showLogin]);

  return stage === 'login' ? null : <CinematicIntro leaving={stage === 'leaving'} onEnter={enterWorkspace} />;
}

createRoot(document.getElementById('introRoot')!).render(<IntroHost />);
