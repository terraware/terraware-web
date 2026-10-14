import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { DropdownItem } from '@terraware/web-components';

import BackToLink from 'src/components/common/BackToLink';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers';
import strings from 'src/strings';
import { MinimalPlantingSite } from 'src/types/Tracking';
import { isAdmin } from 'src/utils/organization';

export type PlantingSiteDetailsHeaderProps = {
  onDelete: () => void;
  plantingSite: MinimalPlantingSite;
};

export default function PlantingSiteDetailsHeader({
  onDelete,
  plantingSite,
}: PlantingSiteDetailsHeaderProps): JSX.Element {
  const theme = useTheme();
  const { selectedOrganization } = useOrganization();

  return (
    <Box padding={theme.spacing(0, 3)}>
      <Box marginBottom={theme.spacing(1.5)}>
        <BackToLink id='back' to={APP_PATHS.PLANTING_SITES} name={strings.PLANTING_SITES} />
      </Box>
      <Box display='flex' alignItems='center' flexWrap='wrap' gap={theme.spacing(1.5)} minHeight='50px'>
        <Typography fontSize='24px' fontWeight={600} lineHeight='32px'>
          {plantingSite.name}
        </Typography>
        {isAdmin(selectedOrganization) && (
          <Box marginLeft='auto'>
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
      </Box>
    </Box>
  );
}
