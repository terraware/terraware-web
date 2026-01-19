import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import { BusySpinner, Button, Tab, Tabs } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import { Crumb } from 'src/components/BreadCrumbs';
import PageDialog from 'src/components/DocumentProducer/PageDialog';
import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useDocumentProducerData } from 'src/providers/DocumentProducer/Context';
import { requestUpgradeManifest } from 'src/redux/features/documentProducer/documents/documentsThunks';
import { useAppDispatch } from 'src/redux/store';
import strings from 'src/strings';
import useStickyTabs from 'src/utils/useStickyTabs';

import DocumentActions from './DocumentActions';
import DocumentHistoryTab from './DocumentHistoryTab';
import DocumentMetadata from './DocumentMetadata';
import DocumentOutlinePanel from './DocumentOutlinePanel';
import DocumentTab from './DocumentTab';
import DocumentVariablesTab from './DocumentVariablesTab';

export default function DocumentView(): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const { document, documentId, documentTemplate, reload } = useDocumentProducerData();

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [outlinePanelOpen, setOutlinePanelOpen] = useState(true);

  const currentManifestId = document?.variableManifestId;
  const latestManifestId = documentTemplate?.variableManifestId;

  useEffect(() => {
    if (!currentManifestId || !latestManifestId) {
      return;
    }

    if (currentManifestId < latestManifestId) {
      setShowUpgradeModal(true);
    } else if (currentManifestId === latestManifestId) {
      setShowUpgradeModal(false);
    }
  }, [currentManifestId, latestManifestId]);

  const onUpgradeManifest = useCallback(async () => {
    if (documentId && latestManifestId) {
      await dispatch(
        requestUpgradeManifest({ id: `${documentId}`, payload: { variableManifestId: latestManifestId } })
      );
      reload();
    }

    setShowUpgradeModal(false);
  }, [dispatch, documentId, latestManifestId, reload]);

  const onDismissUpgradeManifest = useCallback(() => {
    setShowUpgradeModal(false);
  }, []);

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? strings.DOCUMENTS : '',
        to: APP_PATHS.ACCELERATOR_DOCUMENT_PRODUCER_DOCUMENTS,
      },
    ],
    [activeLocale]
  );

  const tabs: Tab[] = useMemo(() => {
    if (!activeLocale || !document) {
      return [];
    }

    return [
      {
        id: 'document',
        label: strings.DOCUMENT,
        icon: 'iconParchment',
        children: <DocumentTab />,
      },
      {
        id: 'variables',
        label: strings.VARIABLES,
        icon: 'iconModule',
        children: <DocumentVariablesTab />,
      },
      {
        id: 'history',
        label: strings.HISTORY,
        icon: 'iconHistory',
        children: <DocumentHistoryTab />,
      },
    ];
  }, [activeLocale, document]);

  const { activeTab, onChangeTab } = useStickyTabs({
    defaultTab: 'document',
    tabs,
    viewIdentifier: 'accelerator-documents',
  });

  if (!(document && documentTemplate)) {
    return <BusySpinner />;
  }

  return (
    <Page crumbs={crumbs} contentStyle={{ 'flex-direction': 'column' }}>
      <PageDialog
        title={strings.NEW_TEMPLATE_MODAL_TITLE}
        message={strings.NEW_TEMPLATE_MODAL_DESCRIPTION}
        size='medium'
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        middleButtons={[
          <Button
            key='dismiss-upgrade'
            label={strings.NOT_YET}
            priority='secondary'
            onClick={onDismissUpgradeManifest}
          />,
          <Button
            key='upgrade-manifest'
            label={strings.UPDATE}
            priority='primary'
            onClick={() => void onUpgradeManifest()}
          />,
        ]}
      />
      <Box
        display='flex'
        flexDirection={isMobile ? 'column' : 'row'}
        justifyContent='space-between'
        alignItems='flex-start'
      >
        <DocumentMetadata document={document} documentTemplate={documentTemplate} />
        <DocumentActions document={document} onDocumentUpdate={reload} />
      </Box>
      <Box marginTop={3} display='flex' flexDirection='row' flexGrow={1}>
        <Box display='flex' flexGrow={1}>
          <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs} />
        </Box>
        <Box>
          {activeTab === 'document' && <DocumentOutlinePanel open={outlinePanelOpen} setOpen={setOutlinePanelOpen} />}
        </Box>
      </Box>
    </Page>
  );
}
