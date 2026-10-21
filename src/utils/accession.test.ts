import { ACCESSION_2_STATES, AccessionState } from 'src/types/Accession';

import { getTransitionToStates } from './accession';

describe('getTransitionToStates', () => {
  it('should get correct transition states for an accession awaiting check-in', () => {
    expect(getTransitionToStates('Awaiting Check-In')).toEqual([
      'Awaiting Processing',
      'Processing',
      'Drying',
      'In Storage',
      'Used Up',
    ]);
  });

  it('should get correct transition states for an Active accession', () => {
    (['Awaiting Processing', 'Processing', 'Drying', 'In Storage'] as AccessionState[]).forEach((state) => {
      expect(getTransitionToStates(state)).toEqual(['Awaiting Processing', 'Processing', 'Drying', 'In Storage']);
    });
  });

  it('should get correct transition states for accessions that are not active or awaiting check-in', () => {
    expect(getTransitionToStates('Used Up')).toEqual(ACCESSION_2_STATES);
  });
});
