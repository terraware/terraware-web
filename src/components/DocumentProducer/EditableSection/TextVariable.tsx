import React from 'react';

import { Box, useTheme } from '@mui/material';
import { Icon, IconName } from '@terraware/web-components';
import { RenderElementProps } from 'slate-react';

type TextVariableProps = RenderElementProps & {
  icon?: IconName;
  onClick?: () => void;
  displayValue: string;
};

export default function TextVariable(props: TextVariableProps): React.ReactElement {
  const theme = useTheme();

  return (
    <Box
      component='span'
      contentEditable={false}
      sx={{
        color: theme.palette.TwClrTxt,
        backgroundColor: '#e9e2ba',
        margin: '0 1px',
        padding: '0 1px',
        '& .icon-container': {
          position: 'relative',
          top: '3px',
          cursor: 'pointer',
        },
      }}
      {...props.attributes}
    >
      {props.children}
      {props.displayValue}
      &nbsp;
      {props.icon && (
        <span className='icon-container' onClick={props.onClick}>
          <Icon name={props.icon} />
        </span>
      )}
    </Box>
  );
}
