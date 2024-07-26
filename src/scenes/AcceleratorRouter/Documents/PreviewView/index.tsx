import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';

import useNavigateTo from 'src/hooks/useNavigateTo';
import { selectGetDocument } from 'src/redux/features/documentProducer/documents/documentsSelector';
import { requestGetDocument } from 'src/redux/features/documentProducer/documents/documentsThunks';
import { useSelectorProcessor } from 'src/redux/hooks/useSelectorProcessor';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Document } from 'src/types/documentProducer/Document';

import PreviewDocument from './PreviewDocument';

export type PreviewProps = {
  docId?: number;
  close?: () => void;
};

export default function Preview({ docId, close }: PreviewProps) {
  const dispatch = useAppDispatch();
  // TODO snackbar had to be removed from the useEffect that creates the window, how do we want to alert if an error occurs creating the document?
  // const snackbar = useSnackbar();
  const { goToDocuments } = useNavigateTo();
  const { documentId: docIdParam } = useParams<{ documentId: string }>();

  const [newWindow, setNewWindow] = useState<Window | null>(null);
  const [containerEl, setContainerEl] = useState<HTMLElement | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [doc, setDoc] = useState<Document>();

  const id = docId ?? Number(docIdParam);

  const docSelect = useAppSelector(selectGetDocument(id));
  useSelectorProcessor(docSelect, setDoc, {
    handleError: true,
    onError: goToDocuments,
  });

  useEffect(() => {
    dispatch(requestGetDocument(id));
  }, [dispatch, id]);

  useEffect(() => {
    const win = window.open('/preview.html', '_blank');
    if (win) {
      win.addEventListener('load', () => {
        // successfully created window (tab); create a div to hold the document contents
        setNewWindow(win);
        setContainerEl(win.document.createElement('div'));
        win.focus();
      });
    }
  }, []);

  useEffect(() => {
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

      // This is a bit dirty, but it was the only way to get it to show up correctly every time in local dev
      // The page (including the table of contents) needs to be "done" by the time pagedjs runs, so the TOC needs
      // to be done executing
      window.setTimeout(() => {
        // attach the pagedjs polyfill script
        attachScript('js/paged-0.4.3.polyfill.min.js');
        // TODO is this value acceptable? Should we figure out another way to do this?
      }, 200);

      if (close) {
        newWindow.onbeforeunload = () => close();
      }
      setInitialized(true);
    }
  }, [newWindow, containerEl, close, initialized, doc]);

  if (newWindow === null || containerEl === null || !initialized || !doc) {
    return null;
  }

  return createPortal(<PreviewDocument doc={doc} />, containerEl);
}
