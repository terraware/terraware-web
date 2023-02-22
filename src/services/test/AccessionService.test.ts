import AccessionService from '../AccessionService';
import { AccessionState, ACCESSION_2_STATES } from 'src/types/Accession';

describe('Accession service', () => {
  describe('accession state utilities', () => {
    it('should get correct transition states for an accession awaiting check-in', () => {
      expect(AccessionService.getTransitionToStates('Awaiting Check-In')).toEqual([
        'Awaiting Processing',
        'Processing',
        'Drying',
        'In Storage',
        'Used Up',
      ]);
    });

    it('should get correct transition states for an Active accession', () => {
      (['Awaiting Processing', 'Processing', 'Drying', 'In Storage'] as AccessionState[]).forEach((state) => {
        expect(AccessionService.getTransitionToStates(state)).toEqual([
          'Awaiting Processing',
          'Processing',
          'Drying',
          'In Storage',
        ]);
      });
    });

    it('should get correct transition states for accessions that are not active or awaiting check-in', () => {
      expect(AccessionService.getTransitionToStates('Used Up')).toEqual(ACCESSION_2_STATES);
    });
  });

  describe('coordinates parser', () => {
    it('should skip incorrect coordinates', () => {
      expect(AccessionService.getParsedCoords(['fail'])).toEqual([]);
    });

    it('should parse supported input formats of coordinates', () => {
      const geoLocation = { latitude: 40.123, longitude: -74.123 };
      const expected = new Array(6);
      expected.fill(geoLocation);

      expect(
        AccessionService.getParsedCoords([
          '40.123, -74.123',
          '40.123 -74.123',
          '144442800, -266842800',
          '40.123N74.123W',
          'N 40 7.38 W 74 7.38',
          '40.123N 74.123W',
        ])
      ).toEqual(expected);
    });
  });
});
