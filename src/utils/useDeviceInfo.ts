import { useMediaQuery } from 'react-responsive';

export type DeviceType = 'desktop' | 'tablet' | 'mobile';
export type DeviceOrientation = 'portrait' | 'landscape';

/**
 * Device widths categorized for our purposes.
 * Device widths
 * desktop width > 1023
 * tablet width = 1023 - 768
 * mobile width = < 768
 */

type DeviceChangeCallback = () => void;

type DeviceInfoProps = {
  onChange?: DeviceChangeCallback;
};

/**
 * This function returns properties on device type.
 *
 * {
 *   type: 'desktop' | 'tablet' | 'mobile',
 *   orientation: 'portrait' | 'landscape',
 *   isDesktop: <boolean>,
 *   isTablet: <boolean>,
 *   isMobile: <boolean>,
 *   isRetina: <boolean>,
 * }
 *
 * Clients can use whichever properties they see fit.
 *
 * This function also acceps a callback function to be called
 * if there's a change in any of our interested device properties.
 */

const useDeviceInfo = ({ onChange }: DeviceInfoProps = {}) => {
  const deviceChangeCallback = (matches: boolean) => {
    if (matches && onChange) {
      onChange();
    }
  };

  const isDesktop = useMediaQuery({ minWidth: 1024 }, undefined, deviceChangeCallback);

  const isTablet = useMediaQuery({ maxWidth: 1023, minWidth: 768 }, undefined, deviceChangeCallback);

  const isMobile = useMediaQuery({ maxWidth: 767 }, undefined, deviceChangeCallback);

  const isPortrait = useMediaQuery({ orientation: 'portrait' }, undefined, deviceChangeCallback);

  const isRetina = useMediaQuery({ query: '(min-resolution: 2dppx)' }, undefined, deviceChangeCallback);

  const getDeviceType = (): DeviceType => {
    if (isTablet) {
      return 'tablet';
    }

    if (isMobile) {
      return 'mobile';
    }

    return 'desktop';
  };

  const getDeviceOrientation = (): DeviceOrientation => {
    if (isPortrait) {
      return 'portrait';
    }

    return 'landscape';
  };

  return {
    type: getDeviceType(),
    orientation: getDeviceOrientation(),
    isRetina,
    isDesktop,
    isTablet,
    isMobile,
    isPortrait,
    isLandscape: !isPortrait,
  };
};

export default useDeviceInfo;
