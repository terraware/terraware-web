import React, { type JSX } from 'react';

import { Box, useTheme } from '@mui/material';
import { Icon, IconTooltip } from '@terraware/web-components';

import Link from 'src/components/common/Link';

type AddLinkProps = {
  disabled?: boolean;
  id?: string;
  large?: boolean;
  onClick: (args: any) => void;
  text: string;
  tooltipTitle?: string;
};

export default function AddLink(props: AddLinkProps): JSX.Element {
  const { disabled, id, large, onClick, text, tooltipTitle } = props;
  const theme = useTheme();

  return (
    <Link id={id} onClick={onClick} fontSize={large ? '16px' : ''} disabled={disabled}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Icon
          name='iconAdd'
          style={{
            fill: theme.palette.TwClrIcnBrand,
            ...(disabled ? { opacity: 0.5 } : {}),
            ...(large ? { height: '20px', width: '20px' } : {}),
          }}
        />
        <span>&nbsp;{text}</span>
        {tooltipTitle && <IconTooltip title={tooltipTitle} />}
      </Box>
    </Link>
  );
}
