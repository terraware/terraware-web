import { useCallback, useEffect, useRef } from 'react';

import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';

import { useTrackEvent } from './useTrackEvent';

// Fires MODAL_ABANDONED when the modal was actually visible to the user and
// then closed (or unmounted while open) without markSubmitted() being called
// first. Call markSubmitted() inside any successful-save path so a successful
// close is not counted as abandonment.
//
// `isOpen` is REQUIRED because most modals in this codebase stay mounted while
// their parent route is rendered, with an `open` prop controlling visibility.
// Without isOpen, the hook would fire false positives on every route
// navigation that unmounts a modal the user never actually opened. For modals
// that are conditionally rendered (only mounted while open), pass `true`.
//
// Closures shorter than a second are skipped to filter out React strict-mode
// double-mount in dev and instant open/close interactions.
//
// Returns a stable callback safe to include in useCallback/useEffect deps.
export const useTrackModalAbandonment = (modalName: string, isOpen: boolean): (() => void) => {
  const trackEvent = useTrackEvent();

  // Refs so the unmount cleanup reads the latest values regardless of when
  // the effect originally captured them.
  const trackEventRef = useRef(trackEvent);
  trackEventRef.current = trackEvent;
  const modalNameRef = useRef(modalName);
  modalNameRef.current = modalName;

  // null = modal is not currently open; number = timestamp of when isOpen became true.
  const openedAtRef = useRef<number | null>(null);
  const wasSubmittedRef = useRef(false);

  // Fires the abandonment event if the modal was open and not submitted.
  // Always clears the session state regardless.
  const fireAbandonment = useCallback(() => {
    const openedAt = openedAtRef.current;
    const wasSubmitted = wasSubmittedRef.current;
    openedAtRef.current = null;
    wasSubmittedRef.current = false;
    if (openedAt === null || wasSubmitted) {
      return;
    }
    const timeOpenSeconds = Math.round((Date.now() - openedAt) / 1000);
    if (timeOpenSeconds < 1) {
      return;
    }
    trackEventRef.current(MIXPANEL_EVENTS.MODAL_ABANDONED, {
      modal_name: modalNameRef.current,
      time_open_seconds: timeOpenSeconds,
    });
  }, []);

  // Track isOpen transitions. Each false → true starts a "session"; each
  // true → false ends one and may emit MODAL_ABANDONED.
  useEffect(() => {
    if (isOpen && openedAtRef.current === null) {
      openedAtRef.current = Date.now();
      wasSubmittedRef.current = false;
    } else if (!isOpen && openedAtRef.current !== null) {
      fireAbandonment();
    }
  }, [isOpen, fireAbandonment]);

  // Catch-all: fire on unmount if the modal was still open at unmount time
  // (e.g., user navigated away with the modal open).
  useEffect(() => {
    return () => {
      fireAbandonment();
    };
  }, [fireAbandonment]);

  return useCallback(() => {
    wasSubmittedRef.current = true;
  }, []);
};
