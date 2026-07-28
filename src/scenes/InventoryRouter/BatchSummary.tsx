import React, { type JSX, useCallback } from 'react';

import { Grid, useTheme } from '@mui/material';

import ProjectOverviewItemCard from 'src/components/ProjectOverviewItemCard';
import Link from 'src/components/common/Link';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { APP_PATHS } from 'src/constants';
import { useUpdateBatchMutation } from 'src/queries/generated/nurseryBatches';
import OverviewItemCardSubLocations from 'src/scenes/InventoryRouter/view/OverviewItemCardSubLocations';
import strings from 'src/strings';
import { Batch } from 'src/types/Batch';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';
import useSnackbar from 'src/utils/useSnackbar';

interface BatchSummaryProps {
  batch: Batch;
}

export default function BatchSummary(props: BatchSummaryProps): JSX.Element {
  const { batch } = props;
  const { isMobile, isTablet } = useDeviceInfo();
  const snackbar = useSnackbar();
  const theme = useTheme();
  const numberFormatter = useNumberFormatter();
  const [updateBatch] = useUpdateBatchMutation();

  const onProjectUnAssign = useCallback(async () => {
    try {
      await updateBatch({
        id: batch.id,
        updateBatchRequestPayload: { ...batch, projectId: undefined },
      }).unwrap();
    } catch {
      snackbar.toastError();
    }
  }, [batch, snackbar, updateBatch]);

  const overviewItemCount = 7;
  const overviewGridSize = isMobile ? '100%' : isTablet ? '50%' : overviewItemCount <= 6 ? '33%' : '25%';

  return (
    <Grid container spacing={3} marginBottom={theme.spacing(4)}>
      <Grid item flexBasis={overviewGridSize} flexGrow={1}>
        <OverviewItemCardSubLocations batch={batch} />
      </Grid>
      <Grid item flexBasis={overviewGridSize} flexGrow={1}>
        <OverviewItemCard
          isEditable={false}
          title={strings.GERMINATION_ESTABLISHMENT_RATE}
          contents={batch.germinationRate ? numberFormatter.format(batch.germinationRate) : '%'}
        />
      </Grid>
      <Grid item flexBasis={overviewGridSize} flexGrow={1}>
        <OverviewItemCard
          isEditable={false}
          title={strings.LOSS_RATE}
          contents={batch.lossRate ? numberFormatter.format(batch.lossRate) : '%'}
        />
      </Grid>
      <Grid item flexBasis={overviewGridSize} flexGrow={1}>
        <OverviewItemCard
          isEditable={false}
          title={strings.TOTAL_WITHDRAWN}
          contents={numberFormatter.format(batch.totalWithdrawn)}
        />
      </Grid>
      <Grid item flexBasis={overviewGridSize} flexGrow={1}>
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
      <Grid item flexBasis={overviewGridSize} flexGrow={1}>
        <OverviewItemCard isEditable={false} title={strings.DATE_ADDED} contents={batch.addedDate} />
      </Grid>

      {batch && (
        <Grid item flexBasis={overviewGridSize} flexGrow={1}>
          <ProjectOverviewItemCard<Batch>
            entity={batch}
            projectAssignPayloadCreator={() => ({ batchIds: [batch.id] })}
            onUnAssign={() => void onProjectUnAssign()}
          />
        </Grid>
      )}
    </Grid>
  );
}
