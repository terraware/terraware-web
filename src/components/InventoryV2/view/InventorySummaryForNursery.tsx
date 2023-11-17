import { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useSnackbar from 'src/utils/useSnackbar';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import NurseryFacilitiesService, {
  NurserySummaryPayload,
  NurserySummarySpecies,
} from 'src/services/NurseryFacilitiesService';

type InventorySummaryForNurseryProps = {
  nurseryId: number;
  modified: number;
};

export default function InventorySummaryForNursery({ nurseryId }: InventorySummaryForNurseryProps): JSX.Element {
  const [summary, setSummary] = useState<NurserySummaryPayload | undefined>();
  const snackbar = useSnackbar();
  const { isMobile } = useDeviceInfo();

  useEffect(() => {
    const reloadData = async () => {
      const summaryResponse = await NurseryFacilitiesService.getNurserySummary(nurseryId);
      if (!summaryResponse || !summaryResponse.requestSucceeded) {
        snackbar.toastError();
        return;
      }

      setSummary(summaryResponse);
    };

    void reloadData();
  }, [nurseryId, snackbar]);

  const getData = () => {
    if (!summary) {
      return [];
    }

    const gridColumns = isMobile ? 12 : 3;

    const {
      germinatingQuantity,
      notReadyQuantity,
      readyQuantity,
      totalQuantity,
      germinationRate,
      lossRate,
      totalWithdrawn,
      species,
    } = summary;

    return [
      {
        label: strings.GERMINATING_QUANTITY,
        value: germinatingQuantity || 0,
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
        value: `${germinationRate || 0}%`,
        tooltipTitle: '',
        gridColumns,
      },
      {
        label: strings.LOSS_RATE,
        value: `${lossRate || 0}%`,
        tooltipTitle: '',
        gridColumns,
      },
      {
        label: strings.TOTAL_WITHDRAWN,
        value: totalWithdrawn,
        tooltipTitle: strings.TOOLTIP_TOTAL_WITHDRAWN,
        gridColumns,
      },
      {
        label: strings.SPECIES,
        value: (species || []).map((s: NurserySummarySpecies) => s.scientificName).join(', '),
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
