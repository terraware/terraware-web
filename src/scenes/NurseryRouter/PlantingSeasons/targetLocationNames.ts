import { type SpeciesTargetPayload } from 'src/queries/generated/plantingSeasons';
import { type StratumResponsePayload } from 'src/queries/generated/plantingSites';

export type TargetLocationNames = {
  strataNames: string[];
  substrataNames: string[];
};

export const getTargetLocationNames = (
  strata: StratumResponsePayload[],
  speciesTargets: SpeciesTargetPayload[]
): TargetLocationNames => {
  const targetSubstratumIds = new Set(speciesTargets.map((target) => target.substratumId));

  return strata.reduce<TargetLocationNames>(
    (acc, stratum) => {
      const targetSubstrata = stratum.substrata.filter((substratum) => targetSubstratumIds.has(substratum.id));

      if (targetSubstrata.length > 0) {
        acc.strataNames.push(stratum.name);
        acc.substrataNames.push(...targetSubstrata.map((substratum) => substratum.fullName));
      }

      return acc;
    },
    { strataNames: [], substrataNames: [] }
  );
};
