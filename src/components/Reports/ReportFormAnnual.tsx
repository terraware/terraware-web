import React, { useState } from 'react';
import { Grid, Typography, useTheme } from '@mui/material';
import { Button, Checkbox, Textfield } from '@terraware/web-components';
import { Report } from 'src/types/Report';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useDebounce from 'src/utils/useDebounce';
import { SustainableDevelopmentGoal, SDG } from 'src/types/Report';
import useSDGProgress from './useSDGProgress';

const DEBOUNCE_TIME_MS = 500;

export type ReportFormAnnualProps = {
  editable: boolean;
  report: Report;
  updateDetails?: (field: string, value: any) => void;
  updateSDGProgress?: (index: number, value: string) => void;
};

export default function ReportFormAnnual(props: ReportFormAnnualProps): JSX.Element {
  const { editable, report, updateDetails, updateSDGProgress } = props;
  const theme = useTheme();
  const { isMobile, isTablet } = useDeviceInfo();

  const MONTHS = [
    strings.MONTH_01,
    strings.MONTH_02,
    strings.MONTH_03,
    strings.MONTH_04,
    strings.MONTH_05,
    strings.MONTH_06,
    strings.MONTH_07,
    strings.MONTH_08,
    strings.MONTH_09,
    strings.MONTH_10,
    strings.MONTH_11,
    strings.MONTH_12,
  ];

  const SDG_STRING: { [key in SustainableDevelopmentGoal]: string } = {
    NoPoverty: strings.SDG_01,
    ZeroHunger: strings.SDG_02,
    GoodHealth: strings.SDG_03,
    QualityEducation: strings.SDG_04,
    GenderEquality: strings.SDG_05,
    CleanWater: strings.SDG_06,
    AffordableEnergy: strings.SDG_07,
    DecentWork: strings.SDG_08,
    Industry: strings.SDG_09,
    ReducedInequalities: strings.SDG_10,
    SustainableCities: strings.SDG_11,
    ResponsibleConsumption: strings.SDG_12,
    ClimateAction: strings.SDG_13,
    LifeBelowWater: strings.SDG_14,
    LifeOnLand: strings.SDG_15,
    Peace: strings.SDG_16,
    Partnerships: strings.SDG_17,
  };

  const [projectSummary, setProjectSummary] = useState(report.annualDetails?.projectSummary ?? '');
  useDebounce(projectSummary, DEBOUNCE_TIME_MS, (value) => {
    if (updateDetails) {
      updateDetails('projectSummary', value);
    }
  });

  const [projectImpact, setProjectImpact] = useState(report.annualDetails?.projectImpact ?? '');
  useDebounce(projectImpact, DEBOUNCE_TIME_MS, (value) => {
    if (updateDetails) {
      updateDetails('projectImpact', value);
    }
  });

  const [budgetNarrativeSummary, setBudgetNarrativeSummary] = useState(
    report.annualDetails?.budgetNarrativeSummary ?? ''
  );
  useDebounce(budgetNarrativeSummary, DEBOUNCE_TIME_MS, (value) => {
    if (updateDetails) {
      updateDetails('budgetNarrativeSummary', value);
    }
  });

  const [socialImpact, setSocialImpact] = useState(report.annualDetails?.socialImpact ?? '');
  useDebounce(socialImpact, DEBOUNCE_TIME_MS, (value) => {
    if (updateDetails) {
      updateDetails('socialImpact', value);
    }
  });

  const [sdgList, setSdgList] = useState(report.annualDetails?.sustainableDevelopmentGoals.map((g) => g.goal) ?? []);
  const [sdgProgressStates, setSdgProgressStates] = useSDGProgress(report, updateSDGProgress);

  const [challenges, setChallenges] = useState(report.annualDetails?.challenges ?? '');
  useDebounce(challenges, DEBOUNCE_TIME_MS, (value) => {
    if (updateDetails) {
      updateDetails('challenges', value);
    }
  });

  const [keyLessons, setKeyLessons] = useState(report.annualDetails?.keyLessons ?? '');
  useDebounce(keyLessons, DEBOUNCE_TIME_MS, (value) => {
    if (updateDetails) {
      updateDetails('keyLessons', value);
    }
  });

  const [successStories, setSuccessStories] = useState(report.annualDetails?.successStories ?? '');
  useDebounce(successStories, DEBOUNCE_TIME_MS, (value) => {
    if (updateDetails) {
      updateDetails('successStories', value);
    }
  });

  const [isCatalytic, setIsCatalytic] = useState(report.annualDetails?.isCatalytic ?? false);
  const [catalyticDetail, setCatalyticDetail] = useState(report.annualDetails?.catalyticDetail ?? '');
  useDebounce(catalyticDetail, DEBOUNCE_TIME_MS, (value) => {
    if (updateDetails) {
      updateDetails('catalyticDetail', value);
    }
  });

  const [opportunities, setOpportunities] = useState(report.annualDetails?.opportunities ?? '');
  useDebounce(opportunities, DEBOUNCE_TIME_MS, (value) => {
    if (updateDetails) {
      updateDetails('opportunities', value);
    }
  });

  const [nextSteps, setNextSteps] = useState(report.annualDetails?.nextSteps ?? '');
  useDebounce(nextSteps, DEBOUNCE_TIME_MS, (value) => {
    if (updateDetails) {
      updateDetails('nextSteps', value);
    }
  });

  const handleObservationMonthChange = (add: boolean, monthNumber: number) => {
    const currentMonths = report.annualDetails?.bestMonthsForObservation ?? [];
    if (updateDetails && add && !currentMonths.includes(monthNumber)) {
      updateDetails('bestMonthsForObservation', [...currentMonths, monthNumber]);
    } else if (updateDetails && !add && currentMonths.includes(monthNumber)) {
      updateDetails(
        'bestMonthsForObservation',
        currentMonths.filter((m) => m !== monthNumber)
      );
    }
  };

  const handleSDGChange = (add: boolean, key: SustainableDevelopmentGoal) => {
    if (updateDetails && add && !sdgList.includes(key)) {
      const newSdg = [...sdgList];
      newSdg.push(key);
      setSdgList(newSdg);
      updateDetails(
        'sustainableDevelopmentGoals',
        newSdg.map((s) => ({
          goal: s,
          progress: sdgProgressStates[SDG.findIndex((sdg) => s === sdg)],
        }))
      );
    } else if (updateDetails && !add && sdgList.includes(key)) {
      const newSdg = sdgList.filter((s) => s !== key);
      setSdgList(newSdg);
      updateDetails(
        'sustainableDevelopmentGoals',
        newSdg.map((s) => ({
          goal: s,
          progress: sdgProgressStates[SDG.findIndex((sdg) => s === sdg)],
        }))
      );
    }
  };

  const handleIsCatalyticChange = (catalytic: boolean) => {
    if (updateDetails) {
      setIsCatalytic(catalytic);
      updateDetails('isCatalytic', catalytic);
    }
  };

  const handleFileUploadButtonClick = () => {
    // TODO
    return undefined;
  };

  const smallItemGridWidth = () => (isMobile ? 12 : 4);
  const mediumItemGridWidth = () => (isMobile || isTablet ? 12 : 8);

  return (
    <Grid
      container
      spacing={theme.spacing(3)}
      borderRadius={theme.spacing(3)}
      padding={theme.spacing(0, 3, 3, 0)}
      marginLeft={0}
      sx={{
        backgroundColor: theme.palette.TwClrBg,
      }}
    >
      <Grid item xs={12}>
        <Typography fontSize='20px' fontWeight={600}>
          {strings.REPORT_ANNUAL_DETAILS_TITLE}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary}>
          {strings.BEST_MONTHS_FOR_OBSERVATIONS}
        </Typography>
      </Grid>
      {MONTHS.map((monthName, index) => (
        <Grid item key={`month-${index.toString()}`} xs={smallItemGridWidth()}>
          <Checkbox
            id={`month-${index.toString()}`}
            disabled={!editable}
            name={monthName}
            label={monthName}
            value={report.annualDetails?.bestMonthsForObservation?.includes(index + 1) ?? false}
            onChange={(add) => handleObservationMonthChange(add, index + 1)}
          />
        </Grid>
      ))}
      <Grid item xs={mediumItemGridWidth()}>
        <ReportField
          title={strings.PROJECT_SUMMARY}
          instructions={strings.PROJECT_SUMMARY_INSTRUCTIONS}
          editable={editable}
          value={projectSummary}
          onChange={setProjectSummary}
        />
      </Grid>
      <Grid item xs={mediumItemGridWidth()}>
        <ReportField
          title={strings.PROJECT_IMPACT}
          instructions={strings.PROJECT_IMPACT_INSTRUCTIONS}
          editable={editable}
          value={projectImpact}
          onChange={setProjectImpact}
        />
      </Grid>
      <Grid item xs={mediumItemGridWidth()}>
        <ReportField
          title={strings.BUDGET_NARRATIVE_SUMMARY}
          instructions={strings.BUDGET_NARRATIVE_SUMMARY_INSTRUCTIONS}
          editable={editable}
          value={budgetNarrativeSummary}
          onChange={setBudgetNarrativeSummary}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary}>
          {strings.BUDGET_DOCUMENT_XLS}
        </Typography>
        <Button onClick={handleFileUploadButtonClick} priority='secondary' type='passive' label={strings.CHOOSE_FILE} />
      </Grid>
      <Grid item xs={mediumItemGridWidth()}>
        <ReportField
          title={strings.SOCIAL_IMPACT}
          instructions={strings.SOCIAL_IMPACT_INSTRUCTIONS}
          editable={editable}
          value={socialImpact}
          onChange={setSocialImpact}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography fontSize='20px' fontWeight={600}>
          {strings.SUSTAINABLE_DEVELOPMENT_GOALS}
        </Typography>
      </Grid>
      {Object.keys(SDG_STRING).map((key) => (
        <Grid key={key} item xs={smallItemGridWidth()}>
          <Checkbox
            id={key}
            disabled={!editable}
            name={SDG_STRING[key as SustainableDevelopmentGoal]}
            label={SDG_STRING[key as SustainableDevelopmentGoal]}
            value={sdgList.includes(key as SustainableDevelopmentGoal)}
            onChange={(value) => handleSDGChange(value, key as SustainableDevelopmentGoal)}
          />
          {sdgList.includes(key as SustainableDevelopmentGoal) && (
            <Textfield
              label=''
              id={key}
              type='textarea'
              readonly={!editable}
              value={sdgProgressStates[SDG.findIndex((sdg) => key === sdg)]}
              onChange={(value) => setSdgProgressStates[SDG.findIndex((sdg) => key === sdg)](value as string)}
            />
          )}
        </Grid>
      ))}
      <br />
      <Grid item xs={mediumItemGridWidth()}>
        <ReportField
          title={strings.CHALLENGES}
          instructions={strings.CHALLENGES_INSTRUCTIONS}
          editable={editable}
          value={challenges}
          onChange={setChallenges}
        />
      </Grid>
      <Grid item xs={mediumItemGridWidth()}>
        <ReportField
          title={strings.KEY_LESSONS}
          instructions={strings.KEY_LESSONS_INSTRUCTIONS}
          editable={editable}
          value={keyLessons}
          onChange={setKeyLessons}
        />
      </Grid>
      <Grid item xs={mediumItemGridWidth()}>
        <ReportField
          title={strings.SUCCESS_STORIES}
          instructions={strings.SUCCESS_STORIES_INSTRUCTIONS}
          editable={editable}
          value={successStories}
          onChange={setSuccessStories}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography fontSize='20px' fontWeight={600} marginBottom={theme.spacing(1)}>
          {strings.CATALYTIC_DETAIL}
        </Typography>
        <Checkbox
          id='isCatalytic-checkbox'
          disabled={!editable}
          name={strings.CATALYTIC_CHECKBOX}
          label={strings.CATALYTIC_CHECKBOX}
          onChange={handleIsCatalyticChange}
          value={isCatalytic}
        />
      </Grid>
      <Grid item xs={mediumItemGridWidth()}>
        <Textfield
          id={`catalyticDetail-field`}
          type='textarea'
          label={strings.CATALYTIC_DETAIL_INSTRUCTIONS}
          readonly={!editable}
          onChange={(v) => setCatalyticDetail(v as string)}
          value={catalyticDetail}
        />
      </Grid>
      <Grid item xs={mediumItemGridWidth()}>
        <ReportField
          title={strings.OPPORTUNITIES}
          instructions={strings.OPPORTUNITIES_INSTRUCTIONS}
          editable={editable}
          value={opportunities}
          onChange={setOpportunities}
        />
      </Grid>
      <Grid item xs={mediumItemGridWidth()}>
        <ReportField
          title={strings.NEXT_STEPS}
          instructions={strings.NEXT_STEPS_INSTRUCTIONS}
          editable={editable}
          value={nextSteps}
          onChange={setNextSteps}
        />
      </Grid>
    </Grid>
  );
}

type ReportFieldProps = {
  title: string;
  instructions: string;
  editable: boolean;
  value: string;
  onChange: (value: string) => void;
};

function ReportField(props: ReportFieldProps): JSX.Element {
  const { title, instructions, editable, value, onChange } = props;
  const theme = useTheme();
  return (
    <>
      <Typography fontSize='20px' fontWeight={600} marginBottom={theme.spacing(1)}>
        {title}
      </Typography>
      <Textfield
        label={instructions}
        id={`${title}-field`}
        type='textarea'
        readonly={!editable}
        onChange={(v) => onChange(v as string)}
        value={value}
      />
    </>
  );
}
