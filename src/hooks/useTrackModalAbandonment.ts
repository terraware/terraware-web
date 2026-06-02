import { useCallback, useEffect, useRef } from 'react';

import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';

import { useTrackEvent } from './useTrackEvent';

// Fires MODAL_ABANDONED on the component's unmount unless the returned
// markSubmitted() has been called first. Call markSubmitted() inside any
// successful-save path so the resulting close/unmount is not counted as
// abandonment. Closures of less than a second are skipped to filter out React
// strict-mode double-mount in dev as well as no-op open/close interactions.
//
// Returns a stable callback safe to include in useCallback/useEffect deps.
export const useTrackModalAbandonment = (modalName: string): (() => void) => {
  const trackEvent = useTrackEvent();

  // Refs so the unmount cleanup reads the latest values regardless of when
  // the effect originally captured them.
  const wasSubmittedRef = useRef(false);
  const trackEventRef = useRef(trackEvent);
  trackEventRef.current = trackEvent;
  const modalNameRef = useRef(modalName);
  modalNameRef.current = modalName;

  useEffect(() => {
    const mountTime = Date.now();
    return () => {
      if (wasSubmittedRef.current) {
        return;
      }
      const timeOpenSeconds = Math.round((Date.now() - mountTime) / 1000);
      if (timeOpenSeconds < 1) {
        return;
      }
      trackEventRef.current(MIXPANEL_EVENTS.MODAL_ABANDONED, {
        modal_name: modalNameRef.current,
        time_open_seconds: timeOpenSeconds,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return useCallback(() => {
    wasSubmittedRef.current = true;
  }, []);
};
