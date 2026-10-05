import React, { type JSX, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, Icon } from '@terraware/web-components';

import { useLocalization } from 'src/providers';

export type UploadedBoundaryFile = {
  areaHa: number;
  boundingAreaHa: number;
  filename: string;
  format: string;
  numPoints: number;
  numPolygons: number;
};

export type UploadedBoundarySummaryProps = {
  file: UploadedBoundaryFile;
  onRemove: () => void;
  onReplace: () => void;
};

/**
 * Row describing the spatial file the current site boundary came from.
 */
export default function UploadedBoundarySummary({
  file,
  onRemove,
  onReplace,
}: UploadedBoundarySummaryProps): JSX.Element {
  const theme = useTheme();
  const { strings } = useLocalization();

  const summary = useMemo<string>(() => {
    const polygons = strings.formatString(
      file.numPolygons === 1 ? strings.SITE_BOUNDARY_NUM_POLYGON : strings.SITE_BOUNDARY_NUM_POLYGONS,
      `${file.numPolygons}`
    ) as string;

    return strings.formatString(
      strings.SITE_BOUNDARY_FILE_SUMMARY,
      file.filename,
      file.format,
      polygons,
      `${file.numPoints}`,
      `${file.areaHa}`,
      `${file.boundingAreaHa}`
    ) as string;
  }, [file, strings]);

  return (
    <Box
      sx={{
        alignItems: 'center',
        background: theme.palette.TwClrBgSecondary,
        borderRadius: '8px',
        display: 'flex',
        gap: theme.spacing(1.5),
        marginBottom: theme.spacing(2),
        padding: theme.spacing(1.25, 1.25, 1.25, 2),
      }}
    >
      <Icon name='iconFile' style={{ fill: theme.palette.TwClrIcnSecondary, flex: 'none' }} />
      <Typography fontSize='14px' fontWeight={400} lineHeight='20px' color={theme.palette.TwClrTxt}>
        {summary}
      </Typography>
      <Box display='flex' gap={theme.spacing(1)} marginLeft='auto' flex='none'>
        <Button
          id='replace-boundary-file'
          label={strings.REPLACE_FILE}
          onClick={onReplace}
          priority='secondary'
          size='small'
          type='passive'
        />
        <Button
          id='remove-boundary-file'
          label={strings.REMOVE}
          onClick={onRemove}
          priority='ghost'
          size='small'
          type='passive'
        />
      </Box>
    </Box>
  );
}
