import React, { ReactNode } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import Button from 'src/components/common/button/Button';
import strings from 'src/strings';

export type EditableReportBoxProps = {
  key?: string;
  name: string;
  description?: string;
  canEdit: boolean;
  showEditOnHover?: boolean;
  editing?: boolean;
  children: ReactNode;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
};

const EditableReportBox = ({
  editing,
  key,
  name,
  description,
  canEdit,
  children,
  showEditOnHover = true,
  onEdit,
  onCancel,
  onSave,
}: EditableReportBoxProps): JSX.Element => {
  const theme = useTheme();

  return (
    <>
      <Box key={key} sx={{ scrollMarginTop: '50vh' }} borderBottom={`1px solid ${theme.palette.TwClrBgTertiary}`}>
        <Box
          sx={{
            borderRadius: 2,
            '&:hover': {
              background:
                !showEditOnHover || !canEdit
                  ? 'none'
                  : editing
                    ? theme.palette.TwClrBgActive
                    : theme.palette.TwClrBgHover,
              '.actions': {
                display: showEditOnHover && canEdit ? 'block' : 'none',
              },
            },
            background: editing ? theme.palette.TwClrBgActive : 'none',
            '& .actions': {
              display: 'none',
            },
            marginBottom: theme.spacing(4),
            padding: 2,
            width: '100%',
          }}
        >
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
                alignItems: 'start',
                display: 'flex',
                flexGrow: 1,
                justifyContent: 'flex-start',
                flexDirection: 'column',
                marginBottom: theme.spacing(2),
              }}
            >
              <Typography sx={{ fontWeight: '600' }}>{name}</Typography>
            </Box>

            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexGrow: 1,
                justifyContent: 'flex-end',
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

          {!!description && (
            <Typography
              sx={{
                color: 'rgba(0, 0, 0, 0.54)',
                fontSize: '14px',
                fontStyle: 'italic',
                lineHeight: '20px',
                marginY: '16px',
              }}
            >
              {description}
            </Typography>
          )}

          <Grid container marginBottom={3}>
            {children}
          </Grid>

          {editing && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                id='cancel'
                label={strings.CANCEL}
                type='passive'
                onClick={onCancel}
                priority='secondary'
                key='button-1'
              />
              <Button id={'save'} onClick={onSave} label={strings.SAVE} key='button-2' priority='secondary' />
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default EditableReportBox;
