import { useMemo } from 'react';

interface DevicePerformance {
  isHighPerformance: boolean;
  cpuCores: number;
  deviceMemory?: number;
  isMobile: boolean;
}

export const useDevicePerformance = (): DevicePerformance => {
  // Check CPU cores (static value)
  const cpuCores = useMemo(() => navigator.hardwareConcurrency || 4, []);

  // Check device memory (in GB) - only available in some browsers (static value)
  const deviceMemory = useMemo(() => (navigator as any).deviceMemory, []);

  // Check if mobile device (memoize regex test)
  const isMobile = useMemo(
    () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    []
  );

  // Determine if device is high performance based on available metrics
  // Criteria: Desktop with 4+ cores OR 8+ GB RAM, or non-mobile with 6+ cores
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
