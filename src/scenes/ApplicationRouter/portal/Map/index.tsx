import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Card, useTheme } from '@mui/material';

import { Crumb } from 'src/components/BreadCrumbs';
import { GenericMap } from 'src/components/Map';
import useRenderAttributes from 'src/components/Map/useRenderAttributes';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import ApplicationPage from 'src/scenes/ApplicationRouter/portal/ApplicationPage';
import { MapService } from 'src/services';
import strings from 'src/strings';
import { MapOptions } from 'src/types/Map';

import { useApplicationData } from '../../../../providers/Application/Context';
import UpdateOrUploadBoundaryModal from './UpdateOrUploadBoundaryModal';

const MapView = () => {
  const theme = useTheme();
  const { selectedApplication } = useApplicationData();
  const getRenderAttributes = useRenderAttributes();

  const mapOptions = useMemo<MapOptions | undefined>(() => {
    if (!selectedApplication?.boundary) {
      return undefined;
    }

    const id = selectedApplication.id;

    return {
      bbox: MapService.getBoundingBox([selectedApplication.boundary.coordinates]),
      sources: [
        {
          entities: [
            {
              properties: {
                id,
                name: 'boundary',
                type: 'site',
              },
              boundary: selectedApplication.boundary.coordinates,
              id,
            },
          ],
          id: 'boundary',
          isInteractive: false,
          ...getRenderAttributes('site'),
        },
      ],
    };
  }, [selectedApplication, getRenderAttributes]);

  return (
    <Card
      title={strings.PROPOSED_PROJECT_BOUNDARY}
      style={{ width: '100%', padding: theme.spacing(3), borderRadius: theme.spacing(3) }}
    >
      <h3>{strings.PROPOSED_PROJECT_BOUNDARY}</h3>

      {mapOptions && (
        <Box display='flex' minHeight={'640px'} justifyContent={'center'} alignContent={'center'}>
          <GenericMap options={mapOptions} style={{ height: '100%', width: '100%', borderRadius: '24px' }} />
        </Box>
      )}
    </Card>
  );
};

const MapViewWrapper = () => {
  const { activeLocale } = useLocalization();
  const { selectedApplication } = useApplicationData();

  const { goToApplicationMapUpdate, goToApplicationMapUpload, goToApplicationPrescreen } = useNavigateTo();

  useEffect(() => {
    if (!selectedApplication) {
      return;
    }

    if (!selectedApplication.boundary) {
      goToApplicationPrescreen(selectedApplication.id);
    }
  }, [selectedApplication]);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onNext = useCallback(
    (type: 'Update' | 'Upload') => {
      if (selectedApplication !== undefined) {
        if (type === 'Update') {
          goToApplicationMapUpdate(selectedApplication.id);
        } else {
          goToApplicationMapUpload(selectedApplication.id);
        }
      }
    },
    [selectedApplication, goToApplicationMapUpdate, goToApplicationMapUpload]
  );

  const crumbs: Crumb[] = useMemo(
    () =>
      activeLocale && selectedApplication?.id
        ? [
            {
              name: strings.PRESCREEN,
              to: APP_PATHS.APPLICATION_PRESCREEN.replace(':applicationId', `${selectedApplication.id}`),
            },
          ]
        : [],
    [activeLocale, selectedApplication?.id]
  );

  return (
    <ApplicationPage
      crumbs={crumbs}
      rightComponent={
        <Button label={strings.REPLACE_BOUNDARY} onClick={() => setIsOpen(true)} priority={'secondary'} />
      }
    >
      <UpdateOrUploadBoundaryModal
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        onNext={onNext}
      />
      <MapView />
    </ApplicationPage>
  );
};

export default MapViewWrapper;
