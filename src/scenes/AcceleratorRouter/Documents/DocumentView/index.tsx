import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Box } from '@mui/material';
import { BusySpinner, Button, Tab, Tabs } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import { Crumb } from 'src/components/BreadCrumbs';
import PageDialog from 'src/components/DocumentProducer/PageDialog';
import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import { selectGetDocument } from 'src/redux/features/documentProducer/documents/documentsSelector';
import {
  requestGetDocument,
  requestUpgradeManifest,
} from 'src/redux/features/documentProducer/documents/documentsThunks';
import { selectMethodology } from 'src/redux/features/documentProducer/methodologies/methodologiesSelector';
import { requestListMethodologies } from 'src/redux/features/documentProducer/methodologies/methodologiesThunks';
import { useSelectorProcessor } from 'src/redux/hooks/useSelectorProcessor';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Document } from 'src/types/documentProducer/Document';
import useStickyTabs from 'src/utils/useStickyTabs';

import DocumentActions from './DocumentActions';
import DocumentHistoryTab from './DocumentHistoryTab';
import DocumentMetadata from './DocumentMetadata';
import DocumentTab from './DocumentTab';
import DocumentVariablesTab from './DocumentVariablesTab';

export default function DocumentView(): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const dispatch = useAppDispatch();
  const { goToDocuments } = useNavigateTo();
  const { activeLocale } = useLocalization();
  const { documentId: documentIdParam } = useParams<{ documentId: string }>();
  const documentId = Number(documentIdParam);

  const [document, setDocument] = useState<Document>();
  const methodology = useAppSelector((state) => selectMethodology(state, document?.methodologyId ?? -1));

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const latestManifestId = useMemo(() => methodology?.variableManifestId ?? -1, [methodology]);

  const pddSelect = useAppSelector(selectGetDocument(documentId));

  useSelectorProcessor(pddSelect, setDocument, {
    handleError: true,
    onError: goToDocuments,
  });

  useEffect(() => {
    dispatch(requestListMethodologies);
  }, [dispatch]);

  const fetchPdd = useCallback(() => {
    dispatch(requestGetDocument(documentId));
  }, [dispatch, documentId]);

  useEffect(() => {
    fetchPdd();
  }, [fetchPdd]);

  useEffect(() => {
    if (document?.variableManifestId && document.variableManifestId < latestManifestId) {
      setShowUpgradeModal(true);
    }
  }, [document, methodology, latestManifestId]);

  const onUpgradeManifest = useCallback(async () => {
    if (documentId && latestManifestId) {
      await dispatch(
        requestUpgradeManifest({ id: `${documentId}`, payload: { variableManifestId: latestManifestId } })
      );
      fetchPdd();
    }
    setShowUpgradeModal(false);
  }, [dispatch, documentId, latestManifestId, fetchPdd]);

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

  const tabs: Tab[] = useMemo(
    () =>
      activeLocale && document
        ? [
            {
              id: 'document',
              label: strings.DOCUMENT,
              icon: 'iconParchment',
              children: <DocumentTab document={document} />,
            },
            {
              id: 'variables',
              label: strings.VARIABLES,
              icon: 'iconModule',
              children: <DocumentVariablesTab document={document} />,
            },
            {
              id: 'history',
              label: strings.HISTORY,
              icon: 'iconHistory',
              children: <DocumentHistoryTab document={document} />,
            },
          ]
        : [],
    [activeLocale, document]
  );

  const { activeTab, onTabChange } = useStickyTabs({
    defaultTab: 'document',
    tabs,
    viewIdentifier: 'accelerator-documents',
  });

  if (!document) {
    return <BusySpinner />;
  }

  return (
    <Page crumbs={crumbs}>
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
          <Button key='upgrade-manifest' label={strings.UPDATE} priority='primary' onClick={onUpgradeManifest} />,
        ]}
      />
      <Box
        display='flex'
        flexDirection={isMobile ? 'column' : 'row'}
        justifyContent='space-between'
        alignItems='flex-start'
      >
        <DocumentMetadata document={document} />
        <DocumentActions document={document} onPddUpdate={fetchPdd} />
      </Box>
      <Box marginTop={3} display='flex' flexDirection='row' flexGrow={1}>
        <Box display='flex' flexGrow={1}>
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
        </Box>
        <Box width='100px'>{/* add TOC here perhaps */}</Box>
      </Box>
    </Page>
  );
}
