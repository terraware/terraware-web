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

// Simple linear congruential generator — deterministic given the same seed.
// Used only when a seed is set (e.g. by Playwright via window.__CHART_COLOR_SEED__)
// so screenshot tests can rely on stable chart colors across runs.
const createSeededRandom = (seed: number) => {
  let state = Math.abs(Math.floor(seed)) || 1;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
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
