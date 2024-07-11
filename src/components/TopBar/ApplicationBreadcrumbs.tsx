import React from 'react';

import { useTheme } from '@mui/material';

import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import useApplicationPortal from 'src/hooks/useApplicationPortal';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';

export default function ApplicationBreadcrumbs(): JSX.Element | null {
  const theme = useTheme();
  const { isApplicationPortal } = useApplicationPortal();
  const { activeLocale } = useLocalization();

  if (!activeLocale) {
    return null;
  }

  if (isApplicationPortal) {
    return (
      <div>
        <Link fontSize={16} to={APP_PATHS.HOME}>
          Terraware
        </Link>
        <span
          style={{
            color: theme.palette.TwClrBaseGray300,
            fontSize: '16px',
            margin: '0 1em',
            userSelect: 'none',
          }}
        >
          /
        </span>
        <span
          style={{
            backgroundColor: theme.palette.TwClrBaseBlue500,
            borderRadius: '16px',
            color: theme.palette.TwClrBaseWhite,
            fontFamily: 'Inter',
            fontSize: '16px',
            fontWeight: 500,
            padding: '0.5em 0.8em',
            userSelect: 'none',
          }}
        >
          {strings.APPLICATION}
        </span>
      </div>
    );
  }

  return null;
}
