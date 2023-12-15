import React from 'react';
import { Grid, useTheme } from '@mui/material';
import strings from 'src/strings';
import { Batch } from 'src/types/Batch';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import OverviewItemCardSubLocations from './view/OverviewItemCardSubLocations';

interface BatchSummaryProps {
  batch: Batch;
}

export default function BatchSummary(props: BatchSummaryProps): JSX.Element {
  const { batch } = props;

  const theme = useTheme();

  return (
    <Grid container spacing={3} marginBottom={theme.spacing(4)}>
      <Grid item xs={2}>
        <OverviewItemCardSubLocations batch={batch} />
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
        <OverviewItemCard
          isEditable={false}
          title={strings.ACCESSION_ID}
          contents={
            batch.accessionId ? (
              <Link to={APP_PATHS.ACCESSIONS2_ITEM.replace(':accessionId', `${batch.accessionId}`)}>
                {batch.accessionNumber || ''}
              </Link>
            ) : null
          }
        />
      </Grid>
      <Grid item xs={2}>
        <OverviewItemCard isEditable={false} title={strings.DATE_ADDED} contents={batch.addedDate} />
      </Grid>
    </Grid>
  );
}
