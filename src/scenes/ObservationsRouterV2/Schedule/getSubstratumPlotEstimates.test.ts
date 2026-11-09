import getSubstratumPlotEstimates from 'src/scenes/ObservationsRouterV2/Schedule/getSubstratumPlotEstimates';
import { buildStratum, buildSubstratum } from 'src/test-utils';

const stratumWithAreas = (...areas: number[]) =>
  buildStratum({
    substrata: areas.map((areaHa, index) => buildSubstratum({ areaHa, id: index + 1 })),
  });

describe('getSubstratumPlotEstimates', () => {
  it('splits plots in proportion to substratum area', () => {
    const estimates = getSubstratumPlotEstimates(stratumWithAreas(30, 10), {
      numPermanentPlots: 8,
      numTemporaryPlots: 4,
    });

    expect(estimates.get(1)).toEqual({ numPermanentPlots: 6, numTemporaryPlots: 3 });
    expect(estimates.get(2)).toEqual({ numPermanentPlots: 2, numTemporaryPlots: 1 });
  });

  it('gives the plots that do not divide evenly to the largest remainders', () => {
    const estimates = getSubstratumPlotEstimates(stratumWithAreas(10, 10, 10), {
      numPermanentPlots: 7,
      numTemporaryPlots: 0,
    });

    expect([1, 2, 3].reduce((total, id) => total + (estimates.get(id)?.numPermanentPlots ?? 0), 0)).toBe(7);
    expect(estimates.get(1)?.numPermanentPlots).toBe(3);
    expect(estimates.get(2)?.numPermanentPlots).toBe(2);
    expect(estimates.get(3)?.numPermanentPlots).toBe(2);
  });

  it('splits evenly when the substrata have no area', () => {
    const estimates = getSubstratumPlotEstimates(stratumWithAreas(0, 0), {
      numPermanentPlots: 4,
      numTemporaryPlots: 3,
    });

    expect(estimates.get(1)).toEqual({ numPermanentPlots: 2, numTemporaryPlots: 2 });
    expect(estimates.get(2)).toEqual({ numPermanentPlots: 2, numTemporaryPlots: 1 });
  });

  it('returns nothing for a stratum with no substrata', () => {
    const estimates = getSubstratumPlotEstimates(buildStratum({ substrata: [] }), {
      numPermanentPlots: 5,
      numTemporaryPlots: 5,
    });

    expect(estimates.size).toBe(0);
  });
});
