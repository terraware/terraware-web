import React, { type JSX } from 'react';

import CommonTitleBar from 'src/components/common/TitleBar';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import strings from 'src/strings';
import { categoryLabel } from 'src/types/Deliverables';

import { ViewProps } from './types';

const TitleBar = ({ deliverable }: ViewProps): JSX.Element => {
  const { category, name } = deliverable;
  const { isAcceleratorRoute } = useAcceleratorConsole();
  return (
    <CommonTitleBar
      header={
        isAcceleratorRoute
          ? `${strings.DEAL_NAME}: ${deliverable.projectDealName ?? ''}`
          : strings.formatString(strings.DELIVERABLE_PROJECT, deliverable.projectName ?? '').toString()
      }
      title={name}
      subtitle={strings.formatString(strings.DELIVERABLE_CATEGORY, categoryLabel(category)).toString()}
    />
  );
};

export default TitleBar;
