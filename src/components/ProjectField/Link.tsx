import React from 'react';

import { useTheme } from '@mui/material';

import Link from 'src/components/common/Link';

import { ProjectFieldProps } from '.';

const ProjectFieldLink = ({ label, value }: ProjectFieldProps) => {
  const theme = useTheme();

  return (
    value && (
      <Link fontSize={'16px'} to={`${value}`} style={{ paddingLeft: theme.spacing(2) }}>
        {label}
      </Link>
    )
  );
};

export default ProjectFieldLink;
