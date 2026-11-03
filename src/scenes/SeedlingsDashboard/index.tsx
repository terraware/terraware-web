import React, { type JSX } from 'react';

import PageHeader from 'src/components/PageHeader';
import TfMain from 'src/components/common/TfMain';
import { useLocalization } from 'src/providers';

export default function SeedlingsDashboard(): JSX.Element {
  const { strings } = useLocalization();

  return (
    <TfMain>
      <PageHeader page={strings.SEEDLINGS_DASHBOARD} parentPage={strings.SEEDLINGS} snackbarPageKey='seedlings' />
    </TfMain>
  );
}
