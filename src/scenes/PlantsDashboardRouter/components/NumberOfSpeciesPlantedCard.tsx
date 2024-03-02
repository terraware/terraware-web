import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import BarChart from 'src/components/common/Chart/BarChart';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { useUser } from 'src/providers';
import { selectPlantingsForSite } from 'src/redux/features/plantings/plantingsSelectors';
import { selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { selectSitePopulationZones } from 'src/redux/features/tracking/sitePopulationSelector';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { useNumberFormatter } from 'src/utils/useNumber';

type NumberOfSpeciesPlantedCardProps = {
  plantingSiteId: number;
};

export default function NumberOfSpeciesPlantedCard({ plantingSiteId }: NumberOfSpeciesPlantedCardProps): JSX.Element {
  const plantingSite = useAppSelector((state) => selectPlantingSite(state, plantingSiteId));

  if (!plantingSite?.plantingZones?.length) {
    return <SiteWithoutZonesCard plantingSiteId={plantingSiteId} />;
  } else {
    return <SiteWithZonesCard plantingSiteId={plantingSiteId} />;
  }
}

const SiteWithoutZonesCard = ({ plantingSiteId }: NumberOfSpeciesPlantedCardProps): JSX.Element => {
  const [totalSpecies, setTotalSpecies] = useState<number>();
  const [labels, setLabels] = useState<string[]>();
  const [values, setValues] = useState<number[]>();

  const plantings = useAppSelector((state) => selectPlantingsForSite(state, plantingSiteId));

  useEffect(() => {
    const speciesNames: Set<string> = new Set();
    const speciesByCategory: Record<string, number> = {
      [strings.RARE]: 0,
      [strings.ENDANGERED]: 0,
      [strings.OTHER]: 0,
    };

    plantings.forEach((planting) => {
      const { rare, conservationCategory, scientificName } = planting.species;
      let endangered = false;
      let isRare = false;

      if (conservationCategory === 'EN' || conservationCategory === 'CR') {
        endangered = true;
      }
      if (rare === 'true') {
        isRare = true;
      }

      speciesByCategory[strings.RARE] += isRare ? 1 : 0;
      speciesByCategory[strings.ENDANGERED] += endangered ? 1 : 0;
      speciesByCategory[strings.OTHER] += !(rare || endangered) ? 1 : 0;
      speciesNames.add(scientificName);
    });

    const speciesCount = speciesNames.size;
    setTotalSpecies(speciesCount);
    setLabels(Object.keys(speciesByCategory));
    setValues(
      Object.values(speciesByCategory).map((cat) =>
        speciesCount > 0 ? Number(((cat * 100) / speciesCount).toFixed(2)) : 0
      )
    );
  }, [plantings]);

  return <ChartData labels={labels} values={values} totalSpecies={totalSpecies} />;
};

const SiteWithZonesCard = ({ plantingSiteId }: NumberOfSpeciesPlantedCardProps): JSX.Element => {
  const populationSelector = useAppSelector((state) => selectSitePopulationZones(state));
  const speciesSelector = useAppSelector((state) => selectSpecies(state));
  const [totalSpecies, setTotalSpecies] = useState<number>();
  const [labels, setLabels] = useState<string[]>();
  const [values, setValues] = useState<number[]>();

  useEffect(() => {
    if (populationSelector) {
      const speciesNames: string[] = [];
      const speciesByCategory: Record<string, number> = {
        [strings.RARE]: 0,
        [strings.ENDANGERED]: 0,
        [strings.OTHER]: 0,
      };
      populationSelector?.forEach(
        (zone) =>
          zone.plantingSubzones?.forEach(
            (subzone) =>
              subzone.populations?.forEach((population) => {
                if (speciesNames.includes(population.species_scientificName)) {
                  return;
                }
                speciesNames.push(population.species_scientificName);
                const species = speciesSelector?.find((s) => s.scientificName === population.species_scientificName);
                if (species) {
                  let endangered = false;
                  let rare = false;
                  if (species.conservationCategory === 'EN' || species.conservationCategory === 'CR') {
                    endangered = true;
                  }
                  if (species.rare) {
                    rare = true;
                  }
                  speciesByCategory[strings.RARE] += rare ? 1 : 0;
                  speciesByCategory[strings.ENDANGERED] += endangered ? 1 : 0;
                  speciesByCategory[strings.OTHER] += !(rare || endangered) ? 1 : 0;
                }
              })
          )
      );
      const speciesCount = speciesNames.length;
      setTotalSpecies(speciesCount);
      setLabels(Object.keys(speciesByCategory));
      setValues(
        Object.values(speciesByCategory).map((cat) =>
          speciesCount > 0 ? Number(((cat * 100) / speciesCount).toFixed(2)) : 0
        )
      );
    } else {
      setLabels([]);
      setValues([]);
    }
  }, [populationSelector, speciesSelector]);

  return <ChartData labels={labels} values={values} totalSpecies={totalSpecies} />;
};

type ChartDataProps = {
  labels?: string[];
  values?: number[];
  totalSpecies?: number;
};

const ChartData = ({ labels, values, totalSpecies }: ChartDataProps): JSX.Element => {
  const theme = useTheme();
  const user = useUser().user;
  const numberFormatter = useNumberFormatter();
  const numericFormatter = useMemo(() => numberFormatter(user?.locale), [user?.locale, numberFormatter]);

  const chartData = useMemo(() => {
    if (!labels?.length || !values?.length) {
      return undefined;
    }

    return {
      labels: labels ?? [],
      datasets: [
        {
          values: values ?? [],
        },
      ],
    };
  }, [labels, values]);

  const getBarAnnotations = useCallback(() => {
    if (!values || !labels) {
      return undefined;
    }

    const annotations: any[] = [];
    values?.forEach((v, index) => {
      annotations.push({
        type: 'label',
        content: [`${numericFormatter.format(v)}%`],
        position: {
          x: 'center',
          y: v > 75 ? 'center' : 'end',
        },
        xValue: labels[index],
        yValue: v > 75 ? v / 2 : v,
      });
    });

    return { annotations };
  }, [values, labels, numericFormatter]);

  return (
    <OverviewItemCard
      isEditable={false}
      contents={
        <Box display='flex' flexDirection='column'>
          <Typography fontSize='16px' fontWeight={600} marginBottom={theme.spacing(3)}>
            {strings.NUMBER_OF_SPECIES_PLANTED_CARD_TITLE}
          </Typography>
          <Box display='flex' alignItems='flex-end' flexWrap='wrap' marginBottom={theme.spacing(3)}>
            <Typography fontSize='48px' fontWeight={600} lineHeight={1}>
              {totalSpecies}
            </Typography>
            &nbsp;
            <Typography fontSize='24px' fontWeight={600}>
              {strings.SPECIES}
            </Typography>
          </Box>
          <Box>
            <BarChart
              chartId='speciesByCategory'
              chartData={chartData}
              maxWidth='100%'
              minHeight='100px'
              barAnnotations={getBarAnnotations()}
              yLimits={{ min: 0, max: 100 }}
            />
          </Box>
        </Box>
      }
    />
  );
};
