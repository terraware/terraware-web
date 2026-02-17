import React, { type JSX, useCallback, useEffect, useState } from 'react';

import { Grid } from '@mui/material';
import _ from 'lodash';

import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { useOrganization } from 'src/providers';
import { selectSpeciesProjects } from 'src/redux/features/species/speciesProjectsSelectors';
import { requestSpeciesProjects } from 'src/redux/features/species/speciesProjectsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { NurseryInventoryService } from 'src/services';
import strings from 'src/strings';
import { SpeciesInventorySummary } from 'src/types/Inventory';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';
import useSnackbar from 'src/utils/useSnackbar';

interface InventorySummaryProps {
  speciesId: number;
  modified: number;
}

export default function InventorySummaryForSpecies(props: InventorySummaryProps): JSX.Element {
  const { speciesId, modified } = props;

  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const { isMobile } = useDeviceInfo();
  const { selectedOrganization } = useOrganization();
  const numberFormatter = useNumberFormatter();

  const speciesProjects = useAppSelector(selectSpeciesProjects(speciesId));
  const [summary, setSummary] = useState<SpeciesInventorySummary>();

  const reloadData = useCallback(() => {
    const populateSummary = async () => {
      const response = await NurseryInventoryService.getSummary(speciesId);
      if (response.requestSucceeded === false) {
        snackbar.toastError();
      } else if (!_.isEqual(response.summary, summary)) {
        setSummary(response.summary || undefined);
      }
    };

    if (speciesId !== undefined && selectedOrganization) {
      void populateSummary();
      void dispatch(requestSpeciesProjects(selectedOrganization?.id, speciesId));
    } else {
      setSummary(undefined);
    }
  }, [speciesId, summary, snackbar, dispatch, selectedOrganization]);

  useEffect(() => {
    reloadData();
  }, [speciesId, reloadData, modified]);

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

    const showProjectsOverviewCard = !!speciesProjects;
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
              value: speciesProjects.map((project) => project.project_name).join(', '),
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
