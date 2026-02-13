import React from 'react';

import { Badge } from '@terraware/web-components';

import ProjectBadgeLink from './ProjectBadgeLink';

type ProjectBadgeProps = {
  label?: string;
};

const PhaseBadge = ({ label }: ProjectBadgeProps) => {
  return (
    <ProjectBadgeLink>
      <Badge label={label || ''} />
    </ProjectBadgeLink>
  );
};

export default PhaseBadge;
