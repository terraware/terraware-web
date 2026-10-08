import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Badge, Button } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import BackToLink from 'src/components/common/BackToLink';
import TooltipButton from 'src/components/common/button/TooltipButton';
import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers';
import strings from 'src/strings';
import { DraftPlantingSite, SiteEditStep } from 'src/types/PlantingSite';
import { isAdmin } from 'src/utils/organization';

const continueSetupLabel = (step: SiteEditStep): string => {
  switch (step) {
    case 'details':
      return strings.CONTINUE_WITH_DETAILS;
    case 'exclusion_areas':
      return strings.CONTINUE_WITH_EXCLUSION_AREAS;
    case 'stratum_boundaries':
      return strings.CONTINUE_WITH_STRATUM_BOUNDARIES;
    case 'substratum_boundaries':
      return strings.CONTINUE_WITH_SUBSTRATUM_BOUNDARIES;
    default:
      return strings.CONTINUE_BOUNDARY_SETUP;
  }
};

export type DraftPlantingSiteHeaderProps = {
  editDisabled: boolean;
  onDelete: () => void;
  onEdit: () => void;
  plantingSite: DraftPlantingSite;
};

export default function DraftPlantingSiteHeader({
  editDisabled,
  onDelete,
  onEdit,
  plantingSite,
}: DraftPlantingSiteHeaderProps): JSX.Element {
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
        <Badge
          label={strings.DRAFT}
          backgroundColor={theme.palette.TwClrBgWarningTertiary}
          borderColor={theme.palette.TwClrBgWarningTertiary}
          labelColor={theme.palette.TwClrTxtWarning}
        />
        {isAdmin(selectedOrganization) && (
          <Box display='flex' alignItems='center' gap={theme.spacing(1.5)} marginLeft='auto'>
            {!editDisabled && (
              <Button
                icon='iconTrashCan'
                id='delete-draft-planting-site'
                label={isMobile ? undefined : strings.DELETE_DRAFT}
                onClick={onDelete}
                priority='secondary'
                size='medium'
                type='destructive'
              />
            )}
            <TooltipButton
              disabled={editDisabled}
              id='continue-draft-planting-site-setup'
              label={continueSetupLabel(plantingSite.siteEditStep)}
              priority='primary'
              size='medium'
              tooltip={editDisabled ? strings.SITE_EDIT_DISABLED_TOOLTIP : undefined}
              onClick={onEdit}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
