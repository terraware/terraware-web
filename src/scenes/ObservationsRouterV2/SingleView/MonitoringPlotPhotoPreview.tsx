import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, Icon, Textfield } from '@terraware/web-components';

import PhotoPreview from 'src/components/Photo/PhotoPreview';
import { useLocalization } from 'src/providers/hooks';
import { MonitoringPlotMediaItem, getPositionLabel, getQuadratLabel } from 'src/types/Observations';
import { shouldShowHeicPlaceholder } from 'src/utils/images';

type MonitoringPlotPhotoPreviewProps = {
  isLast?: boolean;
  mediaItem: MonitoringPlotMediaItem;
  monitoringPlotId?: number;
  observationId?: number;
  onDelete: () => void;
  setCaption: (caption: string) => void;
  monitoringPlotName?: string;
};

const MonitoringPlotPhotoPreview = ({
  isLast,
  mediaItem,
  monitoringPlotId,
  observationId,
  onDelete,
  setCaption,
  monitoringPlotName,
}: MonitoringPlotPhotoPreviewProps) => {
  const { strings } = useLocalization();
  const theme = useTheme();

  const [showPlaceholder, setShowPlaceholder] = useState<boolean | undefined>();

  const PHOTO_URL = '/api/v1/tracking/observations/{observationId}/plots/{monitoringPlotId}/photos/{fileId}';

  useEffect(() => {
    const checkPlaceholder = async () => {
      if (mediaItem.type === 'new') {
        const shouldShow =
          mediaItem.data.mediaKind === 'Video' || (await shouldShowHeicPlaceholder(mediaItem.data.file));
        setShowPlaceholder(shouldShow);
      } else {
        setShowPlaceholder(false);
      }
    };

    void checkPlaceholder();
  }, [mediaItem]);

  const url = useMemo(() => {
    if (mediaItem.type === 'new') {
      return showPlaceholder ? '/assets/activity-media.svg' : URL.createObjectURL(mediaItem.data.file);
    } else if (mediaItem.type === 'existing' && observationId && monitoringPlotId) {
      return PHOTO_URL.replace('{observationId}', observationId.toString())
        .replace('{monitoringPlotId}', monitoringPlotId.toString())
        .replace('{fileId}', mediaItem.data.fileId.toString());
    } else {
      return '';
    }
  }, [mediaItem, monitoringPlotId, observationId, showPlaceholder]);

  const caption = useMemo(() => mediaItem.data.caption || '', [mediaItem]);

  const setCaptionCallback = useCallback(
    (value: any) => {
      setCaption(value as string);
    },
    [setCaption]
  );

  const canBeDeleted = useMemo(() => {
    return (mediaItem.data.type === 'Plot' && !mediaItem.data.position) || !mediaItem.data.type;
  }, [mediaItem]);

  return (
    <Box
      borderBottom={isLast ? 'none' : `1px solid ${theme.palette.TwClrBgSecondary}`}
      id={mediaItem.type === 'existing' ? `monitoring-plot-media-item-${mediaItem.data.fileId}` : undefined}
      marginBottom='24px'
      paddingBottom='24px'
      width='100%'
    >
      {mediaItem.data.type === 'Plot' && mediaItem.data.position && (
        <Typography marginBottom={3} color={theme.palette.TwClrBaseBlack}>
          {monitoringPlotName} {getPositionLabel(mediaItem.data.position)}
        </Typography>
      )}
      {mediaItem.data.type === 'Quadrat' && mediaItem.data.position && (
        <Typography marginBottom={3} color={theme.palette.TwClrBaseBlack}>
          {getQuadratLabel(mediaItem.data.position)}
        </Typography>
      )}
      <Box display='flex' flexDirection='column' gap={2}>
        <Box display='flex' gap={2}>
          <Box flexShrink={0} position='relative'>
            <PhotoPreview imgUrl={url} includeTrashIcon={false} onTrashClick={onDelete} />
            {showPlaceholder && (
              <Box
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  borderRadius: 1,
                  bottom: 4,
                  color: 'white',
                  fontSize: '10px',
                  left: 4,
                  padding: '2px 6px',
                  position: 'absolute',
                  right: 4,
                  textAlign: 'center',
                }}
              >
                {strings.PREVIEW_WILL_DISPLAY_AFTER_SAVING}
              </Box>
            )}
          </Box>

          <Box display='flex' flexDirection='column' flex={1}>
            {canBeDeleted ? (
              <Button
                icon='iconTrashCan'
                label={strings.DELETE}
                onClick={onDelete}
                priority='ghost'
                style={{
                  justifyContent: 'flex-start',
                  marginBottom: 0,
                  marginLeft: '-8px',
                  marginTop: 0,
                  maxWidth: '160px',
                  paddingLeft: '8px',
                }}
                type='destructive'
              />
            ) : (
              <Box display='flex' alignItems={'center'}>
                <Icon name='info' fillColor={theme.palette.TwClrIcnSecondary} />
                <Typography
                  color={theme.palette.TwClrTxtSecondary}
                  fontSize={'14px'}
                  fontWeight={400}
                  paddingLeft={theme.spacing(1)}
                >
                  {mediaItem.data.type === 'Plot'
                    ? strings.PLOT_CORNER_PHOTOS_CANNOT_BE_DELETED
                    : mediaItem.data.type === 'Soil'
                      ? strings.SOIL_PHOTO_CANNOT_BE_DELETED
                      : strings.QUADRAT_PHOTOS_CANNOT_BE_DELETED}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Textfield
          id={`caption-${mediaItem.type === 'new' ? mediaItem.data.file.name : mediaItem.data.fileId}`}
          label={strings.CAPTION}
          onChange={setCaptionCallback}
          type='text'
          value={caption}
          maxLength={200}
        />
      </Box>
    </Box>
  );
};

export default MonitoringPlotPhotoPreview;
