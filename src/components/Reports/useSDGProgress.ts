import React, { useState } from 'react';
import useDebounce from 'src/utils/useDebounce';
import { Report, SDG } from 'src/types/Report';

const DEBOUNCE_TIME_MS = 500;

export default function useSDGProgress(
  report: Report,
  updateSDGProgress?: (index: number, value: string) => void
): [string[], React.Dispatch<React.SetStateAction<string>>[]] {
  const sdgProgressStates: string[] = [];
  const setSdgProgressStates: React.Dispatch<React.SetStateAction<string>>[] = [];

  useGoal(sdgProgressStates, setSdgProgressStates, report, 0, updateSDGProgress);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 1, updateSDGProgress);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 2, updateSDGProgress);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 3, updateSDGProgress);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 4, updateSDGProgress);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 5, updateSDGProgress);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 6, updateSDGProgress);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 7, updateSDGProgress);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 8, updateSDGProgress);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 9, updateSDGProgress);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 10, updateSDGProgress);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 11, updateSDGProgress);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 12, updateSDGProgress);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 13, updateSDGProgress);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 14, updateSDGProgress);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 15, updateSDGProgress);
  useGoal(sdgProgressStates, setSdgProgressStates, report, 16, updateSDGProgress);

  return [sdgProgressStates, setSdgProgressStates];
}

function useGoal(
  progress: string[],
  setProgress: React.Dispatch<React.SetStateAction<string>>[],
  report: Report,
  goalIndex: number,
  updateSDGProgress?: (index: number, value: string) => void
) {
  const [sdgProgress, setSdgProgress] = useState(
    report.annualDetails?.sustainableDevelopmentGoals?.find((s) => s.goal === SDG[goalIndex])?.progress ?? ''
  );
  progress.push(sdgProgress);
  setProgress.push(setSdgProgress);
  useDebounce(sdgProgress, DEBOUNCE_TIME_MS, (value) => {
    const index = report.annualDetails?.sustainableDevelopmentGoals?.findIndex((s) => s.goal === SDG[goalIndex]);
    if (updateSDGProgress && index !== undefined && index >= 0) {
      updateSDGProgress(index, value);
    }
  });
}
