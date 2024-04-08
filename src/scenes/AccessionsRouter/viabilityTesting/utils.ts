export const getCutTestViabilityPercent = (cutTest: any) => {
  const { seedsFilled, seedsCompromised, seedsTested } = cutTest;
  return Math.floor(((Number(seedsFilled) + Number(seedsCompromised)) / Number(seedsTested)) * 100);
};
