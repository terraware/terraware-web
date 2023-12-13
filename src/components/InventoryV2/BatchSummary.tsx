import React, { useCallback, useState } from 'react';
import { Grid, useTheme } from '@mui/material';
import strings from 'src/strings';
import { Batch } from 'src/types/Batch';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { useSubLocations } from 'src/components/InventoryV2/form/useSubLocations';
import SubLocationsDropdown from 'src/components/InventoryV2/form/SubLocationsDropdown';

interface BatchSummaryProps {
  batch: Batch;
}

export default function BatchSummary(props: BatchSummaryProps): JSX.Element {
  const theme = useTheme();

  const [batch, setBatch] = useState<Batch>(props.batch);
  const { availableSubLocations, selectedSubLocations } = useSubLocations(batch.facilityId, batch);

  const [showSubLocationEdit, setShowSubLocationEdit] = useState<boolean>(false);

  const handleSubLocationEdit = useCallback(() => {
    setShowSubLocationEdit(!showSubLocationEdit);
  }, [showSubLocationEdit]);

  const handleUpdateSubLocations = useCallback(
    (setFn: (previousBatch: Batch) => Batch) => {
      const nextBatch = setFn(batch);
      setBatch(nextBatch);
    },
    [batch]
  );

  return (
    <Grid container spacing={3} marginBottom={theme.spacing(4)}>
      <Grid item xs={2}>
        <OverviewItemCard
          title={strings.SUB_LOCATION}
          contents={
            showSubLocationEdit ? (
              <SubLocationsDropdown<Batch>
                availableSubLocations={availableSubLocations}
                record={batch}
                setRecord={handleUpdateSubLocations}
                minimal
              />
            ) : (
              (selectedSubLocations || []).map((subLocation) => subLocation.name).join(', ')
            )
          }
          isEditable
          handleEdit={handleSubLocationEdit}
        />
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
