import { useMemo } from 'react';

import useDeviceInfo from 'src/utils/useDeviceInfo';

interface DevicePerformance {
  isHighPerformance: boolean;
  cpuCores: number;
  deviceMemory?: number;
  isMobile: boolean;
}

export const useDevicePerformance = (): DevicePerformance => {
  const { isMobile } = useDeviceInfo();

  const cpuCores = useMemo(() => navigator.hardwareConcurrency || 4, []);

  const deviceMemory = useMemo(() => (navigator as any).deviceMemory, []);

  const isHighPerformance = useMemo(
    () => (!isMobile && cpuCores >= 4) || (deviceMemory && deviceMemory >= 8) || cpuCores >= 6,
    [cpuCores, deviceMemory, isMobile]
  );

  return {
    isHighPerformance,
    cpuCores,
    deviceMemory,
    isMobile,
  };
};
