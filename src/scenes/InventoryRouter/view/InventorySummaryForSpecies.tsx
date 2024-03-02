import { useCallback, useEffect, useState } from 'react';

import { Grid } from '@mui/material';
import _ from 'lodash';

import OverviewItemCard from 'src/components/common/OverviewItemCard';
import isEnabled from 'src/features';
import { useOrganization } from 'src/providers';
import { selectSpeciesProjects } from 'src/redux/features/species/speciesProjectsSelectors';
import { requestSpeciesProjects } from 'src/redux/features/species/speciesProjectsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { NurseryInventoryService } from 'src/services';
import strings from 'src/strings';
import { SpeciesInventorySummary } from 'src/types/Inventory';
import useDeviceInfo from 'src/utils/useDeviceInfo';
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
  const featureFlagProjects = isEnabled('Projects');

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

    if (speciesId !== undefined) {
      void populateSummary();
      if (featureFlagProjects) {
        void dispatch(requestSpeciesProjects(selectedOrganization.id, speciesId));
      }
    } else {
      setSummary(undefined);
    }
  }, [speciesId, summary, snackbar, featureFlagProjects, dispatch, selectedOrganization.id]);

  useEffect(() => {
    reloadData();
  }, [speciesId, reloadData, modified]);

  const getData = () => {
    if (!summary) {
      return [];
    }
    const { germinatingQuantity, notReadyQuantity, readyQuantity, totalQuantity, nurseries, lossRate, totalWithdrawn } =
      summary;

    const topRowColumns = isMobile ? 12 : 3;

    const showProjectsOverviewCard = !!(featureFlagProjects && speciesProjects);
    const bottomRowColumns = isMobile ? 12 : showProjectsOverviewCard ? 3 : 4;

    return [
      {
        label: strings.GERMINATING_QUANTITY,
        value: germinatingQuantity.toString(),
        tooltipTitle: strings.TOOLTIP_GERMINATING_QUANTITY,
        gridColumns: topRowColumns,
      },
      {
        label: strings.NOT_READY_QUANTITY,
        value: notReadyQuantity.toString(),
        tooltipTitle: strings.TOOLTIP_NOT_READY_QUANTITY,
        gridColumns: topRowColumns,
      },
      {
        label: strings.READY_QUANTITY,
        value: readyQuantity.toString(),
        tooltipTitle: strings.TOOLTIP_READY_QUANTITY,
        gridColumns: topRowColumns,
      },
      {
        label: strings.TOTAL_QUANTITY,
        value: totalQuantity.toString(),
        tooltipTitle: strings.TOOLTIP_TOTAL_QUANTITY,
        gridColumns: topRowColumns,
      },
      {
        label: strings.TOTAL_WITHDRAWN,
        value: totalWithdrawn.toString(),
        tooltipTitle: strings.TOOLTIP_TOTAL_WITHDRAWN,
        gridColumns: bottomRowColumns,
      },
      {
        label: strings.LOSS_RATE,
        value: `${lossRate || 0}%`,
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
