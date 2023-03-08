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

  // 1. NoPoverty
  const [sdgProgress0, setSdgProgress0] = useState(
    report.annualDetails?.sustainableDevelopmentGoals?.find((s) => s.goal === SDG[0])?.progress ?? ''
  );
  sdgProgressStates.push(sdgProgress0);
  setSdgProgressStates.push(setSdgProgress0);
  useDebounce(sdgProgress0, DEBOUNCE_TIME_MS, (value) => {
    const index = report.annualDetails?.sustainableDevelopmentGoals?.findIndex((s) => s.goal === SDG[0]);
    if (updateSDGProgress && index !== undefined && index >= 0) {
      updateSDGProgress(index, value);
    }
  });

  // 2. ZeroHunger
  const [sdgProgress1, setSdgProgress1] = useState(
    report.annualDetails?.sustainableDevelopmentGoals?.find((s) => s.goal === SDG[1])?.progress ?? ''
  );
  sdgProgressStates.push(sdgProgress1);
  setSdgProgressStates.push(setSdgProgress1);
  useDebounce(sdgProgress1, DEBOUNCE_TIME_MS, (value) => {
    const index = report.annualDetails?.sustainableDevelopmentGoals?.findIndex((s) => s.goal === SDG[1]);
    if (updateSDGProgress && index !== undefined && index >= 0) {
      updateSDGProgress(index, value);
    }
  });

  // 3. GoodHealth
  const [sdgProgress2, setSdgProgress2] = useState(
    report.annualDetails?.sustainableDevelopmentGoals?.find((s) => s.goal === SDG[2])?.progress ?? ''
  );
  sdgProgressStates.push(sdgProgress2);
  setSdgProgressStates.push(setSdgProgress2);
  useDebounce(sdgProgress2, DEBOUNCE_TIME_MS, (value) => {
    const index = report.annualDetails?.sustainableDevelopmentGoals?.findIndex((s) => s.goal === SDG[2]);
    if (updateSDGProgress && index !== undefined && index >= 0) {
      updateSDGProgress(index, value);
    }
  });

  // 4. QualityEducation
  const [sdgProgress3, setSdgProgress3] = useState(
    report.annualDetails?.sustainableDevelopmentGoals?.find((s) => s.goal === SDG[3])?.progress ?? ''
  );
  sdgProgressStates.push(sdgProgress3);
  setSdgProgressStates.push(setSdgProgress3);
  useDebounce(sdgProgress3, DEBOUNCE_TIME_MS, (value) => {
    const index = report.annualDetails?.sustainableDevelopmentGoals?.findIndex((s) => s.goal === SDG[3]);
    if (updateSDGProgress && index !== undefined && index >= 0) {
      updateSDGProgress(index, value);
    }
  });

  // 5. GenderEquality
  const [sdgProgress4, setSdgProgress4] = useState(
    report.annualDetails?.sustainableDevelopmentGoals?.find((s) => s.goal === SDG[4])?.progress ?? ''
  );
  sdgProgressStates.push(sdgProgress4);
  setSdgProgressStates.push(setSdgProgress4);
  useDebounce(sdgProgress4, DEBOUNCE_TIME_MS, (value) => {
    const index = report.annualDetails?.sustainableDevelopmentGoals?.findIndex((s) => s.goal === SDG[4]);
    if (updateSDGProgress && index !== undefined && index >= 0) {
      updateSDGProgress(index, value);
    }
  });

  // 6. CleanWater
  const [sdgProgress5, setSdgProgress5] = useState(
    report.annualDetails?.sustainableDevelopmentGoals?.find((s) => s.goal === SDG[5])?.progress ?? ''
  );
  sdgProgressStates.push(sdgProgress5);
  setSdgProgressStates.push(setSdgProgress5);
  useDebounce(sdgProgress5, DEBOUNCE_TIME_MS, (value) => {
    const index = report.annualDetails?.sustainableDevelopmentGoals?.findIndex((s) => s.goal === SDG[5]);
    if (updateSDGProgress && index !== undefined && index >= 0) {
      updateSDGProgress(index, value);
    }
  });

  // 7. AffordableEnergy
  const [sdgProgress6, setSdgProgress6] = useState(
    report.annualDetails?.sustainableDevelopmentGoals?.find((s) => s.goal === SDG[6])?.progress ?? ''
  );
  sdgProgressStates.push(sdgProgress6);
  setSdgProgressStates.push(setSdgProgress6);
  useDebounce(sdgProgress6, DEBOUNCE_TIME_MS, (value) => {
    const index = report.annualDetails?.sustainableDevelopmentGoals?.findIndex((s) => s.goal === SDG[6]);
    if (updateSDGProgress && index !== undefined && index >= 0) {
      updateSDGProgress(index, value);
    }
  });

  // 8. DecentWork
  const [sdgProgress7, setSdgProgress7] = useState(
    report.annualDetails?.sustainableDevelopmentGoals?.find((s) => s.goal === SDG[7])?.progress ?? ''
  );
  sdgProgressStates.push(sdgProgress7);
  setSdgProgressStates.push(setSdgProgress7);
  useDebounce(sdgProgress7, DEBOUNCE_TIME_MS, (value) => {
    const index = report.annualDetails?.sustainableDevelopmentGoals?.findIndex((s) => s.goal === SDG[7]);
    if (updateSDGProgress && index !== undefined && index >= 0) {
      updateSDGProgress(index, value);
    }
  });

  // 9. Industry
  const [sdgProgress8, setSdgProgress8] = useState(
    report.annualDetails?.sustainableDevelopmentGoals?.find((s) => s.goal === SDG[8])?.progress ?? ''
  );
  sdgProgressStates.push(sdgProgress8);
  setSdgProgressStates.push(setSdgProgress8);
  useDebounce(sdgProgress8, DEBOUNCE_TIME_MS, (value) => {
    const index = report.annualDetails?.sustainableDevelopmentGoals?.findIndex((s) => s.goal === SDG[8]);
    if (updateSDGProgress && index !== undefined && index >= 0) {
      updateSDGProgress(index, value);
    }
  });

  // 10. ReducedInequalities
  const [sdgProgress9, setSdgProgress9] = useState(
    report.annualDetails?.sustainableDevelopmentGoals?.find((s) => s.goal === SDG[9])?.progress ?? ''
  );
  sdgProgressStates.push(sdgProgress9);
  setSdgProgressStates.push(setSdgProgress9);
  useDebounce(sdgProgress9, DEBOUNCE_TIME_MS, (value) => {
    const index = report.annualDetails?.sustainableDevelopmentGoals?.findIndex((s) => s.goal === SDG[9]);
    if (updateSDGProgress && index !== undefined && index >= 0) {
      updateSDGProgress(index, value);
    }
  });

  // 11. SustainableCities
  const [sdgProgress10, setSdgProgress10] = useState(
    report.annualDetails?.sustainableDevelopmentGoals?.find((s) => s.goal === SDG[10])?.progress ?? ''
  );
  sdgProgressStates.push(sdgProgress10);
  setSdgProgressStates.push(setSdgProgress10);
  useDebounce(sdgProgress10, DEBOUNCE_TIME_MS, (value) => {
    const index = report.annualDetails?.sustainableDevelopmentGoals?.findIndex((s) => s.goal === SDG[10]);
    if (updateSDGProgress && index !== undefined && index >= 0) {
      updateSDGProgress(index, value);
    }
  });

  // 12. ResponsibleConsumption
  const [sdgProgress11, setSdgProgress11] = useState(
    report.annualDetails?.sustainableDevelopmentGoals?.find((s) => s.goal === SDG[11])?.progress ?? ''
  );
  sdgProgressStates.push(sdgProgress11);
  setSdgProgressStates.push(setSdgProgress11);
  useDebounce(sdgProgress11, DEBOUNCE_TIME_MS, (value) => {
    const index = report.annualDetails?.sustainableDevelopmentGoals?.findIndex((s) => s.goal === SDG[11]);
    if (updateSDGProgress && index !== undefined && index >= 0) {
      updateSDGProgress(index, value);
    }
  });

  // 13. ClimateAction
  const [sdgProgress12, setSdgProgress12] = useState(
    report.annualDetails?.sustainableDevelopmentGoals?.find((s) => s.goal === SDG[12])?.progress ?? ''
  );
  sdgProgressStates.push(sdgProgress12);
  setSdgProgressStates.push(setSdgProgress12);
  useDebounce(sdgProgress12, DEBOUNCE_TIME_MS, (value) => {
    const index = report.annualDetails?.sustainableDevelopmentGoals?.findIndex((s) => s.goal === SDG[12]);
    if (updateSDGProgress && index !== undefined && index >= 0) {
      updateSDGProgress(index, value);
    }
  });

  // 14. LifeBelowWater
  const [sdgProgress13, setSdgProgress13] = useState(
    report.annualDetails?.sustainableDevelopmentGoals?.find((s) => s.goal === SDG[13])?.progress ?? ''
  );
  sdgProgressStates.push(sdgProgress13);
  setSdgProgressStates.push(setSdgProgress13);
  useDebounce(sdgProgress13, DEBOUNCE_TIME_MS, (value) => {
    const index = report.annualDetails?.sustainableDevelopmentGoals?.findIndex((s) => s.goal === SDG[13]);
    if (updateSDGProgress && index !== undefined && index >= 0) {
      updateSDGProgress(index, value);
    }
  });

  // 15. LifeOnLand
  const [sdgProgress14, setSdgProgress14] = useState(
    report.annualDetails?.sustainableDevelopmentGoals?.find((s) => s.goal === SDG[14])?.progress ?? ''
  );
  sdgProgressStates.push(sdgProgress14);
  setSdgProgressStates.push(setSdgProgress14);
  useDebounce(sdgProgress14, DEBOUNCE_TIME_MS, (value) => {
    const index = report.annualDetails?.sustainableDevelopmentGoals?.findIndex((s) => s.goal === SDG[14]);
    if (updateSDGProgress && index !== undefined && index >= 0) {
      updateSDGProgress(index, value);
    }
  });

  // 16. Peace
  const [sdgProgress15, setSdgProgress15] = useState(
    report.annualDetails?.sustainableDevelopmentGoals?.find((s) => s.goal === SDG[15])?.progress ?? ''
  );
  sdgProgressStates.push(sdgProgress15);
  setSdgProgressStates.push(setSdgProgress15);
  useDebounce(sdgProgress15, DEBOUNCE_TIME_MS, (value) => {
    const index = report.annualDetails?.sustainableDevelopmentGoals?.findIndex((s) => s.goal === SDG[15]);
    if (updateSDGProgress && index !== undefined && index >= 0) {
      updateSDGProgress(index, value);
    }
  });

  // 17. Partnerships
  const [sdgProgress16, setSdgProgress16] = useState(
    report.annualDetails?.sustainableDevelopmentGoals?.find((s) => s.goal === SDG[16])?.progress ?? ''
  );
  sdgProgressStates.push(sdgProgress16);
  setSdgProgressStates.push(setSdgProgress16);
  useDebounce(sdgProgress16, DEBOUNCE_TIME_MS, (value) => {
    const index = report.annualDetails?.sustainableDevelopmentGoals?.findIndex((s) => s.goal === SDG[16]);
    if (updateSDGProgress && index !== undefined && index >= 0) {
      updateSDGProgress(index, value);
    }
  });

  return [sdgProgressStates, setSdgProgressStates];
}
