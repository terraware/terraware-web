import React, { useState } from 'react';
import { Box } from '@mui/material';
import Card from 'src/components/common/Card';
import ListMapSelector, { View } from 'src/components/common/ListMapSelector';

/**
 * Props include an optional search component for the top left.
 * List and map components are optional, absence of either will
 * disable corresponding selector.
 */
export type ListMapViewProps = {
  search: React.ReactNode;
  list: React.ReactNode;
  map: React.ReactNode;
  initialView: View;
  onView?: (view: View) => void;
};

export default function ListMapView({ search, list, map, onView, initialView }: ListMapViewProps): JSX.Element {
  const [view, setView] = useState<View>(initialView);

  const updateView = (nextView: View) => {
    setView(nextView);
    if (onView) {
      onView(nextView);
    }
  };

  return (
    <Card
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
      }}
    >
      <Box display='flex' flexDirection='row' justifyContent='space-between' alignItems='center'>
        {search}
        <ListMapSelector view={view} onView={updateView} />
      </Box>
      <Box display='flex' flexGrow={1} marginTop='20px'>
        <Box display={view === 'list' ? 'flex' : 'none'}>{list}</Box>
        <Box display={view === 'map' ? 'flex' : 'none'}>{map}</Box>
      </Box>
    </Card>
  );
}
