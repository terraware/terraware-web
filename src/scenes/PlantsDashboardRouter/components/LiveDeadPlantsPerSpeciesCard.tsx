import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, useTheme } from '@mui/material';
import { Dropdown } from '@terraware/web-components';
import { ChartTypeRegistry, TooltipItem } from 'chart.js';

import PieChart from 'src/components/common/Chart/PieChart';
import { useLatestSiteObservationResult } from 'src/hooks/observations';
import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import { useLocalization } from 'src/providers';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

type LiveDeadPlantsPerSpeciesCardProps = {
  plantingSiteId: number;
  organizationId?: number;
};

export default function LiveDeadPlantsPerSpeciesCard({
  plantingSiteId,
  organizationId,
}: LiveDeadPlantsPerSpeciesCardProps): JSX.Element {
  const [selectedSpecies, setSelectedSpecies] = useState<string>();
  const { species: availableSpecies } = useOrganizationSpecies({ organizationId });
  const [allSpecies, setAllSpecies] = useState<
    {
      label: string;
      value: string;
    }[]
  >();
  const theme = useTheme();

  const { observation: latestObservationResult } = useLatestSiteObservationResult(plantingSiteId, 'Substratum');
  const { strings, activeLocale } = useLocalization();
  const numberFormatter = useNumberFormatter();

  const LIVE_DEAD_LABELS = useMemo(() => {
    return [strings.LIVE, strings.DEAD];
  }, [strings]);

  useEffect(() => {
    if (latestObservationResult) {
      const filterFn = (sp: any) => sp.survivalRate !== undefined && sp.survivalRate !== null;

      const speciesNames = latestObservationResult.species
        .filter(filterFn)
        .map((sp) => ({
          label:
            availableSpecies.find((availableS) => availableS.id === sp.speciesId)?.scientificName ||
            sp.speciesName ||
            '',
          value: sp.speciesId?.toString() || '',
        }))
        .sort((a, b) => a.label.localeCompare(b.label, activeLocale || undefined));

      setAllSpecies(speciesNames);
      if (speciesNames.length > 0) {
        setSelectedSpecies(speciesNames[0].value);
      }
    }
  }, [latestObservationResult, availableSpecies, activeLocale]);

  const values = useMemo<number[] | undefined>(() => {
    if (selectedSpecies) {
      const selectedObservationSpecies = latestObservationResult?.species.find(
        (sp) => sp.speciesId?.toString() === selectedSpecies
      );

      if (selectedObservationSpecies) {
        if (selectedObservationSpecies.survivalRate !== undefined && selectedObservationSpecies.survivalRate !== null) {
          const live = selectedObservationSpecies.survivalRate;
          const dead = live < 100 ? 100 - live : 0;
          return [live, dead];
        }
      }
      return undefined;
    } else {
      return [];
    }
  }, [selectedSpecies, latestObservationResult]);

  const tooltipRenderer = useCallback(
    (tooltipItem: TooltipItem<keyof ChartTypeRegistry>) => {
      const rawValue = tooltipItem.dataset.data[tooltipItem.dataIndex];
      const numValue = typeof rawValue === 'number' ? rawValue : parseFloat(String(rawValue) || '0');
      return `${numberFormatter.format(numValue)}%`;
    },
    [numberFormatter]
  );

  const allSpeciesNoValues = useMemo(() => {
    return latestObservationResult?.species.every((sp) => {
      return !sp.survivalRate;
    });
  }, [latestObservationResult]);

  return (
    <Box display='flex' flexDirection='column'>
      <Dropdown
        onChange={(newValue) => setSelectedSpecies(newValue)}
        label=''
        options={allSpecies}
        selectedValue={selectedSpecies}
        fullWidth={true}
        selectStyles={{
          inputContainer: {
            maxWidth: '228px',
          },
        }}
        disabled={!allSpecies || allSpecies.length === 0 || allSpeciesNoValues}
        placeholder={strings.SELECT}
      />
      <Box>
        <PieChart
          chartId='liveDeadplantsBySpecies'
          chartData={{
            labels: LIVE_DEAD_LABELS ?? [],
            datasets: [
              {
                values: values ?? [],
              },
            ],
          }}
          maxWidth='100%'
          elementColor={['#99B85F', '#CE9E97']}
          customTooltipLabel={tooltipRenderer}
          pluginsOptions={{
            emptyDoughnut: {
              color: theme.palette.TwClrBaseGray050,
            },
            legend: {
              labels: {
                generateLabels: (chart: any) => {
                  const colors = ['#99B85F', '#CE9E97'];
                  const chartLabels = chart.data.labels || [];
                  return chartLabels.map((label: string, i: number) => ({
                    text: label,
                    fillStyle: colors[i],
                    strokeStyle: colors[i],
                    hidden: false,
                    datasetIndex: 0,
                    index: i,
                  }));
                },
              },
            },
          }}
        />
      </Box>
    </Box>
  );
}
