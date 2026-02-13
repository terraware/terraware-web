import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { Grid } from '@mui/material';

import OverviewItemCard from 'src/components/common/OverviewItemCard';
import TextTruncated from 'src/components/common/TextTruncated';
import NurserySummaryService, {
  NurserySummaryPayload,
  NurserySummarySpecies,
} from 'src/services/NurserySummaryService';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';
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
  const numberFormatter = useNumberFormatter();

  const [summary, setSummary] = useState<NurserySummaryPayload | undefined>();

  useEffect(() => {
    const reloadData = async () => {
      const summaryResponse = await NurserySummaryService.getNurserySummary(nurseryId);
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
      activeGrowthQuantity,
      hardeningOffQuantity,
      readyQuantity,
      totalQuantity,
      germinationRate,
      lossRate,
      totalWithdrawn,
      species,
    } = summary;

    return [
      {
        label: strings.GERMINATION_ESTABLISHMENT_QUANTITY,
        value: numberFormatter.format(germinatingQuantity || 0),
        tooltipTitle: strings.TOOLTIP_GERMINATION_ESTABLISHMENT_QUANTITY,
        gridColumns,
      },
      {
        label: strings.ACTIVE_GROWTH_QUANTITY,
        value: numberFormatter.format(activeGrowthQuantity),
        tooltipTitle: strings.TOOLTIP_ACTIVE_GROWTH_QUANTITY,
        gridColumns,
      },
      {
        label: strings.HARDENING_OFF_QUANTITY,
        value: numberFormatter.format(hardeningOffQuantity),
        tooltipTitle: strings.TOOLTIP_HARDENING_OFF_QUANTITY,
        gridColumns,
      },
      {
        label: strings.READY_TO_PLANT_QUANTITY,
        value: numberFormatter.format(readyQuantity),
        tooltipTitle: strings.TOOLTIP_READY_TO_PLANT_QUANTITY,
        gridColumns,
      },
      {
        label: strings.TOTAL_QUANTITY,
        value: numberFormatter.format(totalQuantity),
        tooltipTitle: strings.TOOLTIP_TOTAL_QUANTITY,
        gridColumns,
      },
      {
        label: strings.GERMINATION_ESTABLISHMENT_RATE,
        value: `${numberFormatter.format(germinationRate || 0)}%`,
        tooltipTitle: '',
        gridColumns,
      },
      {
        label: strings.LOSS_RATE,
        value: `${numberFormatter.format(lossRate || 0)}%`,
        tooltipTitle: '',
        gridColumns,
      },
      {
        label: strings.TOTAL_WITHDRAWN,
        value: numberFormatter.format(totalWithdrawn),
        tooltipTitle: strings.TOOLTIP_TOTAL_WITHDRAWN,
        gridColumns,
      },
      {
        label: strings.SPECIES,
        valueComponent: (
          <TextTruncated
            stringList={(species || []).map((s: NurserySummarySpecies) => s.scientificName)}
            width={350}
            fontSize={16}
            moreText={strings.TRUNCATED_TEXT_MORE_LINK}
          />
        ),
        tooltipTitle: '',
        gridColumns,
      },
    ];
  }, [isMobile, numberFormatter, summary]);

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
