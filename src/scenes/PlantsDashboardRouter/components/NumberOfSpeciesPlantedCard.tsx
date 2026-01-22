import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon, Tooltip } from '@terraware/web-components';
import { ChartTypeRegistry, TooltipItem } from 'chart.js';

import PieChart from 'src/components/common/Chart/PieChart';
import { useProjectPlantings } from 'src/hooks/useProjectPlantings';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { selectPlantingsForSite } from 'src/redux/features/plantings/plantingsSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { conservationCategories } from 'src/types/Species';

type CategoryData = {
  labels: string[];
  values: number[];
  rareSpeciesPercentage: number;
};

const processConservationCategories = (
  categoryTotals: Record<string, number>,
  totalRare: number,
  totalSpecies: number
): CategoryData => {
  const sortedTopFourCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  const topCategoriesTotal = sortedTopFourCategories.reduce((sum, [, quantity]) => sum + quantity, 0);
  const totalQuantity = Object.values(categoryTotals).reduce((sum, quantity) => sum + quantity, 0);
  const otherTotal = totalQuantity - topCategoriesTotal;
  const finalCategoryTotals: Record<string, number> = {};
  sortedTopFourCategories.forEach(([category, quantity]) => {
    finalCategoryTotals[category] = quantity;
  });
  if (otherTotal > 0) {
    finalCategoryTotals.Other = otherTotal;
  }

  const rareSpeciesPercentage = totalSpecies > 0 ? Number(((totalRare * 100) / totalSpecies).toFixed(2)) : 0;
  const labels = Object.keys(finalCategoryTotals).map(
    (ctId) => conservationCategories().find((c) => c.value === ctId)?.label || strings.OTHER
  );
  const values = Object.values(finalCategoryTotals).map((cat) =>
    totalSpecies > 0 ? Number(((cat * 100) / totalSpecies).toFixed(2)) : 0
  );

  return {
    labels,
    values,
    rareSpeciesPercentage,
  };
};

type NumberOfSpeciesPlantedCardProps = {
  projectId?: number;
};

export default function NumberOfSpeciesPlantedCard({
  projectId,
}: NumberOfSpeciesPlantedCardProps): JSX.Element | undefined {
  const { plantingSite } = usePlantingSiteData();

  if (projectId && plantingSite?.id === -1) {
    return <RolledUpCard projectId={projectId} />;
  }

  if (!plantingSite) {
    return <RolledUpCard projectId={projectId} />;
  } else if (!plantingSite.strata?.length) {
    return <SiteWithoutStrataCard plantingSiteId={plantingSite.id} />;
  } else {
    return <SiteWithStrataCard />;
  }
}
const RolledUpCard = ({ projectId }: { projectId?: number }): JSX.Element => {
  const { reportedPlants } = useProjectPlantings(projectId);
  const { species: orgSpecies } = useSpeciesData();

  const projectTotalSpecies = useMemo(() => {
    const allSpeciesIds = new Set();
    for (const site of reportedPlants) {
      for (const species of site.species) {
        allSpeciesIds.add(species.id);
      }
    }
    return allSpeciesIds.size;
  }, [reportedPlants]);

  const [labels, setLabels] = useState<string[]>();
  const [values, setValues] = useState<number[]>();
  const [rareSpecies, setRareSpecies] = useState<number>();

  const projectSpecies = useMemo(() => {
    const speciesMap = new Map();
    for (const site of reportedPlants) {
      for (const species of site.species) {
        if (!speciesMap.has(species.id)) {
          speciesMap.set(species.id, species);
        }
      }
    }

    return Array.from(speciesMap.values());
  }, [reportedPlants]);

  useEffect(() => {
    const categoryTotals: Record<string, number> = {};
    let totalRare = 0;
    projectSpecies.forEach((reportedSpecies) => {
      const species = orgSpecies.find((s) => s.id === reportedSpecies.id);
      if (species) {
        if (species.rare === true) {
          totalRare += 1;
        }

        if (species.conservationCategory) {
          if (categoryTotals[species.conservationCategory]) {
            categoryTotals[species.conservationCategory] += 1;
          } else {
            categoryTotals[species.conservationCategory] = 1;
          }
        } else {
          categoryTotals[strings.OTHER] = (categoryTotals[strings.OTHER] || 0) + 1;
        }
      }
    });

    const {
      labels: processedLabels,
      values: processedValues,
      rareSpeciesPercentage,
    } = processConservationCategories(categoryTotals, totalRare, projectTotalSpecies);

    setRareSpecies(rareSpeciesPercentage);
    setLabels(processedLabels);
    setValues(processedValues);
  }, [orgSpecies, projectTotalSpecies, projectSpecies]);

  return <ChartData labels={labels} values={values} rareSpecies={rareSpecies} />;
};

const SiteWithoutStrataCard = ({
  plantingSiteId,
}: NumberOfSpeciesPlantedCardProps & { plantingSiteId: number }): JSX.Element | undefined => {
  const [labels, setLabels] = useState<string[]>();
  const [values, setValues] = useState<number[]>();
  const [rareSpecies, setRareSpecies] = useState<number>();

  const plantings = useAppSelector((state) => selectPlantingsForSite(state, plantingSiteId));

  useEffect(() => {
    const speciesNames: Set<string> = new Set();
    const categoryTotals: Record<string, number> = {};
    let totalRare = 0;

    plantings.forEach((planting) => {
      const { rare, conservationCategory } = planting.species;

      if (rare === 'true') {
        totalRare += 1;
      }

      if (conservationCategory) {
        if (categoryTotals[conservationCategory]) {
          categoryTotals[conservationCategory] += 1;
        } else {
          categoryTotals[conservationCategory] = 1;
        }
      }
    });

    const speciesCount = speciesNames.size;
    const {
      labels: processedLabels,
      values: processedValues,
      rareSpeciesPercentage,
    } = processConservationCategories(categoryTotals, totalRare, speciesCount);

    setRareSpecies(rareSpeciesPercentage);
    setLabels(processedLabels);
    setValues(processedValues);
  }, [plantings]);

  return <ChartData labels={labels} values={values} rareSpecies={rareSpecies} />;
};

const SiteWithStrataCard = (): JSX.Element => {
  const { plantingSiteReportedPlants } = usePlantingSiteData();
  const { species: orgSpecies } = useSpeciesData();

  const totalSpecies = useMemo(() => plantingSiteReportedPlants?.species.length ?? 0, [plantingSiteReportedPlants]);
  const [rareSpecies, setRareSpecies] = useState<number>();
  const [labels, setLabels] = useState<string[]>();
  const [values, setValues] = useState<number[]>();

  useEffect(() => {
    if (plantingSiteReportedPlants?.species && orgSpecies) {
      const categoryTotals: Record<string, number> = {};
      let totalRare = 0;

      plantingSiteReportedPlants.species.forEach((reportedSpecies) => {
        const species = orgSpecies.find((s) => s.id === reportedSpecies.id);
        if (species) {
          if (species.rare) {
            totalRare = totalRare + 1;
          }

          if (species.conservationCategory) {
            if (categoryTotals[species.conservationCategory]) {
              categoryTotals[species.conservationCategory] += 1;
            } else {
              categoryTotals[species.conservationCategory] = 1;
            }
          } else {
            categoryTotals[strings.OTHER] = (categoryTotals[strings.OTHER] || 0) + 1;
          }
        }
      });

      const {
        labels: processedLabels,
        values: processedValues,
        rareSpeciesPercentage,
      } = processConservationCategories(categoryTotals, totalRare, totalSpecies);

      setRareSpecies(rareSpeciesPercentage);
      setLabels(processedLabels);
      setValues(processedValues);
    }
  }, [plantingSiteReportedPlants, orgSpecies, totalSpecies]);

  return <ChartData labels={labels} values={values} rareSpecies={rareSpecies} />;
};

type ChartDataProps = {
  labels?: string[];
  values?: number[];
  rareSpecies?: number;
};

const ChartData = ({ labels, values, rareSpecies }: ChartDataProps): JSX.Element | undefined => {
  const theme = useTheme();

  const tooltipRenderer = useCallback((tooltipItem: TooltipItem<keyof ChartTypeRegistry>) => {
    const v = tooltipItem.dataset.data[tooltipItem.dataIndex]?.toString();
    return `${v}%`;
  }, []);

  const chartData = useMemo(() => {
    return {
      labels: labels ?? [],
      datasets: [
        {
          values: values ?? [],
        },
      ],
    };
  }, [labels, values]);

  if (!chartData) {
    return undefined;
  }

  return (
    <Box marginRight={2}>
      <Box display={'flex'} alignItems={'center'}>
        <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
          {strings.SPECIES_CATEGORIES}
        </Typography>
        <Tooltip title={strings.SPECIES_CATEGORIES_TOOLTIP}>
          <Box display='flex'>
            <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
          </Box>
        </Tooltip>
      </Box>

      <Box height={'220px'} marginTop={3}>
        <PieChart
          chartId='speciesByCategory'
          chartData={chartData}
          maxWidth='100%'
          minHeight='100px'
          yLimits={{ min: 0, max: 100 }}
          yStepSize={20}
          customTooltipLabel={tooltipRenderer}
          pluginsOptions={{
            emptyDoughnut: {
              color: theme.palette.TwClrBaseGray050,
              width: 100,
              radiusDecrease: 70,
            },
          }}
        />
      </Box>

      <Typography fontSize={'16px'} fontWeight={600} marginRight={1}>
        {strings.RARE}: {rareSpecies}%
      </Typography>
    </Box>
  );
};
