import React, { type JSX, ReactNode, useCallback, useMemo, useState } from 'react';

import { Box, Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Button, Message } from '@terraware/web-components';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import UnsavedChangesBadge from 'src/components/common/UnsavedChangesBadge';
import { clearSnackbar } from 'src/redux/features/snackbar/snackbarSlice';
import { useAppDispatch } from 'src/redux/store';
import strings from 'src/strings';
import { EditorPlantingSite, SiteEditStep } from 'src/types/PlantingSite';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import { EditorStepperContext, PlantingSiteStep } from './EditorStepper';
import Exclusions from './Exclusions';
import SiteBoundary from './SiteBoundary';
import Strata from './Strata';
import Substrata from './Substrata';
import { OnValidate } from './types';

export type EditorLayoutProps = {
  busy: boolean;
  children?: ReactNode;
  closeButtonId: string;
  currentStep: SiteEditStep;
  finishButtonId: string;
  finishLabel: string;
  isDirty: boolean;
  onBack: () => void;
  onClose: () => void;
  onDirtyChange: (isDirty: boolean) => void;
  onFinish: () => void;
  onLeave: () => void;
  onNext: () => void;
  onStartOver?: () => void;
  onValidate?: OnValidate;
  site: EditorPlantingSite;
  stepKey: number;
  steps: PlantingSiteStep[];
  title: string;
};

export default function EditorLayout({
  busy,
  children,
  closeButtonId,
  currentStep,
  finishButtonId,
  finishLabel,
  isDirty,
  onBack,
  onClose,
  onDirtyChange,
  onFinish,
  onLeave,
  onNext,
  onStartOver,
  onValidate,
  site,
  stepKey,
  steps,
  title,
}: EditorLayoutProps): JSX.Element {
  const [contentElement, setContentElement] = useState<HTMLElement | null>(null);
  const contentRef = useCallback((node: HTMLElement | null) => setContentElement(node), []);
  const theme = useTheme();
  const { isDesktop } = useDeviceInfo();
  const isNarrowPortrait = useMediaQuery('(min-width: 768px) and (max-width: 1439px) and (orientation: portrait)');
  const isEditorAvailable = isDesktop && !isNarrowPortrait;
  const dispatch = useAppDispatch();
  const [stepperCollapsed, setStepperCollapsed] = useState<boolean>(false);

  const onFinalStep = steps.findIndex((step) => step.type === currentStep) === steps.length - 1;

  const onOpenStartOver = useMemo(
    () =>
      onStartOver
        ? () => {
            dispatch(clearSnackbar({ type: 'toast' }));
            onStartOver();
          }
        : undefined,
    [dispatch, onStartOver]
  );
  const onHeaderButtonClick = useCallback(() => dispatch(clearSnackbar({ type: 'toast' })), [dispatch]);
  const onToggleStepperCollapsed = useCallback(() => setStepperCollapsed((collapsed) => !collapsed), []);
  const onStepperBack = useCallback(() => {
    dispatch(clearSnackbar({ type: 'toast' }));
    onBack();
  }, [dispatch, onBack]);
  const onStepperNext = useCallback(() => {
    dispatch(clearSnackbar({ type: 'toast' }));
    onNext();
  }, [dispatch, onNext]);
  const stepperContext = useMemo(
    () => ({
      busy,
      collapsed: stepperCollapsed,
      currentStep,
      onBack: onStepperBack,
      onNext: onStepperNext,
      onStartOver: onOpenStartOver,
      onToggleCollapsed: onToggleStepperCollapsed,
      steps,
    }),
    [
      busy,
      currentStep,
      onOpenStartOver,
      onStepperBack,
      onStepperNext,
      onToggleStepperCollapsed,
      stepperCollapsed,
      steps,
    ]
  );

  return (
    <TfMain>
      {children}
      <PageHeaderWrapper
        alwaysVisible={isEditorAvailable}
        elevated={isEditorAvailable && isDirty}
        nextElement={contentElement}
      >
        <Box
          padding={theme.spacing(0, 0, 2, 3)}
          display='flex'
          alignItems='center'
          justifyContent='space-between'
          flexWrap='wrap'
          gap={theme.spacing(1.5)}
        >
          <Box display='flex' alignItems='center' flexWrap='wrap' gap={theme.spacing(1.5)}>
            <Typography fontSize='24px' fontWeight={600}>
              {title}
            </Typography>
            {isDirty && <UnsavedChangesBadge />}
          </Box>
          {isEditorAvailable && (
            <Box
              display='flex'
              alignItems='center'
              flexWrap='wrap'
              justifyContent='flex-end'
              gap={theme.spacing(1)}
              onClickCapture={onHeaderButtonClick}
            >
              <Button
                id={closeButtonId}
                label={strings.CLOSE}
                onClick={onClose}
                disabled={busy}
                priority='secondary'
                type='passive'
                size='medium'
              />
              <Button
                id={finishButtonId}
                label={finishLabel}
                onClick={onFinish}
                disabled={busy || !onFinalStep}
                size='medium'
              />
            </Box>
          )}
        </Box>
      </PageHeaderWrapper>
      <Grid item xs={12} ref={contentRef}>
        <PageSnackbar />
      </Grid>
      {!isEditorAvailable && (
        <Message
          body={isNarrowPortrait ? strings.SITE_EDITOR_USE_TABLET_LANDSCAPE : strings.SITE_EDITOR_USE_DESKTOP}
          priority='info'
          type='page'
          pageButtons={[
            <Button
              key={0}
              label={strings.GO_TO_PLANTING_SITES}
              onClick={onLeave}
              priority='secondary'
              size='small'
              type='passive'
            />,
          ]}
        />
      )}
      {isEditorAvailable && (
        <EditorStepperContext.Provider value={stepperContext}>
          <Card
            radius={theme.spacing(1)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              marginTop: theme.spacing(2),
              position: 'relative',
            }}
          >
            {currentStep === 'site_boundary' && (
              <SiteBoundary key={stepKey} onDirtyChange={onDirtyChange} onValidate={onValidate} site={site} />
            )}
            {currentStep === 'exclusion_areas' && (
              <Exclusions onDirtyChange={onDirtyChange} onValidate={onValidate} site={site} />
            )}
            {currentStep === 'stratum_boundaries' && (
              <Strata onDirtyChange={onDirtyChange} onValidate={onValidate} site={site} />
            )}
            {currentStep === 'substratum_boundaries' && (
              <Substrata onDirtyChange={onDirtyChange} onValidate={onValidate} site={site} />
            )}
          </Card>
        </EditorStepperContext.Provider>
      )}
    </TfMain>
  );
}
