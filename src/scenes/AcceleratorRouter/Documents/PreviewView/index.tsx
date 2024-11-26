import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { useDocumentProducerData } from 'src/providers/DocumentProducer/Context';
import { selectProject } from 'src/redux/features/projects/projectsSelectors';
import { requestProject } from 'src/redux/features/projects/projectsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';

import PreviewDocument from './PreviewDocument';

export type PreviewProps = {
  close?: () => void;
};

export default function Preview({ close }: PreviewProps) {
  const dispatch = useAppDispatch();
  const { document: doc, projectId } = useDocumentProducerData();

  const [newWindow, setNewWindow] = useState<Window | null>(null);
  const [containerEl, setContainerEl] = useState<HTMLElement | null>(null);
  const [initialized, setInitialized] = useState(false);

  const project = useAppSelector(selectProject(projectId));

  useEffect(() => {
    if (projectId !== -1) {
      dispatch(requestProject(projectId));
    }
  }, [dispatch, projectId]);

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

  if (newWindow === null || containerEl === null || !initialized || !doc || !project) {
    return null;
  }

  return createPortal(<PreviewDocument projectName={project.name} />, containerEl);
}
