import React from 'react';
import { useHistory } from 'react-router-dom';

import Page from 'src/components/Page';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const OverviewView = () => {
  const { isMobile } = useDeviceInfo();
  const history = useHistory();

  const goToNewCohort = () => {
    history.push(APP_PATHS.ACCELERATOR_COHORTS_NEW);
  };

  return (
    <Page
      title={strings.ACCELERATOR_CONSOLE}
      rightComponent={
        isMobile ? (
          <Button id='new-cohort' icon='plus' onClick={goToNewCohort} size='medium' />
        ) : (
          <Button id='new-cohort' label={strings.ADD_COHORT} icon='plus' onClick={goToNewCohort} size='medium' />
        )
      }
    />
  );
};

export default OverviewView;
