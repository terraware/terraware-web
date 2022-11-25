const generateRandomColor = () => {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

const generateRandomColors = (number: number) => {
  const colors = Array.from({ length: number }).map((i) => {
    return generateRandomColor();
  });
  return colors;
};

export { generateRandomColor, generateRandomColors };
