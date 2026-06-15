import React, { type JSX, useEffect, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, Dropdown, DropdownItem, Separator } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import useBoolean from 'src/hooks/useBoolean';
import useOrganizationPlantingSites from 'src/hooks/useOrganizationPlantingSites';
import useStickyPlantingSiteId from 'src/hooks/useStickyPlantingSiteId';
import { useLocalization, useOrganization } from 'src/providers';
import { useLazyListPlantingSeasonsQuery } from 'src/queries/generated/plantingSeasons';

import AddPlantingSeasonModal from './AddPlantingSeasonModal';
import PlantingSeasonBox from './PlantingSeasonBox';

const PlantingSeasonsView = (): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const { selectedOrganization } = useOrganization();

  const { plantingSites } = useOrganizationPlantingSites({ full: true });
  const { selectPlantingSite, selectedPlantingSiteId } = useStickyPlantingSiteId('planting-seasons', -1);

  const [listPlantingSeasons, { data: plantingSeasonsData }] = useLazyListPlantingSeasonsQuery();

  useEffect(() => {
    if (selectedOrganization?.id) {
      void listPlantingSeasons({ organizationId: selectedOrganization.id });
    }
  }, [listPlantingSeasons, selectedOrganization?.id]);

  const plantingSiteOptions = useMemo((): DropdownItem[] => {
    const sitesOptions = plantingSites
      .map((site) => ({ label: site.name, value: site.id }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return [{ label: isMobile ? strings.ALL_SITES : strings.ALL_PLANTING_SITES, value: -1 }, ...sitesOptions];
  }, [isMobile, plantingSites, strings]);

  const plantingSiteDropdown = (
    <Dropdown
      fullWidth
      required
      selectedValue={selectedPlantingSiteId}
      options={plantingSiteOptions}
      onChange={(value: any) => selectPlantingSite(Number(value))}
      sx={{ flex: 1, maxWidth: isMobile ? '280px' : '400px' }}
    />
  );

  const desktopTitleArea = (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', paddingLeft: theme.spacing(3) }}>
      <Box sx={{ alignItems: 'center', display: 'flex', width: '100%' }}>
        <Typography fontSize='24px' fontWeight='600'>
          {strings.PLANTING_SEASONS}
        </Typography>
        <Separator height={'40px'} />
        <Typography lineHeight={'40px'} marginRight={theme.spacing(1)} whiteSpace={'nowrap'}>
          {strings.PLANTING_SITE}
        </Typography>
        {plantingSiteDropdown}
      </Box>
      <Typography fontSize='14px' sx={{ marginTop: theme.spacing(0.5) }}>
        {strings.MANAGE_PLANTING_SITE_GOALS_WITHIN_PLANTING_SEASONS}
      </Typography>
    </Box>
  );

  const [addModalOpen, , onAddPlantingSeason, onCloseAddModal] = useBoolean(false);

  const seasonRows = useMemo(() => {
    const sitesById = new Map(plantingSites.map((site) => [site.id, site]));
    const seasons = plantingSeasonsData?.seasons ?? [];
    return seasons
      .filter((season) => selectedPlantingSiteId === -1 || season.plantingSiteId === selectedPlantingSiteId)
      .flatMap((season) => {
        const site = sitesById.get(season.plantingSiteId);
        return site ? [{ site, season }] : [];
      })
      .sort((a, b) => {
        const startCmp = b.season.startDate.localeCompare(a.season.startDate);
        return startCmp !== 0 ? startCmp : b.season.endDate.localeCompare(a.season.endDate);
      });
  }, [plantingSeasonsData, plantingSites, selectedPlantingSiteId]);

  const addButton = (fullWidth = false) => (
    <Button
      id='addPlantingSeason'
      icon='plus'
      label={strings.ADD_PLANTING_SEASON}
      onClick={onAddPlantingSeason}
      size='medium'
      style={fullWidth ? { margin: 0, width: '100%' } : undefined}
      sx={fullWidth ? { justifyContent: 'center' } : undefined}
    />
  );

  const mobileTitleArea = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(2), width: '100%' }}>
      <Typography fontSize='24px' fontWeight={600} color={theme.palette.TwClrTxt}>
        {strings.PLANTING_SEASONS}
      </Typography>
      <Box sx={{ alignItems: 'center', display: 'flex', gap: theme.spacing(1), width: '100%' }}>
        <Typography color={theme.palette.TwClrTxt} lineHeight='40px' whiteSpace='nowrap'>
          {strings.PLANTING_SITE}
        </Typography>
        {plantingSiteDropdown}
      </Box>
      <Typography fontSize='14px' color={theme.palette.TwClrTxt} lineHeight='20px'>
        {strings.MANAGE_PLANTING_SITE_GOALS_WITHIN_PLANTING_SEASONS}
      </Typography>
      {seasonRows.length > 0 && addButton(true)}
    </Box>
  );

  return (
    <Page
      title={isMobile ? mobileTitleArea : desktopTitleArea}
      rightComponent={!isMobile && seasonRows.length > 0 ? addButton() : undefined}
      leftComponentGridSize={isMobile ? 0 : undefined}
      rightComponentGridSize={isMobile ? 0 : undefined}
    >
      {addModalOpen && (
        <AddPlantingSeasonModal onClose={onCloseAddModal} initialPlantingSiteId={selectedPlantingSiteId} />
      )}
      {seasonRows.length === 0 ? (
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
            {addButton()}
          </Box>
        </Card>
      ) : (
        <Box sx={{ width: '100%' }}>
          {seasonRows.map(({ site, season }) => (
            <PlantingSeasonBox
              key={`${site.id}-${season.id}`}
              season={season}
              plantingSiteName={site.name}
              strata={site.strata ?? []}
            />
          ))}
        </Box>
      )}
    </Page>
  );
};

export default PlantingSeasonsView;
