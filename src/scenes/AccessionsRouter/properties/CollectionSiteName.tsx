import React, { type JSX, useEffect, useState } from 'react';

import { Box } from '@mui/material';

import Autocomplete from 'src/components/common/Autocomplete';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { SeedBankService } from 'src/services';
import strings from 'src/strings';

interface Props {
  collectionSiteName?: string;
  onChange: (id: string, value: string) => void;
}

export default function CollectionSiteName({ collectionSiteName = '', onChange }: Props): JSX.Element | null {
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const [options, setOptions] = useState<string[]>();

  useEffect(() => {
    if (selectedOrganization) {
      const populateCollectionSiteNames = async () => {
        setOptions(await SeedBankService.getCollectionSiteNames(selectedOrganization.id));
      };
      void populateCollectionSiteNames();
    }
  }, [selectedOrganization]);

  return !activeLocale ? null : (
    <Box mb={2} display='flex' alignItems='center' sx={{ display: 'block', position: 'relative' }}>
      <Autocomplete
        freeSolo={true}
        id='collectionSiteName'
        label={strings.COLLECTION_SITE}
        onChange={(value) => onChange('collectionSiteName', value as string)}
        options={options || []}
        selected={collectionSiteName}
        tooltipTitle={strings.TOOLTIP_ACCESSIONS_ADD_COLLECTING_SITE}
      />
    </Box>
  );
}
