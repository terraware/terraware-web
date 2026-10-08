import React, { type JSX } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button, DropdownItem } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import BackToLink from 'src/components/common/BackToLink';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers';
import strings from 'src/strings';
import { MinimalPlantingSite } from 'src/types/Tracking';
import { isAdmin } from 'src/utils/organization';

export type PlantingSiteDetailsHeaderProps = {
  onDelete: () => void;
  onEdit: () => void;
  plantingSite: MinimalPlantingSite;
};

export default function PlantingSiteDetailsHeader({
  onDelete,
  onEdit,
  plantingSite,
}: PlantingSiteDetailsHeaderProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const { selectedOrganization } = useOrganization();

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
          {plantingSite?.name}
        </Typography>
        {isAdmin(selectedOrganization) && (
          <Box display='flex' alignItems='center'>
            <Button
              icon='iconEdit'
              label={isMobile ? undefined : strings.EDIT_PLANTING_SITE}
              priority='primary'
              size='medium'
              onClick={onEdit}
            />
            <OptionsMenu
              size='small'
              onOptionItemClick={(item: DropdownItem) => {
                if (item.value === 'delete-planting-site') {
                  onDelete();
                }
              }}
              optionItems={[{ label: strings.DELETE, value: 'delete-planting-site', type: 'destructive' }]}
            />
          </Box>
        )}
      </Grid>
    </Box>
  );
}
