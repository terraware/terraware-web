import React, { useCallback, useMemo } from 'react';

import { Box, Fade, Tooltip, Typography, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';

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

  const textFieldSx = useMemo(
    () => ({
      '& .textfield-label': {
        color: `${theme.palette.grey[400]} !important`,
      },
      '& .textfield-value': {
        backgroundColor: `${theme.palette.grey[800]} !important`,
        borderColor: `${theme.palette.grey[700]} !important`,
      },
      '& input': {
        color: `${theme.palette.common.white} !important`,
      },
    }),
    [theme]
  );

  const handleTitleChange = useCallback(
    (value: unknown) => {
      onUpdate({ title: value as string });
    },
    [onUpdate]
  );

  const handleBodyTextChange = useCallback(
    (value: unknown) => {
      onUpdate({ bodyText: value as string });
    },
    [onUpdate]
  );

  const handleLabelChange = useCallback(
    (value: unknown) => {
      onUpdate({ label: value as string });
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

            <Tooltip title={strings.ANNOTATION_TITLE_TOOLTIP} placement='top'>
              <Textfield
                id='annotation-title'
                label={strings.TITLE}
                type='text'
                value={annotation.title}
                onChange={handleTitleChange}
                sx={textFieldSx}
              />
            </Tooltip>

            <Tooltip title={strings.ANNOTATION_DESCRIPTION_TOOLTIP} placement='top'>
              <Textfield
                id='annotation-body'
                label={strings.DESCRIPTION}
                type='text'
                value={annotation.bodyText ?? ''}
                onChange={handleBodyTextChange}
                sx={textFieldSx}
              />
            </Tooltip>

            <Tooltip title={strings.ANNOTATION_LABEL_TOOLTIP} placement='top'>
              <Textfield
                id='annotation-label'
                label={strings.LABEL}
                type='text'
                value={annotation.label ?? ''}
                onChange={handleLabelChange}
                maxLength={3}
                sx={textFieldSx}
              />
            </Tooltip>
          </Box>
        </Box>
      </Fade>
    </Box>
  );
};

export default AnnotationEditPane;
