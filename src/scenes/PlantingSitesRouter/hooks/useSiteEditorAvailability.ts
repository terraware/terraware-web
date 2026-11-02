import { useMediaQuery } from '@mui/material';

import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

export type SiteEditorAvailability = {
  isEditorAvailable: boolean;
  unavailableMessage: string;
};

const useSiteEditorAvailability = (): SiteEditorAvailability => {
  const { isDesktop } = useDeviceInfo();
  const isNarrowPortrait = useMediaQuery('(min-width: 768px) and (max-width: 1439px) and (orientation: portrait)');

  return {
    isEditorAvailable: isDesktop && !isNarrowPortrait,
    unavailableMessage: isNarrowPortrait
      ? strings.SITE_EDITOR_USE_TABLET_LANDSCAPE
      : strings.FEATURE_NOT_AVAILABLE_AT_SCREEN_SIZE,
  };
};

export default useSiteEditorAvailability;
