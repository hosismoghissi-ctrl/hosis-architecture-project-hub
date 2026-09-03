/**
 * Hosis entry presentation settings. Text and image paths live together so a
 * future workspace can supply its own presentation without changing the app.
 * The legacy video assets remain available in the repository for later use.
 */
export const INTRO = {
  brand: 'HOSIS',
  brandDescriptor: 'ARCHITECTURE',
  studyLabel: 'ARCHITECTURE · DELIVERY · COORDINATION',
  secondaryTitle: 'PROJECT DELIVERY & COORDINATION',
  title: 'HOSIS',
  titleAccent: 'ARCHITECTURE',
  supportingText: 'A centralized workspace for managing projects, people, schedules, coordination, documents, and project delivery.',
  closingLine: 'From concept to closeout — projects, people, and coordination in one place.',
  sketch: `${import.meta.env.BASE_URL}assets/hosis-intro-sketch.jpg`,
  render: `${import.meta.env.BASE_URL}assets/hosis-intro-render.jpg`,
  legacyVideo: `${import.meta.env.BASE_URL}hosis-intro-annotated.mp4`,
  legacyPoster: `${import.meta.env.BASE_URL}hosis-intro-annotated-poster.jpg`,
} as const;
