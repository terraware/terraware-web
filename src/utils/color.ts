import hexRgb from 'hex-rgb';

export const getRgbaFromHex = (hex: string, opacity: number) => {
  const rgba = hexRgb(hex, { alpha: opacity, format: 'object' });
  const { red, green, blue, alpha } = rgba;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};
