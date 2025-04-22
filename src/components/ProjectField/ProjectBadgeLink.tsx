import React from 'react';

import { Box, useTheme } from '@mui/material';

import Link from 'src/components/common/Link';

type ProjectBadgeLinkProps = {
  label?: string;
  linkTo?: string;
  borderLeft?: string;
  children: React.ReactNode;
};

const ProjectBadgeLink = ({ linkTo, label, borderLeft, children }: ProjectBadgeLinkProps) => {
  const theme = useTheme();

  return (
    <Box paddingLeft={theme.spacing(1)} borderLeft={borderLeft}>
      {label && (
        <Link fontSize={'16px'} to={linkTo}>
          {label}:&nbsp;
        </Link>
      )}
      {children}
    </Box>
  );
};

export default ProjectBadgeLink;
