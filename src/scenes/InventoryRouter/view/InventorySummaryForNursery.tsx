import { useEffect, useMemo, useState } from 'react';

import { Grid } from '@mui/material';

import OverviewItemCard from 'src/components/common/OverviewItemCard';
import TextTruncated from 'src/components/common/TextTruncated';
import NurseryFacilitiesService, {
  NurserySummaryPayload,
  NurserySummarySpecies,
} from 'src/services/NurseryFacilitiesService';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useSnackbar from 'src/utils/useSnackbar';

type InventorySummaryForNurseryProps = {
  nurseryId: number;
  modified: number;
};

export default function InventorySummaryForNursery({
  nurseryId,
  modified,
}: InventorySummaryForNurseryProps): JSX.Element {
  const snackbar = useSnackbar();
  const { isMobile } = useDeviceInfo();

  const [summary, setSummary] = useState<NurserySummaryPayload | undefined>();

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
  }, [nurseryId, snackbar, modified]);

  const cards = useMemo(() => {
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
        valueComponent: (
          <TextTruncated
            stringList={(species || []).map((s: NurserySummarySpecies) => s.scientificName)}
            columnWidth={350}
            fontSize={16}
          />
        ),
        tooltipTitle: '',
        gridColumns,
      },
    ];
  }, [isMobile, summary]);

  return (
    <Grid container spacing={3}>
      {cards.map((card) => (
        <Grid key={card.label} item xs={card.gridColumns}>
          <OverviewItemCard
            isEditable={false}
            title={card.label}
            titleInfoTooltip={card.tooltipTitle}
            contents={card.valueComponent ?? `${card.value}`}
          />
        </Grid>
      ))}
    </Grid>
  );
}
