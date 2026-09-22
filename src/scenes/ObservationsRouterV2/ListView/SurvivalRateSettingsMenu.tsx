import React, { type JSX, useCallback, useEffect, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { DropdownItem } from '@terraware/web-components';

import OptionsMenu from 'src/components/common/OptionsMenu';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { useLazyGetAllT0SiteDataSetQuery } from 'src/queries/generated/t0';

const NotificationDot = (): JSX.Element => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        background: theme.palette.TwClrIcnDanger,
        borderRadius: '4px',
        height: '8px',
        minWidth: '8px',
      }}
    />
  );
};

export type SurvivalRateSettingsMenuProps = {
  plantingSiteId: number;
};

const SurvivalRateSettingsMenu = ({ plantingSiteId }: SurvivalRateSettingsMenuProps): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();
  const navigate = useSyncNavigate();

  const [getT0SiteDataSet, getT0SiteDataSetResponse] = useLazyGetAllT0SiteDataSetQuery();
  const needsSettings = getT0SiteDataSetResponse.data?.allSet === false;

  useEffect(() => {
    void getT0SiteDataSet(plantingSiteId, true);
  }, [getT0SiteDataSet, plantingSiteId]);

  const optionItems = useMemo(
    (): DropdownItem[] => [{ label: strings.SURVIVAL_RATE_SETTINGS, value: 'survivalRateSettings' }],
    [strings.SURVIVAL_RATE_SETTINGS]
  );

  const onOptionItemClick = useCallback(() => {
    navigate(APP_PATHS.SURVIVAL_RATE_SETTINGS_V2.replace(':plantingSiteId', `${plantingSiteId}`));
  }, [navigate, plantingSiteId]);

  const itemRenderer = useCallback(
    (item: DropdownItem) => (
      <Box sx={{ alignItems: 'center', display: 'flex', gap: theme.spacing(1) }}>
        <Typography fontSize='16px'>{item.label}</Typography>
        {needsSettings && <NotificationDot />}
      </Box>
    ),
    [needsSettings, theme]
  );

  return (
    <Box sx={{ display: 'inline-flex', position: 'relative' }}>
      <OptionsMenu
        itemRenderer={itemRenderer}
        onOptionItemClick={onOptionItemClick}
        optionItems={optionItems}
        size='medium'
      />
      {needsSettings && (
        <Box sx={{ position: 'absolute', right: '4px', top: '4px' }}>
          <NotificationDot />
        </Box>
      )}
    </Box>
  );
};

export default SurvivalRateSettingsMenu;
