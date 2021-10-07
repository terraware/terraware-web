import { selector } from 'recoil';
import { getAllFacilities } from '../../../api/seeds/facilities';

/**
 * Placeholder implementation of a selector to get the current facility ID.
 *
 * Currently, this lists all the user's available facilities and picks the
 * first seed bank it finds.
 *
 * Known problems with this:
 *
 * - If the user doesn't have access to any seed banks, there's no reasonable
 *   default we can use, so we just set the facility ID to 0 which should
 *   always be invalid. This will cause all the seed bank API calls to fail.
 *   Ideally we'd avoid even showing any seed bank UI in that case.
 * - This is only useful for the seed bank part of the app. We will want UI
 *   for other kinds of facilities too.
 * - If the user has access to more than one seed bank, this will just pick
 *   one arbitrarily. In the absence of any UI to choose a seed bank, it's
 *   unclear what else this should do.
 */
const facilityIdSelector = selector<number>({
  key: 'facilityId',
  get: async ({ get }) => {
    const facilities = await getAllFacilities();
    const seedBank = facilities.find((facility) => facility.type === 'Seed Bank');

    return seedBank?.id || 0;
  },
});

export { facilityIdSelector };
