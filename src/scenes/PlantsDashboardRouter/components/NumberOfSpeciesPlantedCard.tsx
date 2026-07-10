import React, { type JSX, useCallback, useEffect, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon, Tooltip } from '@terraware/web-components';
import { ChartTypeRegistry, TooltipItem } from 'chart.js';

import PieChart from 'src/components/common/Chart/PieChart';
import { useLocalization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import {
  useGetPlantingSiteReportedPlantsQuery,
  useLazyGetPlantingSiteQuery,
  useListPlantingSiteReportedPlantsQuery,
} from 'src/queries/generated/plantingSites';
import { conservationCategories } from 'src/types/Species';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

type CategoryData = {
  labels: string[];
  values: number[];
  rareSpeciesPercentage: number;
};

const processConservationCategories = (
  categoryTotals: Record<string, number>,
  totalRare: number,
  totalSpecies: number,
  otherLabel: string
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
    (ctId) => conservationCategories().find((c) => c.value === ctId)?.label || otherLabel
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
  plantingSiteId?: number;
  projectId?: number | 'all';
};

export default function NumberOfSpeciesPlantedCard({
  plantingSiteId,
  projectId,
}: NumberOfSpeciesPlantedCardProps): JSX.Element | undefined {
  const [getPlantingSite, getPlantingSiteResponse] = useLazyGetPlantingSiteQuery();
  const plantingSite = useMemo(() => getPlantingSiteResponse.data?.site, [getPlantingSiteResponse]);

  useEffect(() => {
    if (plantingSiteId) {
      void getPlantingSite({ id: plantingSiteId, includeStrata: false }, true);
    }
  }, [getPlantingSite, plantingSiteId]);

  if (typeof projectId === 'number' && plantingSiteId === undefined) {
    return <RolledUpCard projectId={projectId} />;
  } else if (plantingSite && !plantingSite?.strata?.length) {
    return <SiteWithoutStrataCard plantingSiteId={plantingSite.id} />;
  } else if (plantingSite && plantingSite?.strata?.length) {
    return <SiteWithStrataCard plantingSiteId={plantingSite.id} />;
  } else {
    return <ChartData labels={[]} values={[]} />;
  }
}

const RolledUpCard = ({ projectId }: { projectId?: number }): JSX.Element => {
  const { strings } = useLocalization();
  const { species: orgSpecies } = useSpeciesData();

  const listReportedPlantsResponse = useListPlantingSiteReportedPlantsQuery({ projectId });
  const reportedPlants = useMemo(() => listReportedPlantsResponse.data?.sites ?? [], [listReportedPlantsResponse]);

  const projectTotalSpecies = useMemo(() => {
    const allSpeciesIds = new Set();
    for (const site of reportedPlants) {
      for (const species of site.species) {
        allSpeciesIds.add(species.id);
      }
    }
    return allSpeciesIds.size;
  }, [reportedPlants]);

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

  const { labels, values, rareSpecies } = useMemo(() => {
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
    } = processConservationCategories(categoryTotals, totalRare, projectTotalSpecies, strings.OTHER);

    return {
      rareSpecies: rareSpeciesPercentage,
      labels: processedLabels,
      values: processedValues,
    };
  }, [orgSpecies, projectSpecies, projectTotalSpecies, strings]);

  return <ChartData labels={labels} values={values} rareSpecies={rareSpecies} />;
};

const SiteWithoutStrataCard = ({ plantingSiteId }: { plantingSiteId: number }): JSX.Element | undefined => {
  const { strings } = useLocalization();
  const plantingsResponse = useGetPlantingSiteReportedPlantsQuery(plantingSiteId);
  const speciesPlantings = useMemo(() => plantingsResponse.data?.site?.species ?? [], [plantingsResponse.data?.site]);
  const { species: orgSpecies } = useSpeciesData();

  const { labels, values, rareSpecies } = useMemo(() => {
    const speciesNames: Set<string> = new Set();
    const categoryTotals: Record<string, number> = {};
    let totalRare = 0;

    speciesPlantings.forEach((planting) => {
      const plantingSpecies = orgSpecies.find((species) => planting.id === species.id);
      if (plantingSpecies) {
        const { rare, conservationCategory } = plantingSpecies;

        if (rare) {
          totalRare += 1;
        }

        if (conservationCategory) {
          if (categoryTotals[conservationCategory]) {
            categoryTotals[conservationCategory] += 1;
          } else {
            categoryTotals[conservationCategory] = 1;
          }
        }
      }
    });

    const speciesCount = speciesNames.size;
    const {
      labels: processedLabels,
      values: processedValues,
      rareSpeciesPercentage,
    } = processConservationCategories(categoryTotals, totalRare, speciesCount, strings.OTHER);

    return {
      rareSpecies: rareSpeciesPercentage,
      labels: processedLabels,
      values: processedValues,
    };
  }, [orgSpecies, speciesPlantings, strings]);

  return <ChartData labels={labels} values={values} rareSpecies={rareSpecies} />;
};

const SiteWithStrataCard = ({ plantingSiteId }: { plantingSiteId: number }): JSX.Element => {
  const { strings } = useLocalization();
  const plantingsResponse = useGetPlantingSiteReportedPlantsQuery(plantingSiteId);
  const plantingSiteReportedPlants = useMemo(() => plantingsResponse.data?.site, [plantingsResponse.data?.site]);
  const { species: orgSpecies } = useSpeciesData();

  const totalSpecies = useMemo(() => plantingSiteReportedPlants?.species.length ?? 0, [plantingSiteReportedPlants]);

  const { labels, values, rareSpecies } = useMemo(() => {
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
      } = processConservationCategories(categoryTotals, totalRare, totalSpecies, strings.OTHER);

      return {
        rareSpecies: rareSpeciesPercentage,
        labels: processedLabels,
        values: processedValues,
      };
    }
    return { labels: undefined, values: undefined, rareSpecies: undefined };
  }, [plantingSiteReportedPlants, orgSpecies, totalSpecies, strings]);

  return <ChartData labels={labels} values={values} rareSpecies={rareSpecies} />;
};

type ChartDataProps = {
  labels?: string[];
  values?: number[];
  rareSpecies?: number;
};

const ChartData = ({ labels, values, rareSpecies }: ChartDataProps): JSX.Element | undefined => {
  const { strings } = useLocalization();
  const theme = useTheme();
  const numberFormatter = useNumberFormatter();

  const tooltipRenderer = useCallback(
    (tooltipItem: TooltipItem<keyof ChartTypeRegistry>) => {
      const rawValue = tooltipItem.dataset.data[tooltipItem.dataIndex];
      const numValue = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue?.toString() || '0');
      return `${numberFormatter.format(numValue)}%`;
    },
    [numberFormatter]
  );

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
        {strings.RARE}: {numberFormatter.format(rareSpecies)}%
      </Typography>
    </Box>
  );
};
