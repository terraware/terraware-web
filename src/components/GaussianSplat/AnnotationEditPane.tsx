import React, { useCallback } from 'react';

import { Box, Fade, TextField, Typography, useTheme } from '@mui/material';

import { useLocalization } from 'src/providers';

import { AnnotationProps } from './Annotation';

interface AnnotationEditPaneProps {
  visible: boolean;
  annotation: AnnotationProps | null;
  onUpdate: (updates: Partial<AnnotationProps>) => void;
}

const AnnotationEditPane = ({ visible, annotation, onUpdate }: AnnotationEditPaneProps) => {
  const theme = useTheme();
  const { strings } = useLocalization();

  const handleLabelChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ label: event.target.value });
    },
    [onUpdate]
  );

  const handleTitleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ title: event.target.value });
    },
    [onUpdate]
  );

  const handleBodyTextChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ bodyText: event.target.value });
    },
    [onUpdate]
  );

  if (!annotation) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        padding: 2,
        zIndex: 1001,
      }}
    >
      <Fade in={visible} timeout={500}>
        <Box
          sx={{
            backgroundColor: theme.palette.grey[900],
            color: theme.palette.common.white,
            borderRadius: 2,
            padding: 3,
            minWidth: 320,
            maxWidth: 400,
            pointerEvents: 'auto',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography sx={{ fontWeight: 600 }}>{strings.EDIT_ANNOTATION}</Typography>

            <TextField
              id='annotation-label'
              label={strings.LABEL}
              type='text'
              value={annotation.label ?? ''}
              onChange={handleLabelChange}
              variant='outlined'
              size='small'
              fullWidth
              sx={{
                '& .MuiInputBase-root': {
                  color: theme.palette.common.white,
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.grey[400],
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.grey[700],
                },
              }}
            />

            <TextField
              id='annotation-title'
              label={strings.TITLE}
              type='text'
              value={annotation.title}
              onChange={handleTitleChange}
              variant='outlined'
              size='small'
              fullWidth
              sx={{
                '& .MuiInputBase-root': {
                  color: theme.palette.common.white,
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.grey[400],
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.grey[700],
                },
              }}
            />

            <TextField
              id='annotation-body'
              label={strings.DESCRIPTION}
              type='text'
              value={annotation.bodyText ?? ''}
              onChange={handleBodyTextChange}
              variant='outlined'
              size='small'
              fullWidth
              multiline
              rows={4}
              sx={{
                '& .MuiInputBase-root': {
                  color: theme.palette.common.white,
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.grey[400],
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.grey[700],
                },
              }}
            />
          </Box>
        </Box>
      </Fade>
    </Box>
  );
};

export default AnnotationEditPane;
