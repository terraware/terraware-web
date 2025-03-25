import React from 'react';

import { IconButton, useTheme } from '@mui/material';
import { Icon, Tooltip } from '@terraware/web-components';

import useNavigateTo from 'src/hooks/useNavigateTo';
import strings from 'src/strings';

const SettingsLink = () => {
  const theme = useTheme();
  const { goToSettings } = useNavigateTo();

  return (
    <div>
      <Tooltip title={strings.SETTINGS}>
        <IconButton id='settings-button' onClick={goToSettings}>
          <Icon name='iconSettings' size='medium' fillColor={theme.palette.TwClrIcn} />
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default SettingsLink;
