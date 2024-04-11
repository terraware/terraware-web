import React from 'react';

import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Icon, IconName } from '@terraware/web-components';
import { RenderElementProps } from 'slate-react';

const useStyles = makeStyles((theme: Theme) => ({
  variable: {
    color: theme.palette.TwClrTxt,
    backgroundColor: '#e9e2ba',
    margin: '0 1px',
    padding: '0 1px',
    '& .icon-container': {
      position: 'relative',
      top: '3px',
      cursor: 'pointer',
    },
  },
}));

type TextVariableProps = RenderElementProps & {
  icon?: IconName;
  onClick?: () => void;
  displayValue: string;
};

export default function TextVariable(props: TextVariableProps): React.ReactElement {
  const classes = useStyles();

  return (
    <span contentEditable={false} className={classes.variable} {...props.attributes}>
      {props.children}
      {props.displayValue}
      &nbsp;
      {props.icon && (
        <span className='icon-container' onClick={props.onClick}>
          <Icon name={props.icon} />
        </span>
      )}
    </span>
  );
}
