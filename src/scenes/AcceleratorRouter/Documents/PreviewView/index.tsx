import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';

import PageContent from 'src/components/DocumentProducer/PageContent';
import Page from 'src/components/Page';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { selectGetDocument } from 'src/redux/features/documentProducer/documents/documentsSelector';
import { requestGetDocument } from 'src/redux/features/documentProducer/documents/documentsThunks';
import { useSelectorProcessor } from 'src/redux/hooks/useSelectorProcessor';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Document } from 'src/types/documentProducer/Document';
import useQuery from 'src/utils/useQuery';
import useSnackbar from 'src/utils/useSnackbar';

import PreviewDocument from './PreviewDocument';

export type PreviewProps = {
  docId?: number;
  close?: () => void;
};

export default function Preview({ docId, close }: PreviewProps) {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const { goToDocuments } = useNavigateTo();
  const { documentId: docIdParam } = useParams<{ documentId: string }>();
  const query = useQuery();

  const [newWindow, setNewWindow] = useState<Window | null>(null);
  const [containerEl, setContainerEl] = useState<HTMLElement | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [doc, setDoc] = useState<Document>();

  const id = docId ?? Number(docIdParam);
  const viewInWindow = query.get('viewInWindow') === 'true';

  const docSelect = useAppSelector(selectGetDocument(id));
  useSelectorProcessor(docSelect, setDoc, {
    handleError: true,
    onError: goToDocuments,
  });

  const fetchDoc = useCallback(() => {
    // TODO: get version # from query params and use in API call
    dispatch(requestGetDocument(id));
  }, [dispatch, id]);

  useEffect(() => {
    fetchDoc();
  }, [fetchDoc]);

  useEffect(() => {
    if (viewInWindow) {
      return;
    }

    const win = window.open('/preview.html', '_blank');
    if (win) {
      win.addEventListener('load', () => {
        // successfully created window (tab); create a div to hold the document contents
        setNewWindow(win);
        setContainerEl(document.createElement('div'));
        win.focus();
      });
    } else {
      // failed to open window; show an error
      snackbar.toastError(strings.PREVIEW_ERROR);
    }
  }, [snackbar, viewInWindow]);

  useEffect(() => {
    if (viewInWindow) {
      return;
    }

    if (newWindow && containerEl && !initialized && doc) {
      // attach the container div to the new window
      newWindow.document.body.appendChild(containerEl);

      const attachScript = (path: string) => {
        const script = document.createElement('script');
        script.async = false;
        script.src = path;
        newWindow.document.head.appendChild(script);
      };

      // attach the table-of-contents script
      attachScript('js/table-of-contents.js');

      // attach the pagedjs polyfill script
      attachScript('js/paged-0.4.3.polyfill.min.js');

      if (close) {
        newWindow.onbeforeunload = () => close();
      }
      setInitialized(true);
    }
  }, [newWindow, containerEl, close, initialized, doc, viewInWindow]);

  useEffect(() => () => newWindow?.close(), [newWindow]);

  if (viewInWindow && doc) {
    return (
      <Page title={strings.PREVIEW}>
        <PageContent styles={{ width: '100%', margin: 'auto' }}>
          <PreviewDocument doc={doc} />;
        </PageContent>
      </Page>
    );
  }

  if (newWindow === null || containerEl === null || !initialized || !doc) {
    return null;
  }

  return createPortal(<PreviewDocument doc={doc} />, containerEl);
}
