import React, { type JSX } from 'react';
import { useParams } from 'react-router';

import TfMain from 'src/components/common/TfMain';

import ActivityDetailsForm from './ActivityDetailsForm';

export default function ActivityEditView(): JSX.Element {
  const pathParams = useParams<{ activityId: string; projectId: string }>();
  const activityId = Number(pathParams.activityId);
  const projectId = Number(pathParams.projectId);

  return (
    <TfMain>
      <ActivityDetailsForm activityId={activityId} projectId={projectId} />
    </TfMain>
  );
}
