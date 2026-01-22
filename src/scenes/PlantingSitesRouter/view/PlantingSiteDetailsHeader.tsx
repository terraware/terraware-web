import React, { type JSX } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { DropdownItem } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import BackToLink from 'src/components/common/BackToLink';
import OptionsMenu from 'src/components/common/OptionsMenu';
import TooltipButton from 'src/components/common/button/TooltipButton';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { MinimalPlantingSite } from 'src/types/Tracking';

export type PlantingSiteDetailsHeaderProps = {
  editDisabled?: boolean;
  isDraft?: boolean;
  onDelete: () => void;
  onEdit: () => void;
  plantingSite: MinimalPlantingSite;
};

export default function PlantingSiteDetailsHeader({
  editDisabled,
  isDraft,
  onDelete,
  onEdit,
  plantingSite,
}: PlantingSiteDetailsHeaderProps): JSX.Element {
  const { activeLocale } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  return (
    <Box>
      <Grid item xs={12} marginBottom={theme.spacing(3)}>
        <BackToLink id='back' to={APP_PATHS.PLANTING_SITES} name={strings.PLANTING_SITES} />
      </Grid>
      <Grid
        item
        xs={12}
        padding={theme.spacing(0, 3)}
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          minHeight: '50px',
        }}
      >
        <Typography fontSize='20px' fontWeight={600}>
          {plantingSite?.name} {isDraft && activeLocale ? `(${strings.DRAFT})` : undefined}
        </Typography>
        {
          <Box display='flex' alignItems='center'>
            <TooltipButton
              disabled={editDisabled}
              icon='iconEdit'
              label={isMobile ? undefined : strings.EDIT_PLANTING_SITE}
              priority='primary'
              size='medium'
              tooltip={editDisabled ? strings.SITE_EDIT_DISABLED_TOOLTIP : undefined}
              onClick={onEdit}
            />
            {editDisabled !== true && (
              <OptionsMenu
                size='small'
                onOptionItemClick={(item: DropdownItem) => {
                  if (item.value === 'delete-planting-site') {
                    onDelete();
                  }
                }}
                optionItems={[{ label: strings.DELETE, value: 'delete-planting-site', type: 'destructive' }]}
              />
            )}
          </Box>
        }
      </Grid>
    </Box>
  );
}
