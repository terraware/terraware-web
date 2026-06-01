import { useCallback } from 'react';
import { useMixpanel } from 'react-mixpanel-browser';

import { MIXPANEL_EVENTS, MixpanelEventPropertyMap } from 'src/mixpanelEvents';
import { useOrganization } from 'src/providers';

// For events listed in MixpanelEventPropertyMap, properties are required and
// type-checked against the event's declared shape. For events not listed there
// (legacy events, or events whose shape is still being designed), properties are
// optional and untyped.
export type TrackEventFn = <E extends MIXPANEL_EVENTS>(
  ...args: E extends keyof MixpanelEventPropertyMap
    ? [event: E, properties: MixpanelEventPropertyMap[E]]
    : [event: E, properties?: Record<string, unknown>]
) => void;

// Wraps mixpanel.track() with the organization context every event should carry,
// so call sites only need to pass event-specific properties. Returns a stable
// callback safe to include in useEffect / useCallback dependency arrays.
//
// Returns a no-op when the user has not consented to analytics cookies — the
// underlying mixpanel instance is undefined in that case (see App.tsx consent
// gate). Call sites do not need to guard.
export const useTrackEvent = (): TrackEventFn => {
  const mixpanel = useMixpanel();
  const { selectedOrganization } = useOrganization();

  return useCallback(
    (event: MIXPANEL_EVENTS, properties?: Record<string, unknown>) => {
      mixpanel?.track(event, {
        organization_id: selectedOrganization?.id,
        organization_role: selectedOrganization?.role,
        ...properties,
      });
    },
    [mixpanel, selectedOrganization]
  ) as TrackEventFn;
};
