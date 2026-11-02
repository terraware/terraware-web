/** Return true by default since we don't require setting the field in the facility view */
export const facilityBuildStartedDateValid = (
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
export const facilityBuildCompletedDateValid = (
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
export const facilityOperationStartedDateValid = (
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
