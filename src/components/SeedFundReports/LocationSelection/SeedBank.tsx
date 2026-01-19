import React, { type JSX } from 'react';

import { Grid } from '@mui/material';

import { LocationSectionProps } from 'src/components/SeedFundReports/LocationSelection';
import { infoCardStyles } from 'src/components/SeedFundReports/LocationSelection/InfoField';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import strings from 'src/strings';
import { ReportSeedBank } from 'src/types/Report';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const LocationSectionSeedBank = (props: LocationSectionProps): JSX.Element => {
  const { location, projectName } = props;

  const { isMobile } = useDeviceInfo();

  const smallItemGridWidth = () => (isMobile ? 12 : 4);

  return (
    <>
      <Grid item xs={smallItemGridWidth()}>
        <OverviewItemCard
          isEditable={false}
          title={strings.TOTAL_SEEDS_STORED}
          contents={(location as ReportSeedBank).totalSeedsStored.toString() ?? '0'}
          sx={infoCardStyles}
        />
      </Grid>
      {projectName && (
        <>
          <Grid item xs={smallItemGridWidth()}>
            <OverviewItemCard
              isEditable={false}
              title={strings.formatString(strings.TOTAL_SEEDS_STORED_FOR_PROJECT, projectName) as string}
              contents={(location as ReportSeedBank).totalSeedsStoredForProject?.toString() ?? '0'}
              sx={infoCardStyles}
            />
          </Grid>
        </>
      )}
      {projectName && !isMobile && <Grid item xs={smallItemGridWidth()} />}
    </>
  );
};

export default LocationSectionSeedBank;
