import React, { type JSX, useCallback, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import Button from 'src/components/common/button/Button';
import { SCROLL_ANCHOR } from 'src/hooks/useScrollRestoration';
import { useLocalization } from 'src/providers';
import { AcceleratorReportPayload } from 'src/queries/generated/acceleratorReports';
import { PublishedReportPayload } from 'src/queries/generated/publishedReports';
import { getImagePath } from 'src/utils/images';

const THUMBNAIL_HEIGHT_PX = 72;
const THUMBNAIL_WIDTH_PX = 144;

type QuarterlyHighlightsBoxProps = {
  onViewHighlights: (quarter?: string) => void;
  projectId: number;
  projectHighlightPhotoValueId?: number;
  report?: AcceleratorReportPayload | PublishedReportPayload;
};

const QuarterlyHighlightsBox = ({
  onViewHighlights,
  projectId,
  projectHighlightPhotoValueId,
  report,
}: QuarterlyHighlightsBoxProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();

  const quarterLabel = useMemo(() => {
    const year = report?.endDate?.split('-')[0];
    if (year === undefined) {
      return undefined;
    }

    return report?.quarter
      ? strings.formatString(strings.QUARTER_YEAR, report.quarter.substring(1), year).toString()
      : year;
  }, [report, strings]);

  const coverPhotoUrl = useMemo(
    () =>
      projectHighlightPhotoValueId === undefined
        ? undefined
        : getImagePath(projectId, projectHighlightPhotoValueId, THUMBNAIL_HEIGHT_PX * 2, THUMBNAIL_WIDTH_PX * 2),
    [projectHighlightPhotoValueId, projectId]
  );

  const onClick = useCallback(() => onViewHighlights(quarterLabel), [onViewHighlights, quarterLabel]);

  return (
    <Box padding={2} {...{ [SCROLL_ANCHOR]: 'quarterlyHighlights' }}>
      <Typography fontSize='20px' fontWeight={600} marginBottom={theme.spacing(2)}>
        {strings.QUARTERLY_HIGHLIGHTS}
      </Typography>

      <Box
        alignItems='center'
        border={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
        borderRadius={theme.spacing(1)}
        display='flex'
        flexWrap='wrap'
        gap={theme.spacing(2)}
        padding={theme.spacing(2)}
      >
        <Box
          sx={{
            background: coverPhotoUrl
              ? `url(${coverPhotoUrl}) center / cover no-repeat`
              : 'url(/assets/logo-terraformation.svg) center / 33% no-repeat, linear-gradient(180deg, #2C8658 0%, #123624 100%)',
            borderRadius: theme.spacing(1),
            flexShrink: 0,
            height: `${THUMBNAIL_HEIGHT_PX}px`,
            width: `${THUMBNAIL_WIDTH_PX}px`,
          }}
        />

        {quarterLabel && (
          <Typography color={theme.palette.TwClrTxtSecondary} flexGrow={1}>
            {strings.formatString(strings.QUARTERLY_HIGHLIGHTS_SUMMARY, quarterLabel)}
          </Typography>
        )}

        <Button
          id='viewQuarterlyHighlights'
          label={strings.VIEW_QUARTERLY_HIGHLIGHTS}
          onClick={onClick}
          priority='secondary'
          size='medium'
          sx={{ marginLeft: 'auto' }}
          type='productive'
        />
      </Box>
    </Box>
  );
};

export default QuarterlyHighlightsBox;
