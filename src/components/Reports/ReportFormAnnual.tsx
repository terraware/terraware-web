import React, { useRef, useState } from 'react';
import { Box, Grid, Theme, Typography, useTheme } from '@mui/material';
import { Button, Checkbox, Textfield } from '@terraware/web-components';
import { Report, ReportFile } from 'src/types/Report';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { SustainableDevelopmentGoal, SDG } from 'src/types/Report';
import useSDGProgress from './useSDGProgress';
import { REPORT_FILE_ENDPOINT } from 'src/services/ReportService';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  hiddenInput: {
    display: 'none',
  },
}));

export type ReportFormAnnualProps = {
  editable: boolean;
  report: Report;
  updateDetails?: (field: string, value: any) => void;
  updateSDGProgress?: (index: number, value: string) => void;
  initialReportFiles: ReportFile[];
  onNewFilesChanged?: (files: File[]) => void;
  onExistingFilesChanged?: (files: ReportFile[]) => void;
};

export default function ReportFormAnnual(props: ReportFormAnnualProps): JSX.Element {
  const {
    editable,
    report,
    updateDetails,
    updateSDGProgress,
    initialReportFiles,
    onNewFilesChanged,
    onExistingFilesChanged,
  } = props;
  const classes = useStyles();
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
  const [projectImpact, setProjectImpact] = useState(report.annualDetails?.projectImpact ?? '');
  const [budgetNarrativeSummary, setBudgetNarrativeSummary] = useState(
    report.annualDetails?.budgetNarrativeSummary ?? ''
  );
  const [socialImpact, setSocialImpact] = useState(report.annualDetails?.socialImpact ?? '');

  const [sdgList, setSdgList] = useState(report.annualDetails?.sustainableDevelopmentGoals.map((g) => g.goal) ?? []);
  const [sdgProgressStates, setSdgProgressStates] = useSDGProgress(report);

  const [challenges, setChallenges] = useState(report.annualDetails?.challenges ?? '');
  const [keyLessons, setKeyLessons] = useState(report.annualDetails?.keyLessons ?? '');
  const [successStories, setSuccessStories] = useState(report.annualDetails?.successStories ?? '');
  const [isCatalytic, setIsCatalytic] = useState(report.annualDetails?.isCatalytic ?? false);
  const [catalyticDetail, setCatalyticDetail] = useState(report.annualDetails?.catalyticDetail ?? '');
  const [opportunities, setOpportunities] = useState(report.annualDetails?.opportunities ?? '');
  const [nextSteps, setNextSteps] = useState(report.annualDetails?.nextSteps ?? '');

  const [existingFiles, setExistingFiles] = useState<ReportFile[]>(initialReportFiles);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const divRef = useRef<HTMLDivElement>(null);

  const onRemoveExistingFile = (id: number) => {
    const updatedFiles = existingFiles.filter((f) => f.id !== id);
    setExistingFiles(updatedFiles);
    if (onExistingFilesChanged) {
      onExistingFilesChanged(updatedFiles);
    }
  };

  const onChooseFileHandler = () => {
    inputRef.current?.click();
    divRef.current?.focus();
  };

  const onFileChosen = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files && event.currentTarget.files[0]) {
      const updatedFiles = [...newFiles, event.currentTarget.files[0]];
      setNewFiles(updatedFiles);
      if (onNewFilesChanged) {
        onNewFilesChanged(updatedFiles);
      }
    }
  };

  const onRemoveFile = (filename: string) => {
    const updatedFiles = newFiles.filter((f) => f.name !== filename);
    setNewFiles(updatedFiles);
    if (onNewFilesChanged) {
      onNewFilesChanged(updatedFiles);
    }
  };

  const getReportFileUrl = (reportId: number, fileId: number) => {
    return REPORT_FILE_ENDPOINT.replace('{reportId}', reportId.toString()).replace('{fileId}', fileId.toString());
  };

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
          onChange={(value) => {
            setProjectSummary(value);
            if (updateDetails) {
              updateDetails('projectSummary', value);
            }
          }}
        />
      </Grid>
      <Grid item xs={mediumItemGridWidth()}>
        <ReportField
          title={strings.PROJECT_IMPACT}
          instructions={strings.PROJECT_IMPACT_INSTRUCTIONS}
          editable={editable}
          value={projectImpact}
          onChange={(value) => {
            setProjectImpact(value);
            if (updateDetails) {
              updateDetails('projectImpact', value);
            }
          }}
        />
      </Grid>
      <Grid item xs={mediumItemGridWidth()}>
        <ReportField
          title={strings.BUDGET_NARRATIVE_SUMMARY}
          instructions={strings.BUDGET_NARRATIVE_SUMMARY_INSTRUCTIONS}
          editable={editable}
          value={budgetNarrativeSummary}
          onChange={(value) => {
            setBudgetNarrativeSummary(value);
            if (updateDetails) {
              updateDetails('budgetNarrativeSummary', value);
            }
          }}
        />
      </Grid>
      <Grid item xs={12} ref={divRef}>
        <input type='file' ref={inputRef} className={classes.hiddenInput} value='' onChange={onFileChosen} />
        <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary}>
          {strings.BUDGET_DOCUMENT_XLS}
        </Typography>
        <Button
          disabled={!editable}
          onClick={onChooseFileHandler}
          priority='secondary'
          type='passive'
          label={strings.CHOOSE_FILE}
        />
        {newFiles.map((f) => (
          <Box key={f.name} display='flex' alignItems='center'>
            <Button
              disabled={!editable}
              priority='ghost'
              type='passive'
              icon='iconTrashCan'
              onClick={() => onRemoveFile(f.name)}
            />
            <Typography>{f.name}</Typography>
          </Box>
        ))}
        {existingFiles.map((f) => (
          <Box key={f.id} display='flex' alignItems='center'>
            {editable ? (
              <Button priority='ghost' type='passive' icon='iconTrashCan' onClick={() => onRemoveExistingFile(f.id)} />
            ) : (
              <a href={getReportFileUrl(report.id, f.id)}>
                <Button priority='ghost' type='passive' icon='iconExport' onClick={() => undefined} />
              </a>
            )}
            <Typography>{f.filename}</Typography>
          </Box>
        ))}
      </Grid>
      <Grid item xs={mediumItemGridWidth()}>
        <ReportField
          title={strings.SOCIAL_IMPACT}
          instructions={strings.SOCIAL_IMPACT_INSTRUCTIONS}
          editable={editable}
          value={socialImpact}
          onChange={(value) => {
            setSocialImpact(value);
            if (updateDetails) {
              updateDetails('socialImpact', value);
            }
          }}
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
              onChange={(value) => {
                setSdgProgressStates[SDG.findIndex((sdg) => key === sdg)](value as string);
                const index = report.annualDetails?.sustainableDevelopmentGoals?.findIndex((s) => s.goal === key);
                if (updateSDGProgress && index !== undefined && index >= 0) {
                  updateSDGProgress(index, value as string);
                }
              }}
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
          onChange={(value) => {
            setChallenges(value);
            if (updateDetails) {
              updateDetails('challenges', value);
            }
          }}
        />
      </Grid>
      <Grid item xs={mediumItemGridWidth()}>
        <ReportField
          title={strings.KEY_LESSONS}
          instructions={strings.KEY_LESSONS_INSTRUCTIONS}
          editable={editable}
          value={keyLessons}
          onChange={(value) => {
            setKeyLessons(value);
            if (updateDetails) {
              updateDetails('keyLessons', value);
            }
          }}
        />
      </Grid>
      <Grid item xs={mediumItemGridWidth()}>
        <ReportField
          title={strings.SUCCESS_STORIES}
          instructions={strings.SUCCESS_STORIES_INSTRUCTIONS}
          editable={editable}
          value={successStories}
          onChange={(value) => {
            setSuccessStories(value);
            if (updateDetails) {
              updateDetails('successStories', value);
            }
          }}
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
          onChange={(v) => {
            setCatalyticDetail(v as string);
            if (updateDetails) {
              updateDetails('catalyticDetail', v);
            }
          }}
          value={catalyticDetail}
        />
      </Grid>
      <Grid item xs={mediumItemGridWidth()}>
        <ReportField
          title={strings.OPPORTUNITIES}
          instructions={strings.OPPORTUNITIES_INSTRUCTIONS}
          editable={editable}
          value={opportunities}
          onChange={(value) => {
            setOpportunities(value);
            if (updateDetails) {
              updateDetails('opportunities', value);
            }
          }}
        />
      </Grid>
      <Grid item xs={mediumItemGridWidth()}>
        <ReportField
          title={strings.NEXT_STEPS}
          instructions={strings.NEXT_STEPS_INSTRUCTIONS}
          editable={editable}
          value={nextSteps}
          onChange={(value) => {
            setNextSteps(value);
            if (updateDetails) {
              updateDetails('nextSteps', value);
            }
          }}
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
