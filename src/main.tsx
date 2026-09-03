import { createRoot } from 'react-dom/client';
import { useEffect } from 'react';
import { CinematicIntro } from './intro/CinematicIntro';
import './index.css';

function IntroHost() {
  useEffect(() => {
    document.dispatchEvent(new Event('hosis:intro:enter'));
  }, []);

  return <CinematicIntro />;
}

createRoot(document.getElementById('introRoot')!).render(<IntroHost />);
