import React, { type JSX, useMemo } from 'react';

import { useOrganization } from 'src/providers';
import { DraftPlantingSite, SiteType } from 'src/types/PlantingSite';
import useQuery from 'src/utils/useQuery';

import PlantingSiteEditor from './editor/Editor';

export default function PlantingSiteDraftCreate(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const query = useQuery();
  const siteType = useMemo<SiteType>(() => (query.has('detailed') ? 'detailed' : 'simple'), [query]);

  const site = useMemo<DraftPlantingSite>(
    () => ({
      createdBy: -1,
      id: -1,
      name: '',
      organizationId: selectedOrganization?.id || -1,
      plantingSeasons: [],
      siteEditStep: 'details',
      siteType,
    }),
    [selectedOrganization, siteType]
  );

  return <PlantingSiteEditor site={site} />;
}
