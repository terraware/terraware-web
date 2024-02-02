import React from 'react';
import { Grid, useTheme } from '@mui/material';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { Batch } from 'src/types/Batch';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import Link from 'src/components/common/Link';
import ProjectOverviewItemCard from 'src/components/ProjectOverviewItemCard';
import OverviewItemCardSubLocations from 'src/scenes/InventoryRouter/view/OverviewItemCardSubLocations';

interface BatchSummaryProps {
  batch: Batch;
  reloadData: () => void;
}

export default function BatchSummary(props: BatchSummaryProps): JSX.Element {
  const { batch, reloadData } = props;
  const { isMobile, isTablet } = useDeviceInfo();
  const featureFlagProjects = isEnabled('Projects');

  const theme = useTheme();

  const overviewItemCount = featureFlagProjects ? 7 : 6;
  const overviewGridSize = isMobile ? '100%' : isTablet ? '50%' : overviewItemCount <= 6 ? '33%' : '25%';

  return (
    <Grid container spacing={3} marginBottom={theme.spacing(4)}>
      <Grid item flexBasis={overviewGridSize} flexGrow={1}>
        <OverviewItemCardSubLocations batch={batch} />
      </Grid>
      <Grid item flexBasis={overviewGridSize} flexGrow={1}>
        <OverviewItemCard isEditable={false} title={strings.GERMINATION_RATE} contents={batch.germinationRate || '%'} />
      </Grid>
      <Grid item flexBasis={overviewGridSize} flexGrow={1}>
        <OverviewItemCard isEditable={false} title={strings.LOSS_RATE} contents={batch.lossRate || '%'} />
      </Grid>
      <Grid item flexBasis={overviewGridSize} flexGrow={1}>
        <OverviewItemCard isEditable={false} title={strings.TOTAL_WITHDRAWN} contents={batch.totalWithdrawn} />
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

      {featureFlagProjects && batch && (
        <Grid item flexBasis={overviewGridSize} flexGrow={1}>
          <ProjectOverviewItemCard<Batch>
            entity={batch}
            reloadData={reloadData}
            projectAssignPayloadCreator={() => ({ batchIds: [batch.id] })}
          />
        </Grid>
      )}
    </Grid>
  );
}
