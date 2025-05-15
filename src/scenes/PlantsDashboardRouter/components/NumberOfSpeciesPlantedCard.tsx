import React, { useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon, Tooltip } from '@terraware/web-components';

import BarChart from 'src/components/common/Chart/BarChart';
import FormattedNumber from 'src/components/common/FormattedNumber';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { useUser } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { selectPlantingsForSite } from 'src/redux/features/plantings/plantingsSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

type NumberOfSpeciesPlantedCardProps = {
  newVersion?: boolean;
};

export default function NumberOfSpeciesPlantedCard({
  newVersion,
}: NumberOfSpeciesPlantedCardProps): JSX.Element | undefined {
  const { plantingSite } = usePlantingSiteData();

  if (!plantingSite) {
    return undefined;
  } else if (!plantingSite.plantingZones?.length) {
    return <SiteWithoutZonesCard plantingSiteId={plantingSite.id} newVersion={newVersion} />;
  } else {
    return <SiteWithZonesCard newVersion={newVersion} />;
  }
}

const SiteWithoutZonesCard = ({
  plantingSiteId,
  newVersion,
}: NumberOfSpeciesPlantedCardProps & { plantingSiteId: number }): JSX.Element | undefined => {
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

  return <ChartData labels={labels} values={values} totalSpecies={totalSpecies} newVersion={newVersion} />;
};

const SiteWithZonesCard = ({ newVersion }: NumberOfSpeciesPlantedCardProps): JSX.Element => {
  const { plantingSiteReportedPlants } = usePlantingSiteData();
  const { species: orgSpecies } = useSpeciesData();

  const totalSpecies = useMemo(() => plantingSiteReportedPlants?.species.length ?? 0, [plantingSiteReportedPlants]);
  const labels = [strings.RARE, strings.ENDANGERED, strings.OTHER];

  const values = useMemo(() => {
    if (plantingSiteReportedPlants?.species && orgSpecies) {
      const speciesByCategory: Record<string, number> = {
        [strings.RARE]: 0,
        [strings.ENDANGERED]: 0,
        [strings.OTHER]: 0,
      };
      plantingSiteReportedPlants.species.forEach((reportedSpecies) => {
        const species = orgSpecies.find((s) => s.id === reportedSpecies.id);
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
      });
      const result = [
        speciesByCategory[strings.RARE],
        speciesByCategory[strings.ENDANGERED],
        speciesByCategory[strings.OTHER],
      ];
      return result.map((value) => (totalSpecies > 0 ? Number(((value * 100) / totalSpecies).toFixed(2)) : 0));
    } else {
      return [];
    }
  }, [plantingSiteReportedPlants, orgSpecies, totalSpecies]);

  return <ChartData labels={labels} values={values} totalSpecies={totalSpecies} newVersion={newVersion} />;
};

type ChartDataProps = {
  labels?: string[];
  values?: number[];
  totalSpecies?: number;
  newVersion?: boolean;
};

const ChartData = ({ labels, values, totalSpecies, newVersion }: ChartDataProps): JSX.Element | undefined => {
  const theme = useTheme();
  const user = useUser().user;
  const numberFormatter = useNumberFormatter(user?.locale);

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

  const barAnnotations = useMemo(() => {
    if (!values || !labels) {
      return undefined;
    }

    const annotations: any[] = [];
    values?.forEach((v, index) => {
      annotations.push({
        type: 'label',
        content: [`${numberFormatter.format(v)}%`],
        position: {
          x: 'center',
          y: v > 75 ? 'center' : 'end',
        },
        xValue: labels[index],
        yValue: v > 75 ? v / 2 : v,
      });
    });

    return { annotations };
  }, [values, labels, numberFormatter]);

  if (!chartData) {
    return undefined;
  }

  return newVersion ? (
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

      <Box height={'220px'} marginTop={6}>
        <BarChart
          chartId='speciesByCategory'
          chartData={chartData}
          maxWidth='100%'
          minHeight='100px'
          barAnnotations={barAnnotations}
          yLimits={{ min: 0, max: 100 }}
          yStepSize={20}
        />
      </Box>
    </Box>
  ) : (
    <OverviewItemCard
      isEditable={false}
      contents={
        <Box display='flex' flexDirection='column'>
          <Typography fontSize='16px' fontWeight={600} marginBottom={theme.spacing(3)}>
            {strings.NUMBER_OF_SPECIES_PLANTED_CARD_TITLE}
          </Typography>
          <Box display='flex' alignItems='flex-end' flexWrap='wrap' marginBottom={theme.spacing(3)}>
            <Typography fontSize='48px' fontWeight={600} lineHeight={1}>
              {totalSpecies !== undefined && <FormattedNumber value={totalSpecies} />}
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
              barAnnotations={barAnnotations}
              yLimits={{ min: 0, max: 100 }}
            />
          </Box>
        </Box>
      }
    />
  );
};
