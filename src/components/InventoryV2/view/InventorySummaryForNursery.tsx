import { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useSnackbar from 'src/utils/useSnackbar';
import OverviewItemCard from '../../common/OverviewItemCard';
import { SearchResponseElement } from '../../../types/Search';
import { Species } from 'src/types/Species';
import NurseryInventoryService from '../../../services/NurseryInventoryService';

type InventorySummaryForNurseryProps = {
  organizationId: number;
  nurseryId: number;
  modified: number;
};

export default function InventorySummaryForNursery({
  organizationId,
  nurseryId,
}: InventorySummaryForNurseryProps): JSX.Element {
  const [summary, setSummary] = useState<SearchResponseElement | null>();
  const snackbar = useSnackbar();
  const { isMobile } = useDeviceInfo();

  useEffect(() => {
    const reloadData = async () => {
      const results = await NurseryInventoryService.getSummaryForNursery(organizationId, nurseryId);
      if (!results) {
        snackbar.toastError();
        return;
      }

      setSummary(results[0]);
    };

    void reloadData();
  }, []);

  const getData = () => {
    if (!summary) {
      return [];
    }

    const gridColumns = isMobile ? 12 : 3;

    const { germinatingQuantity, notReadyQuantity, readyQuantity, totalQuantity } = summary;

    /// These are going to come from a new API coming soon
    const germinationRate = 0;
    const lossRate = 0;
    const totalWithdrawn = 0;
    const species: Species[] = [];

    return [
      {
        label: strings.GERMINATING_QUANTITY,
        value: germinatingQuantity,
        tooltipTitle: strings.TOOLTIP_GERMINATING_QUANTITY,
        gridColumns,
      },
      {
        label: strings.NOT_READY_QUANTITY,
        value: notReadyQuantity,
        tooltipTitle: strings.TOOLTIP_NOT_READY_QUANTITY,
        gridColumns,
      },
      {
        label: strings.READY_QUANTITY,
        value: readyQuantity,
        tooltipTitle: strings.TOOLTIP_READY_QUANTITY,
        gridColumns,
      },
      {
        label: strings.TOTAL_QUANTITY,
        value: totalQuantity,
        tooltipTitle: strings.TOOLTIP_TOTAL_QUANTITY,
        gridColumns,
      },
      {
        label: strings.GERMINATION_RATE,
        value: germinationRate,
        tooltipTitle: '',
        gridColumns,
      },
      {
        label: strings.LOSS_RATE,
        value: `${lossRate}%`,
        tooltipTitle: '',
        gridColumns,
      },
      {
        label: strings.TOTAL_WITHDRAWN,
        value: totalWithdrawn,
        tooltipTitle: strings.TOOLTIP_TOTAL_QUANTITY,
        gridColumns,
      },
      {
        label: strings.SPECIES,
        value: species.map((s: Species) => s.commonName || s.scientificName).join(', '),
        tooltipTitle: '',
        gridColumns,
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
            contents={`${datum.value}`}
          />
        </Grid>
      ))}
    </Grid>
  );
}
