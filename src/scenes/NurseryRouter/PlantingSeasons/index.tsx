import React, { type JSX, useCallback, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, Dropdown, DropdownItem, Separator } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import useOrganizationPlantingSites from 'src/hooks/useOrganizationPlantingSites';
import useStickyPlantingSiteId from 'src/hooks/useStickyPlantingSiteId';
import { useLocalization } from 'src/providers';

const PlantingSeasons = (): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();

  const { plantingSites } = useOrganizationPlantingSites();
  const { selectPlantingSite, selectedPlantingSiteId } = useStickyPlantingSiteId('planting-seasons', -1);

  const plantingSiteOptions = useMemo((): DropdownItem[] => {
    const sitesOptions = plantingSites
      .map((site) => ({ label: site.name, value: site.id }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return [{ label: strings.ALL_PLANTING_SITES, value: -1 }, ...sitesOptions];
  }, [plantingSites, strings]);

  const titleArea = useMemo(
    () => (
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', paddingLeft: theme.spacing(3) }}>
        <Box sx={{ alignItems: 'center', display: 'flex', width: '100%' }}>
          {!isMobile && (
            <Typography fontSize='24px' fontWeight='600'>
              {strings.PLANTING_SEASONS}
            </Typography>
          )}
          <Separator height={'40px'} />
          <Typography lineHeight={'40px'} marginRight={theme.spacing(1)} whiteSpace={'nowrap'}>
            {strings.PLANTING_SITE}
          </Typography>
          <Dropdown
            fullWidth
            required
            selectedValue={selectedPlantingSiteId}
            options={plantingSiteOptions}
            onChange={(value: any) => selectPlantingSite(Number(value))}
            sx={{ flex: 1, maxWidth: '400px' }}
          />
        </Box>
        <Typography fontSize='14px' sx={{ marginTop: theme.spacing(0.5) }}>
          {strings.MANAGE_PLANTING_SITE_GOALS_WITHIN_PLANTING_SEASONS}
        </Typography>
      </Box>
    ),
    [isMobile, plantingSiteOptions, selectPlantingSite, selectedPlantingSiteId, strings, theme]
  );

  const onAddPlantingSeason = useCallback(() => {
    // TODO
  }, []);

  return (
    <Page title={isMobile ? strings.PLANTING_SEASONS : titleArea} leftComponent={isMobile ? titleArea : undefined}>
      <Card style={{ width: '100%' }} radius={theme.spacing(1)}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.spacing(6),
            gap: theme.spacing(2),
          }}
        >
          <Box component='img' src='/assets/calendar.svg' alt='' sx={{ width: 64, height: 64 }} />
          <Typography fontSize='16px' color={theme.palette.TwClrTxtSecondary}>
            {strings.NO_PLANTING_SEASONS_HAVE_BEEN_CREATED}
          </Typography>
          <Button
            id='addPlantingSeason'
            icon='plus'
            label={strings.ADD_PLANTING_SEASON}
            onClick={onAddPlantingSeason}
            size='medium'
          />
        </Box>
      </Card>
    </Page>
  );
};

export default PlantingSeasons;
