import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import BackToLink from 'src/components/common/BackToLink';
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
    <Box padding={theme.spacing(0, 3)}>
      <Box marginBottom={theme.spacing(1.5)}>
        <BackToLink id='back' to={APP_PATHS.PLANTING_SITES} name={strings.PLANTING_SITES} />
      </Box>
      <Box display='flex' alignItems='center' flexWrap='wrap' gap={theme.spacing(1.5)} minHeight='50px'>
        <Typography fontSize='24px' fontWeight={600} lineHeight='32px'>
          {plantingSite.name}
        </Typography>
        {isAdmin(selectedOrganization) && (
          <Box display='flex' alignItems='center' gap={theme.spacing(1.5)} marginLeft='auto'>
            <Button
              icon='iconTrashCan'
              id='delete-planting-site'
              label={isMobile ? undefined : strings.DELETE_PLANTING_SITE}
              onClick={onDelete}
              priority='secondary'
              size='medium'
              type='destructive'
            />
            <Button
              icon='iconEdit'
              label={isMobile ? undefined : strings.EDIT_PLANTING_SITE}
              priority='primary'
              size='medium'
              onClick={onEdit}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
