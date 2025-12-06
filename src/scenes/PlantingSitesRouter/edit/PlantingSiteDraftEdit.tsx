import React, { useMemo } from 'react';
import { useParams } from 'react-router';

import { BusySpinner } from '@terraware/web-components';

import { useGetDraftPlantingSiteQuery } from 'src/queries/generated/draftPlantingSites';
import { toDraft } from 'src/utils/draftPlantingSiteUtils';

import PlantingSiteEditor from './editor/Editor';

export default function PlantingSiteDraftEdit(): JSX.Element {
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();

  const { data: result, isLoading } = useGetDraftPlantingSiteQuery(Number(plantingSiteId));
  const draftSite = useMemo(() => (result?.site ? toDraft(result.site) : undefined), [result?.site]);

  if (isLoading || !draftSite) {
    return <BusySpinner withSkrim={true} />;
  }

  return <PlantingSiteEditor site={draftSite} />;
}
