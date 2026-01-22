import React, { useMemo } from 'react';

import { Box, useTheme } from '@mui/material';
import { Icon, IconName } from '@terraware/web-components';
import { RenderElementProps } from 'slate-react';

import { VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValue } from 'src/types/documentProducer/VariableValue';

import { editorDisplayVariableWithValues } from './helpers';

export type TextVariableProps = {
  isEditing: boolean;
  icon?: IconName;
  onClick?: () => void;
  reference: boolean;
  variable: VariableWithValues | undefined;
  attributes?: RenderElementProps['attributes'];
  children?: RenderElementProps['children'];
};

const EMPTY_VARIABLE = '--';

export default function TextVariable(props: TextVariableProps): React.ReactElement<any> {
  const theme = useTheme();
  const { isEditing, reference, variable, icon, onClick } = props;
  const attributes = props.attributes || {};
  const children = props.children || null;

  const displayValue = variable
    ? editorDisplayVariableWithValues(variable, ', ', EMPTY_VARIABLE, reference)
    : EMPTY_VARIABLE;

  const status: VariableValue['status'] = variable?.deliverableId
    ? (variable?.variableValues || [])[0]?.status
    : undefined;

  const statusIcon = useMemo(() => {
    let color: React.CSSProperties['color'] | undefined;
    let iconName: IconName | undefined;

    switch (status) {
      case 'Not Submitted':
      case 'In Review':
        color = theme.palette.TwClrIcnWarning;
        iconName = 'warning';
        break;
      case 'Rejected':
        color = theme.palette.TwClrIcnDanger;
        iconName = 'error';
        break;
    }

    if (!(iconName && color)) {
      return;
    }

    return (
      icon && (
        <span className='icon-container left' onClick={onClick}>
          <Icon name={iconName} fillColor={color} />
        </span>
      )
    );
  }, [icon, onClick, status, theme]);

  return (
    <Box
      component='span'
      contentEditable={false}
      sx={{
        color: theme.palette.TwClrTxt,
        backgroundColor: '#e9e2ba',
        margin: '0 1px',
        height: '24px',
        padding: '2px 4px 2.5px',
        display: 'inline',
        fontFamily: 'Inter',
        borderRadius: '4px',
        fontSize: '16px',
        '& .icon-container': {
          position: 'relative',
          top: '2px',
        },
        '& .icon-container.left': {
          marginRight: '2px',
        },
        '& .icon-container.right': {
          marginLeft: '2px',
          cursor: isEditing ? 'pointer' : 'initial',
        },
      }}
      {...attributes}
    >
      {statusIcon}
      {children}
      <Box
        component='span'
        sx={{
          lineHeight: '16px',
          whiteSpace: 'pre-wrap',
        }}
      >
        {isEditing ? `${variable?.name}: ` : ''}
        {displayValue}
      </Box>
      {icon && (
        <span className='icon-container right' onClick={onClick}>
          <Icon name={icon} fillColor={theme.palette.TwClrIcnSecondary} />
        </span>
      )}
    </Box>
  );
}
