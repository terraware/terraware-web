import React from 'react';

import { Box, Grid, useTheme } from '@mui/material';

import Button from 'src/components/common/button/Button';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import ErrorBox from '../../common/ErrorBox/ErrorBox';
import Expandable from '../../common/Expandable';
import Icon from '../../common/icon/Icon';

export type FlowError = {
  title?: string;
  text: string;
  buttonText?: string;
  onClick?: () => void;
};

type FlowStepProps = {
  flowState: string;
  title: string;
  active: boolean;
  completed: boolean | undefined;
  children: React.ReactNode;
  footer?: React.ReactNode;
  footerError?: boolean;
  showNext: boolean;
  disableNext?: boolean;
  buttonText?: string;
  onNext: () => void;
  flowError?: FlowError;
};

export default function FlowStep(props: FlowStepProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const {
    flowState,
    title,
    active,
    completed,
    children,
    footer,
    footerError,
    showNext,
    disableNext,
    buttonText,
    onNext,
    flowError,
  } = props;

  return (
    <Grid
      item
      xs={12}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: theme.spacing(3),
      }}
    >
      <Expandable
        title={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {completed && <Icon name='checkmark' style={{ marginRight: theme.spacing(1) }} />}
            <Box
              component='span'
              sx={{
                fontWeight: 'bold',
                fontSize: '18px',
                lineHeight: '28px',
              }}
            >
              {title}
            </Box>
          </Box>
        }
        opened={active}
        disabled={!active}
      >
        <Box sx={{ marginTop: theme.spacing(2) }}>
          {flowError !== undefined && (
            <ErrorBox
              {...flowError}
              sx={{
                width: '100%',
                marginBottom: theme.spacing(2),
              }}
            />
          )}
          {children}
          <Box
            sx={{
              display: 'flex',
              marginTop: theme.spacing(2),
              alignItems: 'end',
              ...(footerError ? { alignItems: 'center' } : {}),
            }}
          >
            <span>{footer}</span>
            {showNext && (
              <Button
                id={'flow-state-next-' + flowState}
                label={buttonText || strings.NEXT}
                onClick={onNext}
                priority='secondary'
                size='small'
                disabled={disableNext}
                sx={{
                  marginLeft: theme.spacing(isMobile ? 1 : 3),
                  marginBottom: '4px',
                }}
              />
            )}
          </Box>
        </Box>
      </Expandable>
    </Grid>
  );
}
