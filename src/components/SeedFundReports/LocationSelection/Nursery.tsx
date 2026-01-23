import React, { type JSX } from 'react';

import { Grid } from '@mui/material';

import { LocationSectionProps } from 'src/components/SeedFundReports/LocationSelection';
import { InfoField, infoCardStyles } from 'src/components/SeedFundReports/LocationSelection/InfoField';
import { transformNumericValue } from 'src/components/SeedFundReports/LocationSelection/util';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import strings from 'src/strings';
import { ReportNursery } from 'src/types/Report';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const LocationSectionNursery = (props: LocationSectionProps): JSX.Element => {
  const { editable, location, onUpdateLocation, validate, projectName } = props;

  const { isMobile } = useDeviceInfo();

  const smallItemGridWidth = () => (isMobile ? 12 : 4);

  return (
    <>
      <Grid item xs={smallItemGridWidth()}>
        <InfoField
          id={`${location.id}-nursery-capacity`}
          label={strings.NURSERY_CAPACITY_REQUIRED}
          value={(location as ReportNursery).capacity ?? ''}
          minNum={0}
          editable={editable}
          onChange={(value) => onUpdateLocation('capacity', transformNumericValue(value, { min: 0 }))}
          type='text'
          /* eslint-disable-next-line eqeqeq */
          errorText={validate && (location as ReportNursery).capacity == null ? strings.REQUIRED_FIELD : ''}
          tooltipTitle={strings.REPORT_NURSERY_CAPACITY_INFO}
        />
      </Grid>
      <Grid item xs={smallItemGridWidth()}>
        <OverviewItemCard
          isEditable={false}
          title={strings.TOTAL_NUMBER_OF_PLANTS_PROPAGATED}
          contents={(location as ReportNursery).totalPlantsPropagated.toString() ?? '0'}
          sx={infoCardStyles}
        />
      </Grid>
      {projectName && (
        <Grid item xs={smallItemGridWidth()}>
          <OverviewItemCard
            isEditable={false}
            title={strings.formatString(strings.TOTAL_NUMBER_OF_PLANTS_PROPAGATED_FOR_PROJECT, projectName) as string}
            contents={(location as ReportNursery).totalPlantsPropagatedForProject?.toString() ?? '0'}
            sx={infoCardStyles}
          />
        </Grid>
      )}
      <Grid item xs={smallItemGridWidth()}>
        <OverviewItemCard
          isEditable={false}
          title={strings.NURSERY_MORTALITY_RATE}
          contents={`${(location as ReportNursery).mortalityRate.toString() ?? '0'}%`}
          sx={infoCardStyles}
        />
      </Grid>
      {projectName && !isMobile && (
        <>
          <Grid item xs={smallItemGridWidth()} />
          <Grid item xs={smallItemGridWidth()} />
        </>
      )}
    </>
  );
};

export default LocationSectionNursery;
