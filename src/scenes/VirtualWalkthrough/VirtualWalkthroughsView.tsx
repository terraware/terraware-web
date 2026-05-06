import React, { type JSX, useCallback, useState } from 'react';

import { Box, useTheme } from '@mui/material';

import PageHeader from 'src/components/PageHeader';
import Card from 'src/components/common/Card';
import ScrollToTop from 'src/components/common/ScrollToTop';
import TfMain from 'src/components/common/TfMain';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useOrganization } from 'src/providers';
import {
  OrganizationVirtualWalkthrough,
  useSearchVirtualWalkthroughsQuery,
} from 'src/queries/search/virtualWalkthroughs';
import CreateVirtualWalkthroughStep1Modal from 'src/scenes/Home/TerrawareHomeView/CreateVirtualWalkthroughStep1Modal';

import VirtualWalkthroughMessages from './VirtualWalkthroughMessages';
import VirtualWalkthroughsMap from './VirtualWalkthroughsMap';
import VirtualWalkthroughsTable from './VirtualWalkthroughsTable';

export default function VirtualWalkthroughsView(): JSX.Element {
  const theme = useTheme();
  const { selectedOrganization } = useOrganization();
  const { strings } = useLocalization();

  const { data: mediaFiles = [] } = useSearchVirtualWalkthroughsQuery(selectedOrganization?.id ?? 0, {
    skip: !selectedOrganization,
  });

  const [pendingPlacementFile, setPendingPlacementFile] = useState<OrganizationVirtualWalkthrough | undefined>(
    undefined
  );
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleAddToMap = useCallback((file: OrganizationVirtualWalkthrough) => {
    setPendingPlacementFile(file);
  }, []);

  const handlePlacementComplete = useCallback(() => {
    setPendingPlacementFile(undefined);
  }, []);

  return (
    <TfMain>
      <ScrollToTop />
      <CreateVirtualWalkthroughStep1Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />
      <PageHeader
        back={true}
        backUrl={APP_PATHS.HOME}
        backName={strings.HOME}
        title={strings.VIRTUAL_WALKTHROUGHS}
        subtitle=''
        rightComponent={
          <Button
            id='create-virtual-walkthrough'
            label={strings.CREATE_VIRTUAL_WALKTHROUGH}
            icon='plus'
            onClick={() => setCreateModalOpen(true)}
            priority='primary'
            size='medium'
          />
        }
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(3) }}>
        {selectedOrganization && <VirtualWalkthroughMessages organizationId={selectedOrganization.id} />}
        <Box
          sx={{
            background: theme.palette.TwClrBg,
            borderRadius: '8px',
          }}
        >
          <VirtualWalkthroughsMap
            mediaFiles={mediaFiles}
            onPlacementComplete={handlePlacementComplete}
            organizationId={selectedOrganization?.id ?? 0}
            pendingPlacementFile={pendingPlacementFile}
          />
        </Box>
        {selectedOrganization && (
          <Card>
            <VirtualWalkthroughsTable
              mediaFiles={mediaFiles}
              onAddToMap={handleAddToMap}
              organizationId={selectedOrganization.id}
            />
          </Card>
        )}
      </Box>
    </TfMain>
  );
}
