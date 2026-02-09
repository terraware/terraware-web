import React, { type JSX, ReactNode } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import Button from 'src/components/common/button/Button';
import strings from 'src/strings';

export type EditableReportBoxProps = {
  name: string;
  description?: string;
  canEdit: boolean;
  visibleToFunder?: boolean; // undefined to hide text, true/false to determine state to show
  isConsoleView?: boolean;
  editing?: boolean;
  busy?: boolean;
  children: ReactNode;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  includeBorder?: boolean;
};

const EditableReportBox = ({
  editing,
  name,
  description,
  canEdit,
  visibleToFunder,
  busy,
  children,
  isConsoleView,
  onEdit,
  onCancel,
  onSave,
  includeBorder = true,
}: EditableReportBoxProps): JSX.Element => {
  const theme = useTheme();

  return (
    <>
      <Box
        sx={{ scrollMarginTop: '50vh' }}
        borderBottom={includeBorder ? `1px solid ${theme.palette.TwClrBgTertiary}` : ''}
      >
        <Box
          sx={{
            borderRadius: 2,
            '&:hover': {
              background:
                !isConsoleView || (!canEdit && !editing)
                  ? 'none'
                  : editing
                    ? theme.palette.TwClrBgActive
                    : theme.palette.TwClrBgHover,
              '.actions': {
                display: isConsoleView && (canEdit || editing) ? 'block' : 'none',
                marginTop: name ? 0 : '20px',
              },
            },
            background: isConsoleView && editing ? theme.palette.TwClrBgActive : 'none',
            '& .actions': {
              display: 'none',
            },
            padding: 2,
            width: '100%',
          }}
        >
          {(name || canEdit) && (
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'space-apart',
                width: '100%',
              }}
            >
              <Box
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  flexGrow: 1,
                  justifyContent: 'flex-start',
                  flexDirection: 'row',
                  marginBottom: theme.spacing(2),
                }}
              >
                <Typography fontWeight={600}>{name}</Typography>
                {visibleToFunder !== undefined && (
                  <Typography
                    fontWeight={500}
                    fontSize={'14px'}
                    lineHeight={'20px'}
                    color={visibleToFunder ? theme.palette.TwClrTxtSuccess : theme.palette.TwClrTxtDanger}
                    paddingLeft={theme.spacing(2)}
                  >
                    {visibleToFunder ? strings.METRIC_VISIBLE_TO_FUNDER : strings.METRIC_NOT_VISIBLE_TO_FUNDER}
                  </Typography>
                )}
              </Box>

              <Box
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  flexGrow: 1,
                  justifyContent: 'flex-end',
                  position: 'relative',
                  height: 0,
                }}
              >
                {!editing && (
                  <Box className='actions'>
                    <Button
                      id='edit'
                      label={strings.EDIT}
                      onClick={onEdit}
                      icon='iconEdit'
                      priority='secondary'
                      className='edit-button'
                      size='small'
                      sx={{ '&.button': { margin: '4px' } }}
                      type='passive'
                    />
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {!!description && (
            <Typography
              sx={{
                color: 'rgba(0, 0, 0, 0.54)',
                fontSize: '14px',
                fontStyle: 'italic',
                lineHeight: '20px',
                marginBottom: '16px',
                marginTop: '-16px',
              }}
            >
              {description}
            </Typography>
          )}

          <Grid container>{children}</Grid>

          {isConsoleView && editing && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                id='cancel'
                label={strings.CANCEL}
                type='passive'
                onClick={onCancel}
                priority='secondary'
                key='button-1'
              />
              <Button
                id={'save'}
                disabled={busy}
                onClick={onSave}
                label={strings.SAVE}
                key='button-2'
                priority='secondary'
              />
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default EditableReportBox;
