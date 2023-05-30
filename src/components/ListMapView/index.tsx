import React, { useCallback, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import Card from 'src/components/common/Card';
import ListMapSelector, { View } from 'src/components/common/ListMapSelector';

/**
 * Props include an optional search component for the top left.
 * List and map components are optional, absence of either will
 * disable corresponding selector. 
 */
export type ListMapViewProps = {
  search?: React.ReactNode;
  list?: React.ReactNode;
  map?: React.ReactNode;
  onView?: (view: View) => void;
  initialView: View;
};

export default function ListMapView({ search, list, map, onView, initialView }: ListMapViewProps): JSX.Element {
  const [view, setView] = useState<View>(initialView);

  const updateView = useCallback((nextView: View) => {
    setView(nextView);
    if (onView) {
      onView(nextView);
    }
  }, [onView]);

  useEffect(() => {
    let nextView;

    if (list && map && !view) {
      nextView = initialView || 'list';
    } else if (list && !map) {
      nextView = 'list'; 
    } else if (map && !list) {
      nextView = 'map'; 
    }

    if (view !== nextView) {
      updateView(nextView);
    }
  }, [list, map, initialView, updateView]);

  return (
    <Card>
      <Box display='flex' justifyContent='space-between' flexDirection='row'>
        {search}
        <ListMapSelector
          view={view}
          onView={updateView}
          listDisabled={!list}
          mapDisabled={!map}
        />
      </Box>
      <Box>
        {view === 'map' && map}
        {view === 'list' && list}
      </Box>
    </Card>
  );
}
