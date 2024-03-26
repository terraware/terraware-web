import React from 'react';
import { useHistory } from 'react-router-dom';

import { useDeviceInfo } from '@terraware/web-components/utils';

import Page from 'src/components/Page';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import { useUser } from 'src/providers';
import strings from 'src/strings';

import CohortsTable from './CohortsTable';

const CohortListView = () => {
  const { isMobile } = useDeviceInfo();
  const history = useHistory();
  const { isAllowed } = useUser();
  const canCreateCohorts = isAllowed('CREATE_COHORTS');

  const goToNewCohort = () => {
    const newProjectLocation = {
      pathname: APP_PATHS.ACCELERATOR_COHORTS_NEW,
    };
    history.push(newProjectLocation);
  };

  return (
    <Page
      title={strings.COHORTS}
      rightComponent={
        canCreateCohorts && (
          <>
            {isMobile ? (
              <Button id='new-cohort' icon='plus' onClick={goToNewCohort} size='medium' priority='secondary' />
            ) : (
              <Button
                id='new-cohort'
                label={strings.ADD_COHORT}
                icon='plus'
                onClick={goToNewCohort}
                size='medium'
                priority='secondary'
              />
            )}
          </>
        )
      }
      contentStyle={{ display: 'flex', flexGrow: 1, flexDirection: 'column' }}
    >
      <CohortsTable />
    </Page>
  );
};

export default CohortListView;
