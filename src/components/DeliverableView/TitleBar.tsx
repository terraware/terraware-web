import React from '@mui/material';

import strings from 'src/strings';
import { categoryLabel } from 'src/types/Deliverables';

import { ViewProps } from './types';
import CommonTitleBar from '../common/TitleBar'

const TitleBar = ({ deliverable }: ViewProps): JSX.Element => {
  const { category, name } = deliverable;

  return (<CommonTitleBar 
    header={strings.formatString(strings.DELIVERABLE_PROJECT, deliverable.projectName ?? '').toString()}
    title={name}
    subtitle={strings.formatString(strings.DELIVERABLE_CATEGORY, categoryLabel(category)).toString()}
  />);
};

export default TitleBar;
