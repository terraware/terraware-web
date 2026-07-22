import React, { useState } from 'react';

import { SeedFundReport } from 'src/types/SeedFundReport';

export default function useSDGProgress(
  report: SeedFundReport
): [string[], React.Dispatch<React.SetStateAction<string>>[]] {
  const sdgProgressStates: string[] = [];
  const setSdgProgressStates: React.Dispatch<React.SetStateAction<string>>[] = [];

  useGoal(sdgProgressStates, setSdgProgressStates, report, 0);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 1);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 2);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 3);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 4);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 5);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 6);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 7);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 8);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 9);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 10);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 11);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 12);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 13);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 14);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 15);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 16);

  return [sdgProgressStates, setSdgProgressStates];
}

function useGoal(
  progress: string[],
  setProgress: React.Dispatch<React.SetStateAction<string>>[],
  report: SeedFundReport,
  goalIndex: number
) {
  const [sdgProgress, setSdgProgress] = useState(
    report.annualDetails?.sustainableDevelopmentGoals?.find((s) => s.goal.toString() === (goalIndex + 1).toString())
      ?.progress ?? ''
  );
  progress.push(sdgProgress);
  setProgress.push(setSdgProgress);
}
