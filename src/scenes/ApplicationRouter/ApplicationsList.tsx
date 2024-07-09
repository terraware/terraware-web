import React from 'react';

import PageHeader from 'src/components/PageHeader';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import strings from 'src/strings';

const ApplicationsList = (): JSX.Element => {
  return (
    <TfMain>
      <PageHeaderWrapper>
        <PageHeader title={strings.APPLICATIONS} />
      </PageHeaderWrapper>
    </TfMain>
  );
};

export default ApplicationsList;
