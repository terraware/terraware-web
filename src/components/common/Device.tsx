import React from 'react';

import useDeviceInfo from 'src/utils/useDeviceInfo';

/**
 * Utility components that can be used for device forms.
 * Example:
 *   <Desktop>
 *     <Some-Desktop-Menu/>
 *   </Desktop>
 *   <Tablet>
 *     <Some-Tablet-Menu/>
 *   </Tablet>
 *   <Mobile>
 *     <Some-Mobile-Menu/>
 *   </Mobile>
 */

type DeviceProps = {
  children: React.ReactNode;
};

const Element = (children: React.ReactNode, render: boolean) => {
  if (!render) {
    return null;
  }
  return <>{children}</>;
};

export const Desktop = ({ children }: DeviceProps) => Element(children, useDeviceInfo().isDesktop);

export const Tablet = ({ children }: DeviceProps) => Element(children, useDeviceInfo().isTablet);

export const Mobile = ({ children }: DeviceProps) => Element(children, useDeviceInfo().isMobile);
