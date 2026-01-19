import React, { type JSX } from 'react';
import { useParams } from 'react-router';

import TfMain from 'src/components/common/TfMain';

import ActivityDetailsForm from './ActivityDetailsForm';

export default function ActivityCreateView(): JSX.Element {
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);

  return (
    <TfMain>
      <ActivityDetailsForm projectId={projectId} />
    </TfMain>
  );
}
