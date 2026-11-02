import { Facility, FacilityType } from 'src/types/Facility';
import { Organization } from 'src/types/Organization';
import { getAllNurseries, getAllSeedBanks } from 'src/utils/organization';

/**
 * Service for facility related functionality
 */

/**
 * Types exported from service
 */
type GetFacilityRequest = {
  organization: Organization;
  facilityId: number | string;
  type: FacilityType;
};

/**
 * get facility
 */
const getFacility = ({ organization, facilityId, type }: GetFacilityRequest): Facility | undefined => {
  if (type === 'Nursery') {
    return getAllNurseries(organization).find((n) => n?.id.toString() === facilityId.toString());
  } else if (type === 'Seed Bank') {
    return getAllSeedBanks(organization).find((n) => n?.id.toString() === facilityId.toString());
  }
};

/** Return true by default since we don't require setting the field in the facility view */
const facilityBuildStartedDateValid = (
  buildStart: string | undefined,
  buildComplete: string | undefined,
  opStart: string | undefined
) => {
  let beforeBuildCompletedConditionMet = true;
  let beforeOpStartedConditionMet = true;
  if (buildStart && buildComplete) {
    beforeBuildCompletedConditionMet = Date.parse(buildStart) <= Date.parse(buildComplete);
  }
  if (buildStart && opStart) {
    beforeOpStartedConditionMet = Date.parse(buildStart) <= Date.parse(opStart);
  }
  return beforeBuildCompletedConditionMet && beforeOpStartedConditionMet;
};

/** Return true by default since we don't require setting the field in the facility view */
const facilityBuildCompletedDateValid = (
  buildStart: string | undefined,
  buildComplete: string | undefined,
  opStart: string | undefined
) => {
  let afterStartConditionMet = true;
  let beforeOpStartedConditionMet = true;
  if (buildStart && buildComplete) {
    afterStartConditionMet = Date.parse(buildStart) <= Date.parse(buildComplete);
  }
  if (buildComplete && opStart) {
    beforeOpStartedConditionMet = Date.parse(buildComplete) <= Date.parse(opStart);
  }
  return afterStartConditionMet && beforeOpStartedConditionMet;
};

/** Return true by default since we don't require setting the field in the facility view */
const facilityOperationStartedDateValid = (
  buildStart: string | undefined,
  buildComplete: string | undefined,
  opStart: string | undefined
) => {
  let afterBuildStartedConditionMet = true;
  let afterBuildCompletedConditionMet = true;
  if (buildStart && opStart) {
    afterBuildStartedConditionMet = Date.parse(buildStart) <= Date.parse(opStart);
  }
  if (buildComplete && opStart) {
    afterBuildCompletedConditionMet = Date.parse(buildComplete) <= Date.parse(opStart);
  }
  return afterBuildStartedConditionMet && afterBuildCompletedConditionMet;
};

/**
 * Exported functions
 */
const FacilityService = {
  getFacility,
  facilityBuildStartedDateValid,
  facilityBuildCompletedDateValid,
  facilityOperationStartedDateValid,
};

export default FacilityService;
