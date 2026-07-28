import React, { type JSX, useEffect, useMemo } from 'react';

import { Grid } from '@mui/material';

import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { useOrganization } from 'src/providers';
import { useLazyGetSpeciesSummaryQuery } from 'src/queries/generated/nurserySummaries';
import { useLazyListSpeciesProjectNamesQuery } from 'src/queries/search/speciesProjects';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';
import useSnackbar from 'src/utils/useSnackbar';

interface InventorySummaryProps {
  speciesId: number;
}

export default function InventorySummaryForSpecies(props: InventorySummaryProps): JSX.Element {
  const { speciesId } = props;

  const snackbar = useSnackbar();
  const { isMobile } = useDeviceInfo();
  const { selectedOrganization } = useOrganization();
  const numberFormatter = useNumberFormatter();

  const [getSpeciesSummary, { currentData: speciesSummary, isError: summaryError }] = useLazyGetSpeciesSummaryQuery();
  const [listSpeciesProjectNames, { currentData: speciesProjectNames, isError: speciesProjectNamesError }] =
    useLazyListSpeciesProjectNamesQuery();

  useEffect(() => {
    if (selectedOrganization && speciesId) {
      void getSpeciesSummary(speciesId, true);
      void listSpeciesProjectNames({ organizationId: selectedOrganization.id, speciesId }, true);
    }
  }, [getSpeciesSummary, listSpeciesProjectNames, selectedOrganization, speciesId]);

  const summary = useMemo(() => speciesSummary?.summary, [speciesSummary?.summary]);

  useEffect(() => {
    if (summaryError || speciesProjectNamesError) {
      snackbar.toastError();
    }
  }, [summaryError, snackbar, speciesProjectNamesError]);

  const getData = () => {
    if (!summary) {
      return [];
    }

    const {
      germinatingQuantity,
      activeGrowthQuantity,
      hardeningOffQuantity,
      readyQuantity,
      totalQuantity,
      nurseries,
      lossRate,
      totalWithdrawn,
    } = summary;

    const topRowColumns = isMobile ? 12 : 3;

    const showProjectsOverviewCard = !!speciesProjectNames?.length;
    const bottomRowColumns = isMobile ? 12 : showProjectsOverviewCard ? 3 : 4;

    return [
      {
        label: strings.GERMINATION_ESTABLISHMENT_QUANTITY,
        value: numberFormatter.format(germinatingQuantity),
        tooltipTitle: strings.TOOLTIP_GERMINATION_ESTABLISHMENT_QUANTITY,
        gridColumns: topRowColumns,
      },
      {
        label: strings.ACTIVE_GROWTH_QUANTITY,
        value: numberFormatter.format(activeGrowthQuantity),
        tooltipTitle: strings.TOOLTIP_ACTIVE_GROWTH_QUANTITY,
        gridColumns: topRowColumns,
      },
      {
        label: strings.HARDENING_OFF_QUANTITY,
        value: numberFormatter.format(hardeningOffQuantity),
        tooltipTitle: strings.TOOLTIP_HARDENING_OFF_QUANTITY,
        gridColumns: topRowColumns,
      },
      {
        label: strings.READY_TO_PLANT_QUANTITY,
        value: numberFormatter.format(readyQuantity),
        tooltipTitle: strings.TOOLTIP_READY_TO_PLANT_QUANTITY,
        gridColumns: topRowColumns,
      },
      {
        label: strings.TOTAL_QUANTITY,
        value: numberFormatter.format(totalQuantity),
        tooltipTitle: strings.TOOLTIP_TOTAL_QUANTITY,
        gridColumns: topRowColumns,
      },
      {
        label: strings.TOTAL_WITHDRAWN,
        value: numberFormatter.format(totalWithdrawn),
        tooltipTitle: strings.TOOLTIP_TOTAL_WITHDRAWN,
        gridColumns: bottomRowColumns,
      },
      {
        label: strings.LOSS_RATE,
        value: `${numberFormatter.format(lossRate || 0)}%`,
        tooltipTitle: '',
        gridColumns: bottomRowColumns,
      },
      {
        label: strings.NURSERIES,
        value: nurseries.map((i) => i.name).join(', '),
        tooltipTitle: '',
        gridColumns: bottomRowColumns,
      },
      ...(showProjectsOverviewCard
        ? [
            {
              label: strings.PROJECTS,
              value: (speciesProjectNames ?? []).join(', '),
              gridColumns: bottomRowColumns,
            },
          ]
        : []),
    ];
  };

  return (
    <Grid container spacing={3}>
      {getData().map((datum) => (
        <Grid key={datum.label} item xs={datum.gridColumns}>
          <OverviewItemCard
            isEditable={false}
            title={datum.label}
            titleInfoTooltip={datum.tooltipTitle}
            contents={datum.value}
          />
        </Grid>
      ))}
    </Grid>
  );
}
