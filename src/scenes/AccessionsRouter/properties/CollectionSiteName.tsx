import React, { type JSX, useEffect } from 'react';

import { Box } from '@mui/material';

import { useLocalization, useOrganization } from 'src/providers/hooks';
import { useLazyGetCollectionSiteNamesQuery } from 'src/queries/search/accessions';
import RecentValuesAutocomplete from 'src/scenes/AccessionsRouter/properties/RecentValuesAutocomplete';
import strings from 'src/strings';

interface Props {
  collectionSiteName?: string;
  label?: string;
  onChange: (id: string, value: string) => void;
}

export default function CollectionSiteName({
  collectionSiteName = '',
  label = strings.COLLECTION_SITE_NAME,
  onChange,
}: Props): JSX.Element | null {
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();

  const [fetchCollectionSiteNames, collectionSiteNamesResult] = useLazyGetCollectionSiteNamesQuery();
  useEffect(() => {
    if (selectedOrganization) {
      void fetchCollectionSiteNames(selectedOrganization.id);
    }
  }, [fetchCollectionSiteNames, selectedOrganization]);
  const options = collectionSiteNamesResult.data;

  return !activeLocale ? null : (
    <Box mb={2} display='flex' alignItems='center' sx={{ display: 'block', position: 'relative' }}>
      <RecentValuesAutocomplete
        id='collectionSiteName'
        label={label}
        onChange={(value) => onChange('collectionSiteName', value)}
        values={options || []}
        allLabel={strings.ALL_COLLECTION_SITES}
        selected={collectionSiteName}
        tooltipTitle={strings.TOOLTIP_ACCESSIONS_ADD_COLLECTING_SITE}
      />
    </Box>
  );
}
