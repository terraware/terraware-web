import React from 'react';
import { ServerOrganization } from 'src/types/Organization';
import strings from 'src/strings';
import TfMain from 'src/components/common/TfMain';
import Title from 'src/components/common/Title';

type PlantsDashboardProps = {
  organization: ServerOrganization;
};

export default function PlantsDashboard(props: PlantsDashboardProps): JSX.Element {
  return (
    <TfMain>
      <Title page={strings.DASHBOARD} parentPage={''} />
    </TfMain>
  );
}
