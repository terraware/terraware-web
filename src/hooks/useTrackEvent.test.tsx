import React from 'react';

import { rs } from '@rstest/core';

import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { buildOrganization, renderWithProviders } from 'src/test-utils';

import { TrackEventFn, useTrackEvent } from './useTrackEvent';

const { track, mixpanel } = rs.hoisted(() => {
  const trackFn = rs.fn();
  return { track: trackFn, mixpanel: { current: { track: trackFn } as { track: typeof trackFn } | undefined } };
});
rs.mock('react-mixpanel-browser', () => ({ useMixpanel: () => mixpanel.current }));

const EVENT = MIXPANEL_EVENTS.TOP_BAR_HOME_CLICKED;

const trackEventRef: { current?: TrackEventFn } = {};

const Probe = () => {
  trackEventRef.current = useTrackEvent();
  return null;
};

const trackEvent = (properties?: Record<string, unknown>) => trackEventRef.current!(EVENT, properties);

const trackedProperties = () => track.mock.calls.filter(([name]) => name === EVENT).map(([, properties]) => properties);

describe('useTrackEvent', () => {
  let originalUrl: string;

  beforeEach(() => {
    originalUrl = window.location.pathname + window.location.search + window.location.hash;
    track.mockClear();
    mixpanel.current = { track };
    trackEventRef.current = undefined;
  });

  afterEach(() => {
    window.history.pushState({}, '', originalUrl);
    rs.restoreAllMocks();
  });

  it('attributes an event to the product area of the current page', () => {
    window.history.pushState({}, '', '/accessions/12');
    renderWithProviders(<Probe />);

    trackEvent();

    expect(trackedProperties()).toEqual([expect.objectContaining({ product_area: 'Seed Bank' })]);
  });

  it('uses the page the user is on when the event is tracked, not when the hook was rendered', () => {
    window.history.pushState({}, '', '/species');
    renderWithProviders(<Probe />);

    trackEvent();
    window.history.pushState({}, '', '/inventory');
    trackEvent();

    expect(trackedProperties()).toEqual([
      expect.objectContaining({ product_area: 'Species' }),
      expect.objectContaining({ product_area: 'Nursery' }),
    ]);
  });

  it('lets the caller override the product area', () => {
    window.history.pushState({}, '', '/accessions/12');
    renderWithProviders(<Probe />);

    trackEvent({ product_area: 'Species' });

    expect(trackedProperties()).toEqual([expect.objectContaining({ product_area: 'Species' })]);
  });

  it('includes the selected organization and the caller properties', () => {
    renderWithProviders(<Probe />, {
      organization: { selectedOrganization: buildOrganization({ id: 42, role: 'Manager' }) },
    });

    trackEvent({ source: 'test' });

    expect(trackedProperties()).toEqual([
      expect.objectContaining({ organization_id: 42, organization_role: 'Manager', source: 'test' }),
    ]);
  });

  it('does nothing when the user has not consented to analytics', () => {
    mixpanel.current = undefined;
    renderWithProviders(<Probe />);

    expect(() => trackEvent({ source: 'test' })).not.toThrow();
    expect(track).not.toHaveBeenCalled();
  });
});
