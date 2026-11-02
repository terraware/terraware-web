import React, { type JSX } from 'react';

import PageHeader from 'src/components/PageHeader';
import TfMain from 'src/components/common/TfMain';
import strings from 'src/strings';

export default function SeedlingsDashboard(): JSX.Element {
  return (
    <TfMain>
      <PageHeader page={strings.SEEDLINGS_DASHBOARD} parentPage={strings.SEEDLINGS} snackbarPageKey='seedlings' />
    </TfMain>
  );
}
