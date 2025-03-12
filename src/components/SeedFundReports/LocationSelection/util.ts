import { ReportNursery, ReportSeedBank } from 'src/types/Report';

export const buildStartedDateValid = (loc: ReportSeedBank | ReportNursery) => {
  let beforeBuildCompletedConditionMet = false;
  let beforeOpStartedConditionMet = false;
  if (loc.buildStartedDate && loc.buildCompletedDate) {
    beforeBuildCompletedConditionMet = Date.parse(loc.buildStartedDate) <= Date.parse(loc.buildCompletedDate);
  }
  if (loc.buildStartedDate && loc.operationStartedDate) {
    beforeOpStartedConditionMet = Date.parse(loc.buildStartedDate) <= Date.parse(loc.operationStartedDate);
  }
  return beforeBuildCompletedConditionMet && beforeOpStartedConditionMet;
};

export const buildCompletedDateValid = (loc: ReportSeedBank | ReportNursery) => {
  let afterStartConditionMet = false;
  let beforeOpStartedConditionMet = false;
  if (loc.buildStartedDate && loc.buildCompletedDate) {
    afterStartConditionMet = Date.parse(loc.buildStartedDate) <= Date.parse(loc.buildCompletedDate);
  }
  if (loc.buildCompletedDate && loc.operationStartedDate) {
    beforeOpStartedConditionMet = Date.parse(loc.buildCompletedDate) <= Date.parse(loc.operationStartedDate);
  }
  return afterStartConditionMet && beforeOpStartedConditionMet;
};

export const operationStartedDateValid = (loc: ReportSeedBank | ReportNursery) => {
  let afterBuildStartedConditionMet = false;
  let afterBuildCompletedConditionMet = false;
  if (loc.buildStartedDate && loc.operationStartedDate) {
    afterBuildStartedConditionMet = Date.parse(loc.buildStartedDate) <= Date.parse(loc.operationStartedDate);
  }
  if (loc.buildCompletedDate && loc.operationStartedDate) {
    afterBuildCompletedConditionMet = Date.parse(loc.buildCompletedDate) <= Date.parse(loc.operationStartedDate);
  }
  return afterBuildStartedConditionMet && afterBuildCompletedConditionMet;
};

export const transformNumericValue = (value: any, { min = -Infinity, max = Infinity }): number | null => {
  return value === '' ? null : Math.min(max, Math.max(min, Math.floor(value as number)));
};
