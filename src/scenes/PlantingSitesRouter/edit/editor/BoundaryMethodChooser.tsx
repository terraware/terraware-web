import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';
import { IconName } from '@terraware/web-components/components/Icon/icons';

import { MAP_VIEW_STYLE_CONTROL_Z_INDEX } from 'src/components/NewMap/MapViewStyleControl';
import strings from 'src/strings';
import { getRgbaFromHex } from 'src/utils/color';

export type BoundaryMethod = 'upload' | 'draw';

type MethodTileProps = {
  description: string;
  icon: IconName;
  id: string;
  label: string;
  onClick: () => void;
};

const MethodTile = ({ description, icon, id, label, onClick }: MethodTileProps): JSX.Element => {
  const theme = useTheme();

  return (
    <Box
      component='button'
      id={id}
      onClick={onClick}
      sx={{
        alignItems: 'flex-start',
        background: theme.palette.TwClrBg,
        border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        fontFamily: 'inherit',
        gap: theme.spacing(2),
        padding: theme.spacing(2, 2.5),
        textAlign: 'left',
        width: '320px',
        '&:hover': {
          background: theme.palette.TwClrBgHover,
          borderColor: theme.palette.TwClrBrdrSuccess,
        },
      }}
    >
      <Box
        sx={{
          alignItems: 'center',
          background: theme.palette.TwClrBgSuccessTertiary,
          borderRadius: '8px',
          display: 'flex',
          flex: 'none',
          height: '40px',
          justifyContent: 'center',
          width: '40px',
        }}
      >
        <Icon name={icon} style={{ fill: theme.palette.TwClrIcnBrand, height: '20px', width: '20px' }} />
      </Box>
      <Box display='flex' flexDirection='column' gap={theme.spacing(0.5)}>
        <Typography fontSize='14px' fontWeight={600} lineHeight='20px' color={theme.palette.TwClrTxt}>
          {label}
        </Typography>
        <Typography fontSize='12px' fontWeight={400} lineHeight='16px' color={theme.palette.TwClrTxtSecondary}>
          {description}
        </Typography>
      </Box>
    </Box>
  );
};

export type BoundaryMethodChooserProps = {
  onSelect: (method: BoundaryMethod) => void;
};

/**
 * Overlay shown on top of the editor card while the site boundary is still undefined, letting the
 * user choose between uploading a spatial file and drawing the boundary by hand.
 */
export default function BoundaryMethodChooser({ onSelect }: BoundaryMethodChooserProps): JSX.Element {
  const theme = useTheme();

  return (
    <Box
      sx={{
        alignItems: 'center',
        backgroundColor: getRgbaFromHex(theme.palette.TwClrBaseGray025 as string, 0.6),
        backgroundImage:
          'linear-gradient(180deg, ' +
          `${getRgbaFromHex(theme.palette.TwClrBaseGreen050 as string, 0)}, ` +
          `${getRgbaFromHex(theme.palette.TwClrBaseGreen050 as string, 0.24)})`,
        borderRadius: theme.spacing(1),
        display: 'flex',
        inset: 0,
        justifyContent: 'center',
        position: 'absolute',
        zIndex: MAP_VIEW_STYLE_CONTROL_Z_INDEX + 1,
      }}
    >
      <Box
        sx={{
          alignItems: 'center',
          background: theme.palette.TwClrBg,
          borderRadius: '8px',
          boxShadow: '0 16px 32px 0 rgba(58, 68, 69, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing(2.5),
          padding: theme.spacing(4, 4.5),
        }}
      >
        <Typography fontSize='16px' fontWeight={600} lineHeight='24px' color={theme.palette.TwClrTxt}>
          {strings.BOUNDARY_METHOD_TITLE}
        </Typography>
        <Box display='flex' gap={theme.spacing(2)}>
          <MethodTile
            description={strings.BOUNDARY_METHOD_UPLOAD_DESCRIPTION}
            icon='uploadCloud'
            id='choose-upload-boundary'
            label={strings.UPLOAD_SPATIAL_FILES}
            onClick={() => onSelect('upload')}
          />
          <MethodTile
            description={strings.BOUNDARY_METHOD_DRAW_DESCRIPTION}
            icon='iconEdit'
            id='choose-draw-boundary'
            label={strings.DRAW_BOUNDARY_WITHIN_MAP}
            onClick={() => onSelect('draw')}
          />
        </Box>
        <Typography fontSize='12px' fontWeight={400} lineHeight='16px' color={theme.palette.TwClrTxtSecondary}>
          {strings.BOUNDARY_METHOD_SWITCH_NOTE}
        </Typography>
      </Box>
    </Box>
  );
}
