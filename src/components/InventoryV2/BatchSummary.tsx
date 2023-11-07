import { Grid, useTheme } from '@mui/material';
import strings from 'src/strings';
import { Batch } from 'src/types/Batch';
import OverviewItemCard from '../common/OverviewItemCard';
import { SubLocationService } from 'src/services';
import { useEffect, useState } from 'react';

interface BatchSummaryProps {
  batch: Batch;
}

export default function BatchSummary(props: BatchSummaryProps): JSX.Element {
  const { batch } = props;
  const theme = useTheme();
  const [batchSubLocations, setBatchSubLocations] = useState<string[]>([]);

  useEffect(() => {
    const setLocations = async () => {
      if (batch?.facilityId) {
        const response = await SubLocationService.getSubLocations(Number(batch.facilityId));
        if (response.requestSucceeded) {
          const nurserySLs: string[] = [];
          batch.subLocationIds.forEach((subLocId) => {
            const found = response.subLocations.find((iSublocation) => iSublocation.id === subLocId);
            if (found) {
              nurserySLs.push(found.name);
            }
          });
          setBatchSubLocations(nurserySLs);
        }
      }
    };
    setLocations();
  }, [batch]);

  return (
    <Grid container spacing={3} marginBottom={theme.spacing(4)}>
      <Grid item xs={2}>
        <OverviewItemCard isEditable={false} title={strings.SUB_LOCATION} contents={batchSubLocations.join(',')} />
      </Grid>
      <Grid item xs={2}>
        <OverviewItemCard isEditable={false} title={strings.GERMINATION_RATE} contents={batch.germinationRate || '%'} />
      </Grid>
      <Grid item xs={2}>
        <OverviewItemCard isEditable={false} title={strings.LOSS_RATE} contents={batch.lossRate || '%'} />
      </Grid>
      <Grid item xs={2}>
        <OverviewItemCard isEditable={false} title={strings.TOTAL_WITHDRAWN} contents={batch.totalWithdrawn} />
      </Grid>
      <Grid item xs={2}>
        <OverviewItemCard isEditable={false} title={strings.ACCESSION_ID} contents={batch.accessionId || ''} />
      </Grid>
      <Grid item xs={2}>
        <OverviewItemCard isEditable={false} title={strings.DATE_ADDED} contents={batch.addedDate} />
      </Grid>
    </Grid>
  );
}
