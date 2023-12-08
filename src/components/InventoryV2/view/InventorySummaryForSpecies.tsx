import { useCallback, useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { SpeciesInventorySummary } from 'src/types/Inventory';
import { NurseryInventoryService } from 'src/services';
import useSnackbar from 'src/utils/useSnackbar';
import _ from 'lodash';
import OverviewItemCard from '../../common/OverviewItemCard';

interface InventorySummaryProps {
  speciesId: number;
  modified: number;
}

export default function InventorySummaryForSpecies(props: InventorySummaryProps): JSX.Element {
  const { speciesId, modified } = props;
  const [summary, setSummary] = useState<SpeciesInventorySummary>();
  const snackbar = useSnackbar();
  const { isMobile } = useDeviceInfo();

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
      populateSummary();
    } else {
      setSummary(undefined);
    }
  }, [speciesId, summary, snackbar]);

  useEffect(() => {
    reloadData();
  }, [speciesId, reloadData, modified]);

  const getData = () => {
    if (!summary) {
      return [];
    }
    const { germinatingQuantity, notReadyQuantity, readyQuantity, totalQuantity, nurseries, lossRate, totalWithdrawn } =
      summary;

    return [
      {
        label: strings.GERMINATING_QUANTITY,
        value: germinatingQuantity.toString(),
        tooltipTitle: strings.TOOLTIP_GERMINATING_QUANTITY,
        gridColumns: isMobile ? 12 : 3,
      },
      {
        label: strings.NOT_READY_QUANTITY,
        value: notReadyQuantity.toString(),
        tooltipTitle: strings.TOOLTIP_NOT_READY_QUANTITY,
        gridColumns: isMobile ? 12 : 3,
      },
      {
        label: strings.READY_QUANTITY,
        value: readyQuantity.toString(),
        tooltipTitle: strings.TOOLTIP_READY_QUANTITY,
        gridColumns: isMobile ? 12 : 3,
      },
      {
        label: strings.TOTAL_QUANTITY,
        value: totalQuantity.toString(),
        tooltipTitle: strings.TOOLTIP_TOTAL_QUANTITY,
        gridColumns: isMobile ? 12 : 3,
      },
      {
        label: strings.TOTAL_WITHDRAWN,
        value: totalWithdrawn.toString(),
        tooltipTitle: strings.TOOLTIP_TOTAL_WITHDRAWN,
        gridColumns: isMobile ? 12 : 4,
      },
      {
        label: strings.LOSS_RATE,
        value: `${lossRate || 0}%`,
        tooltipTitle: '',
        gridColumns: isMobile ? 12 : 4,
      },
      {
        label: strings.NURSERIES,
        value: nurseries.map((i) => i.name).join(', '),
        tooltipTitle: '',
        gridColumns: isMobile ? 12 : 4,
      },
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
