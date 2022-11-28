const generateRandomColor = () => {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

const generateRandomColors = (numberOfColors: number) => {
  const colors = Array.from({ length: numberOfColors }).map((i) => {
    return generateRandomColor();
  });
  return colors;
};

export { generateRandomColor, generateRandomColors };
