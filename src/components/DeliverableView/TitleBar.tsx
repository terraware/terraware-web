import React from '@mui/material';

import CommonTitleBar from 'src/components/common/TitleBar';
import { useParticipantProjectData } from 'src/scenes/AcceleratorRouter/ParticipantProjects/ParticipantProjectContext';
import strings from 'src/strings';
import { categoryLabel } from 'src/types/Deliverables';

import { ViewProps } from './types';

const TitleBar = ({ deliverable }: ViewProps): JSX.Element => {
  const { category, name } = deliverable;
  const { participantProject } = useParticipantProjectData();

  return (
    <CommonTitleBar
      header={strings.formatString(strings.DEAL_NAME, participantProject?.dealName ?? '').toString()}
      title={name}
      subtitle={strings.formatString(strings.DELIVERABLE_CATEGORY, categoryLabel(category)).toString()}
    />
  );
};

export default TitleBar;
