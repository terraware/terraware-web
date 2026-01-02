import React, { useEffect, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Dropdown, DropdownItem, Separator } from '@terraware/web-components';

import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import useStickyPlantingSiteId from 'src/hooks/useStickyPlantingSiteId';
import { useLocalization, useOrganization } from 'src/providers';
import { useLazySearchPlantingSitesQuery } from 'src/queries/search/plantingSites';

import ObservationMap from './ObservationMap';

const ObservationListView = (): JSX.Element => {
  const { selectedOrganization } = useOrganization();
  const { strings } = useLocalization();
  const theme = useTheme();

  const [listPlantingSites, listPlantingSitesResult] = useLazySearchPlantingSitesQuery();
  const { selectPlantingSite, selectedPlantingSiteId } = useStickyPlantingSiteId('observations-list');

  useEffect(() => {
    if (selectedOrganization) {
      void listPlantingSites({ organizationId: selectedOrganization.id, searchOrder: [{ field: 'name' }] }, true);
    }
  }, [listPlantingSites, selectedOrganization]);

  const plantingSites = useMemo(() => listPlantingSitesResult.data ?? [], [listPlantingSitesResult.data]);
  const plantingSiteOptions = useMemo((): DropdownItem[] => {
    return plantingSites.map((site) => ({
      label: site.name,
      value: site.id,
    }));
  }, [plantingSites]);

  const PageHeaderPlantingSiteDropdown = useMemo(
    () => (
      <Box display={'flex'} flexDirection={'row'}>
        <Separator height={'40px'} />
        <Typography lineHeight={'40px'} marginRight={theme.spacing(1)}>
          {strings.PLANTING_SITE}
        </Typography>
        <Dropdown
          fullWidth
          required
          selectedValue={selectedPlantingSiteId}
          options={plantingSiteOptions}
          onChange={(newValue: string) => selectPlantingSite(Number(newValue))}
        />
      </Box>
    ),
    [plantingSiteOptions, selectPlantingSite, selectedPlantingSiteId, strings, theme]
  );

  return (
    <Page title={strings.OBSERVATIONS} leftComponent={PageHeaderPlantingSiteDropdown}>
      <Card radius={'8px'} style={{ width: '100%' }}>
        <ObservationMap />
      </Card>
    </Page>
  );
};

export default ObservationListView;
