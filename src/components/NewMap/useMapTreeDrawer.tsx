import React, { useCallback, useMemo, useState } from 'react';

import { ExistingTreePayload } from 'src/queries/generated/observations';

import { MapDrawerSize } from './MapDrawer';
import MapDrawerPagination from './MapDrawerPagination';
import MapTreeDrawer from './MapTreeDrawer';

export type BiomassTree = {
  observationId: number;
  tree: ExistingTreePayload;
};

const useMapTreeDrawer = () => {
  const [selectedTrees, setSelectedTrees] = useState<BiomassTree[]>([]);
  const [treeDrawerPage, setTreeDrawerPage] = useState<number>(1);

  const treeDrawerSize: MapDrawerSize = 'small';
  const treeDrawerHeader = useMemo(() => {
    if (selectedTrees.length > 1) {
      return (
        <MapDrawerPagination
          drawerSize={treeDrawerSize}
          page={treeDrawerPage}
          setPage={setTreeDrawerPage}
          totalPages={selectedTrees.length}
        />
      );
    } else {
      return undefined;
    }
  }, [treeDrawerPage, selectedTrees.length]);

  const treeDrawerContent = useMemo(() => {
    if (selectedTrees.length > 0) {
      const selectedTree = selectedTrees[treeDrawerPage - 1];
      return <MapTreeDrawer observationId={selectedTree.observationId} tree={selectedTree.tree} />;
    }
  }, [treeDrawerPage, selectedTrees]);

  const selectTrees = useCallback((trees: BiomassTree[]) => {
    setSelectedTrees(trees);
    setTreeDrawerPage(1);
  }, []);

  return {
    treeDrawerContent,
    treeDrawerHeader,
    treeDrawerSize,
    selectedTrees,
    selectTrees,
  };
};

export default useMapTreeDrawer;
