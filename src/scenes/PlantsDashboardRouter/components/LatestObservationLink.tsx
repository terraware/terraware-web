import React, { type JSX } from 'react';

import { Typography } from '@mui/material';
import { DateTime } from 'luxon';

import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers';
import { PlantingSitePayload } from 'src/queries/generated/plantingSites';

type LatestObservationLinkProps = {
  plantingSite: PlantingSitePayload | undefined;
};

// Renders the planting site's latest observation date as a link to the observation (or plain text in
// the accelerator console). Empty when there is no completed observation.
const LatestObservationLink = ({ plantingSite }: LatestObservationLinkProps): JSX.Element => {
  const { strings } = useLocalization();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  if (!plantingSite?.latestObservationId || !plantingSite.latestObservationCompletedTime) {
    return <>{''}</>;
  }

  const dateLabel = strings.formatString(
    strings.DATE_OBSERVATION,
    DateTime.fromISO(plantingSite.latestObservationCompletedTime).toFormat('yyyy-MM-dd')
  );

  return isAcceleratorRoute ? (
    <Typography fontSize={'16px'} display={'inline'}>
      {dateLabel}
    </Typography>
  ) : (
    <Link
      fontSize={'16px'}
      to={APP_PATHS.OBSERVATION_DETAILS_V2.replace(':observationId', plantingSite.latestObservationId.toString())}
    >
      {dateLabel}
    </Link>
  );
};

export default LatestObservationLink;
