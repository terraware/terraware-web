import React, { type JSX, useState } from 'react';
import { Navigate, useParams } from 'react-router';

import { BusySpinner, Button, Message } from '@terraware/web-components';

import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useFeatureEnabled } from 'src/features';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useOrganization } from 'src/providers';
import { PlantingSitePayload, useGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import strings from 'src/strings';
import { isAdmin } from 'src/utils/organization';

import { EditorModeContext } from './editor/EditorModeContext';
import MapEditor from './editor/MapEditor';

export default function PlantingSiteMapEdit(): JSX.Element {
  const params = useParams<{ plantingSiteId: string }>();
  const plantingSiteId = Number(params.plantingSiteId);
  const { selectedOrganization } = useOrganization();
  const isEditPlantingSiteEnabled = useFeatureEnabled('Edit Planting Site');
  const canEdit = isEditPlantingSiteEnabled && isAdmin(selectedOrganization);
  const { goToPlantingSiteView } = useNavigateTo();
  // simplified boundaries would be saved back over the site's real ones
  const { currentData, isError, isFetching } = useGetPlantingSiteQuery(
    { id: plantingSiteId, includeZones: false, simplified: false },
    { skip: !canEdit }
  );
  const [initialSite, setInitialSite] = useState<PlantingSitePayload>();

  // the editor keeps its own copy of the site, so wait out any refetch of a stale cached site before starting it
  if (!initialSite && currentData?.site && !isFetching && !isError) {
    setInitialSite(currentData.site);
  }

  if (!selectedOrganization) {
    return <BusySpinner withSkrim={true} />;
  }

  if (!canEdit) {
    return <Navigate to={APP_PATHS.PLANTING_SITES_VIEW.replace(':plantingSiteId', `${plantingSiteId}`)} replace />;
  }

  if (!initialSite && !isError) {
    return <BusySpinner withSkrim={true} />;
  }

  if (!initialSite?.strata?.length) {
    return (
      <TfMain>
        <Message
          body={initialSite ? strings.PLANTING_SITE_MAP_NO_STRATA : strings.GENERIC_ERROR}
          priority='info'
          type='page'
          pageButtons={[
            <Button
              key={0}
              label={strings.GO_TO_PLANTING_SITES}
              onClick={() => goToPlantingSiteView(plantingSiteId)}
              priority='secondary'
              size='small'
              type='passive'
            />,
          ]}
        />
      </TfMain>
    );
  }

  return (
    <EditorModeContext.Provider value='edit'>
      <MapEditor site={initialSite} />
    </EditorModeContext.Provider>
  );
}
