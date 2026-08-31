import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { CinematicIntro } from './intro/CinematicIntro';
import './index.css';
import { INTRO } from './intro/videoConfig';

function IntroHost() {
  const [active, setActive] = useState(true);
  useEffect(() => {
    const close = () => setActive(false);
    const replay = () => setActive(true);
    document.addEventListener('hosis:intro:closed', close);
    document.addEventListener('hosis:intro:replay', replay);
    let seen = false;
    try { seen = sessionStorage.getItem(INTRO.sessionKey) === '1'; } catch { /* Storage may be disabled. */ }
    if (seen) document.dispatchEvent(new Event('hosis:intro:enter'));
    return () => {
      document.removeEventListener('hosis:intro:closed', close);
      document.removeEventListener('hosis:intro:replay', replay);
    };
  }, []);
  return active ? <CinematicIntro /> : null;
}

createRoot(document.getElementById('introRoot')!).render(<IntroHost />);
