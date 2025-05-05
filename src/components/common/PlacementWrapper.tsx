import React, { CSSProperties, ReactNode, useMemo } from 'react';

import { Box, TooltipProps, useTheme } from '@mui/material';

export type PlacementWrapperProps = {
  placedObject: ReactNode;
  children: ReactNode;
  objectPlacement: TooltipProps['placement'];
};

const PlacementWrapper = ({ placedObject, children, objectPlacement }: PlacementWrapperProps) => {
  const theme = useTheme();

  const outsideDirection = useMemo((): CSSProperties['flexDirection'] => {
    if (!objectPlacement) {
      return 'column';
    }
    if (objectPlacement.startsWith('top')) {
      return 'column';
    } else if (objectPlacement.startsWith('bottom')) {
      return 'column-reverse';
    } else if (objectPlacement.startsWith('left')) {
      return 'row';
    } else {
      return 'row-reverse';
    }
  }, [objectPlacement]);

  const insideAlignment = useMemo((): CSSProperties['alignContent'] => {
    if (!objectPlacement) {
      return 'center';
    }
    if (objectPlacement.endsWith('start')) {
      return 'flex-start';
    } else if (objectPlacement.endsWith('end')) {
      return 'flex-end';
    } else {
      return 'center';
    }
  }, [objectPlacement]);

  return (
    <Box display='flex' flexDirection={outsideDirection} flexGrow={1} marginBottom={theme.spacing(2)}>
      <Box alignSelf={insideAlignment} margin={theme.spacing(1)}>
        {placedObject}
      </Box>

      {children}
    </Box>
  );
};

export default PlacementWrapper;
