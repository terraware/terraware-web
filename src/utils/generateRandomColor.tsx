import { Theme } from '@mui/material';

declare global {
  interface Window {
    __CHART_COLOR_SEED__?: number;
  }
}

const terrawareColors = (theme: Theme) => [
  theme.palette.TwClrBaseYellow300,
  theme.palette.TwClrBaseRed300,
  theme.palette.TwClrBaseBlue300,
  theme.palette.TwClrBaseGreen300,
  theme.palette.TwClrBasePurple300,
  theme.palette.TwClrBaseOrange300,
  theme.palette.TwClrBasePink300,
  theme.palette.TwClrBaseGray300,
  theme.palette.TwClrBaseLightGreen300,
];

// mulberry32: small, fast, deterministic PRNG. Used only when a seed is set
// (e.g. by Playwright via window.__CHART_COLOR_SEED__) so screenshot tests
// can rely on stable chart colors across runs.
const createSeededRandom = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const getRandom = (): (() => number) => {
  if (typeof window !== 'undefined' && typeof window.__CHART_COLOR_SEED__ === 'number') {
    return createSeededRandom(window.__CHART_COLOR_SEED__);
  }
  return Math.random;
};

const generateRandomColor = (random: () => number = getRandom()) => {
  return `#${Math.floor(random() * 16777215).toString(16)}`;
};

const generateRandomColors = (numberOfColors: number) => {
  const random = getRandom();
  return Array.from({ length: numberOfColors }, () => generateRandomColor(random));
};

const generateTerrawareRandomColors = (theme: Theme, numberOfColors: number) => {
  const random = getRandom();
  const terrawareColorsList = terrawareColors(theme);
  const colors = Array.from({ length: numberOfColors }).map(() => {
    const randomIndex = Math.floor(random() * terrawareColorsList.length);
    const selectedColor = terrawareColorsList.splice(randomIndex, 1);
    return selectedColor[0] || generateRandomColor(random);
  });
  return colors;
};

export { generateRandomColor, generateRandomColors, generateTerrawareRandomColors };
