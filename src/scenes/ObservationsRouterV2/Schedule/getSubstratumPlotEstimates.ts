import { Stratum } from 'src/types/Tracking';

export type PlotCounts = {
  numPermanentPlots: number;
  numTemporaryPlots: number;
};

/**
 * Splits a whole number across weighted buckets, giving the leftover to the largest remainders so
 * the parts always add back up to the total.
 */
const apportion = (total: number, weights: number[]): number[] => {
  if (weights.length === 0) {
    return [];
  }

  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  const shares = weights.map((weight) => (weightTotal > 0 ? (total * weight) / weightTotal : total / weights.length));
  const counts = shares.map((share) => Math.floor(share));

  const byRemainder = shares
    .map((share, index) => ({ index, remainder: share - Math.floor(share) }))
    .sort((a, b) => b.remainder - a.remainder);

  let leftover = total - counts.reduce((sum, count) => sum + count, 0);
  for (const { index } of byRemainder) {
    if (leftover <= 0) {
      break;
    }
    counts[index] += 1;
    leftover -= 1;
  }

  return counts;
};

/**
 * Estimates how many of a stratum's plots will land in each of its substrata. The server places
 * plots at random within the stratum, so a substratum's expected share is its share of the area;
 * the real assignment will differ.
 */
const getSubstratumPlotEstimates = (stratum: Stratum, plotCounts: PlotCounts): Map<number, PlotCounts> => {
  const areas = stratum.substrata.map((substratum) => substratum.areaHa);
  const permanent = apportion(plotCounts.numPermanentPlots, areas);
  const temporary = apportion(plotCounts.numTemporaryPlots, areas);

  return new Map(
    stratum.substrata.map((substratum, index) => [
      substratum.id,
      { numPermanentPlots: permanent[index], numTemporaryPlots: temporary[index] },
    ])
  );
};

export default getSubstratumPlotEstimates;
