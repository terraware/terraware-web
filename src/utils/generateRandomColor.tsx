import { Theme } from '@mui/material';

const terrawareColors = (theme: Theme) => [
  theme.palette.TwClrBaseYellow300,
  theme.palette.TwClrBaseRed300,
  theme.palette.TwClrBaseBlue300,
  theme.palette.TwClrBaseGreen300,
  theme.palette.TwClrBasePurple300,
  theme.palette.TwClrBaseOrange300,
  theme.palette.TwClrBasePink300,
  theme.palette.TwClrBaseGray300,
  theme.palette.TwClrBaseTeal300,
];

const generateRandomColor = () => {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

const generateRandomColors = (numberOfColors: number) => {
  const colors = Array.from({ length: numberOfColors }).map((i) => {
    return generateRandomColor();
  });
  return colors;
};

const generateTerrawareRandomColors = (theme: Theme, numberOfColors: number) => {
  const terrawareColorsList = terrawareColors(theme);
  const colors = Array.from({ length: numberOfColors }).map((_, i) => {
    const randomIndex = Math.floor(Math.random() * terrawareColorsList.length);
    const selectedColor = terrawareColorsList.splice(randomIndex, 1);
    return selectedColor[0] || generateRandomColor();
  });
  return colors;
};

export { generateRandomColor, generateRandomColors, generateTerrawareRandomColors };
