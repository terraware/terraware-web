import React from 'react';

import { Script } from '@playcanvas/react/components';
import { Color, Vec3 } from 'playcanvas';
import { GsplatRevealRain } from 'playcanvas/scripts/esm/gsplat/reveal-rain.mjs';

interface SplatRevealRainProps {
  enabled?: boolean;
  center?: [number, number, number];
  distance?: number;
  speed?: number;
  acceleration?: number;
  flightTime?: number;
  rainSize?: number;
  rotation?: number;
  fallTint?: [number, number, number];
  fallTintIntensity?: number;
  hitTint?: [number, number, number];
  hitDuration?: number;
  endRadius?: number;
}

const SplatRevealRain = ({
  enabled = true,
  center = [0, 0, 0],
  distance = 3,
  speed = 10,
  acceleration = 5,
  flightTime = 0.25,
  rainSize = 0.0,
  rotation = 0,
  fallTint = [0, 0, 0],
  fallTintIntensity = 0,
  hitTint = [0, 0, 0],
  hitDuration = 0,
  endRadius = 5,
}: SplatRevealRainProps) => {
  return (
    <Script
      script={GsplatRevealRain}
      enabled={enabled}
      center={new Vec3(...center)}
      distance={distance}
      speed={speed}
      acceleration={acceleration}
      flightTime={flightTime}
      rainSize={rainSize}
      rotation={rotation}
      fallTint={new Color(...fallTint)}
      fallTintIntensity={fallTintIntensity}
      hitTint={new Color(...hitTint)}
      hitDuration={hitDuration}
      endRadius={endRadius}
    />
  );
};

export default SplatRevealRain;
