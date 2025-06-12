import React, { useCallback } from 'react';

import { useTheme } from '@mui/material';

import Link from 'src/components/common/Link';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';

import { ProjectFieldProps } from '.';

const ProjectFieldLink = ({ label, value }: ProjectFieldProps) => {
  const theme = useTheme();
  const navigate = useSyncNavigate();

  const onClick = useCallback(() => {
    if ((value as string).startsWith('http')) {
      window.open(value as string, '_blank');
    } else {
      void navigate(value as string);
      window.scroll(0, 0);
    }
  }, [navigate, value]);

  return (
    value && (
      <Link fontSize={'16px'} onClick={onClick} style={{ paddingRight: theme.spacing(2) }}>
        {label}
      </Link>
    )
  );
};

export default ProjectFieldLink;
