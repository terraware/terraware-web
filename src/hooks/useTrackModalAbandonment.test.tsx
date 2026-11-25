import React from 'react';

import { rs } from '@rstest/core';
import { act } from '@testing-library/react';

import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { renderWithProviders } from 'src/test-utils';

import { useTrackModalAbandonment } from './useTrackModalAbandonment';

const { track } = rs.hoisted(() => ({ track: rs.fn() }));
rs.mock('react-mixpanel-browser', () => ({ useMixpanel: () => ({ track }) }));

const MODAL_NAME = 'test_modal';
const START = 1_000_000;

const trackedEvents = (event: MIXPANEL_EVENTS) =>
  track.mock.calls.filter(([name]) => name === event).map(([, properties]) => properties);

const advanceClock = (ms: number) => rs.mocked(Date.now).mockReturnValue(START + ms);

const markSubmittedRef: { current?: () => void } = {};

const Probe = ({ isOpen }: { isOpen: boolean }) => {
  markSubmittedRef.current = useTrackModalAbandonment(MODAL_NAME, isOpen);
  return null;
};

describe('useTrackModalAbandonment', () => {
  let originalUrl: string;

  beforeEach(() => {
    originalUrl = window.location.pathname + window.location.search + window.location.hash;
    track.mockClear();
    markSubmittedRef.current = undefined;
    rs.spyOn(Date, 'now').mockReturnValue(START);
  });

  afterEach(() => {
    window.history.pushState({}, '', originalUrl);
    rs.restoreAllMocks();
  });

  it('credits an abandonment to the page the modal opened on when the user navigates away', () => {
    window.history.pushState({}, '', '/species');
    const { unmount } = renderWithProviders(<Probe isOpen />);

    advanceClock(5000);
    window.history.pushState({}, '', '/home');
    unmount();

    expect(trackedEvents(MIXPANEL_EVENTS.MODAL_ABANDONED)).toEqual([
      expect.objectContaining({ modal_name: MODAL_NAME, time_open_seconds: 5, product_area: 'Species' }),
    ]);
  });

  it('reports an abandonment with the opening page area when the modal is closed without submitting', () => {
    window.history.pushState({}, '', '/species');
    const { rerender } = renderWithProviders(<Probe isOpen />);

    advanceClock(3000);
    rerender(<Probe isOpen={false} />);

    expect(trackedEvents(MIXPANEL_EVENTS.MODAL_ABANDONED)).toEqual([
      expect.objectContaining({ modal_name: MODAL_NAME, time_open_seconds: 3, product_area: 'Species' }),
    ]);
  });

  it('does not report an abandonment when the modal was submitted before closing', () => {
    window.history.pushState({}, '', '/species');
    const { rerender } = renderWithProviders(<Probe isOpen />);

    advanceClock(3000);
    act(() => markSubmittedRef.current?.());
    rerender(<Probe isOpen={false} />);

    expect(trackedEvents(MIXPANEL_EVENTS.MODAL_ABANDONED)).toEqual([]);
  });

  it('does not report an abandonment when the modal closes within a second', () => {
    window.history.pushState({}, '', '/species');
    const { rerender } = renderWithProviders(<Probe isOpen />);

    advanceClock(400);
    rerender(<Probe isOpen={false} />);

    expect(trackedEvents(MIXPANEL_EVENTS.MODAL_ABANDONED)).toEqual([]);
  });

  it('reports the modal name when the modal opens', () => {
    renderWithProviders(<Probe isOpen />);

    expect(trackedEvents(MIXPANEL_EVENTS.MODAL_OPENED)).toEqual([expect.objectContaining({ modal_name: MODAL_NAME })]);
  });
});
