import React, { useMemo } from 'react';
import { Step, StepLabel, Stepper, Typography, useTheme } from '@mui/material';
import { FormButton, PageForm } from '@terraware/web-components';
import strings from 'src/strings';

export type OptionalStep = {
  completed: boolean;
};

export type PlantingSiteCreateStep = {
  label: string;
  // to govern optional steps and their status
  optional?: OptionalStep;
};

export type PlantingSiteCreateFormProps = {
  children: React.ReactNode;
  className?: string;
  currentStep: number;
  onCancel: () => void;
  onSaveAndNext: () => void;
  onSaveAndClose: () => void;
  onStartOver: () => void;
  steps: PlantingSiteCreateStep[];
};

export default function PlantingSiteCreateForm({
  children,
  className,
  currentStep,
  onCancel,
  onSaveAndNext,
  onSaveAndClose,
  onStartOver,
  steps,
}: PlantingSiteCreateFormProps): JSX.Element {
  const theme = useTheme();
  const isLastStep = useMemo(() => currentStep === steps.length - 1, [currentStep, steps.length]);

  const pageFormRightButtons: FormButton[] = useMemo(() => {
    const startOverButton: FormButton = {
      id: 'start-over',
      text: strings.START_OVER,
      onClick: onStartOver,
      disabled: false,
      buttonType: 'passive',
    };

    const saveAndCloseButton: FormButton = {
      id: 'save-and-close',
      text: strings.SAVE_AND_CLOSE,
      onClick: onSaveAndClose,
      disabled: false,
      buttonType: 'passive',
    };

    return isLastStep ? [startOverButton, saveAndCloseButton] : [saveAndCloseButton];
  }, [isLastStep, onStartOver, onSaveAndClose]);

  return (
    <PageForm
      cancelID='cancel-planting-site-create'
      saveID='save-planting-site-create'
      onCancel={onCancel}
      onSave={onSaveAndNext}
      cancelButtonText={strings.CANCEL}
      saveButtonText={isLastStep ? strings.SAVE : strings.SAVE_AND_NEXT}
      additionalRightButtons={pageFormRightButtons}
      className={className}
    >
      <Stepper activeStep={currentStep}>
        {steps.map((step: PlantingSiteCreateStep, index: number) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: { optional?: React.ReactNode } = {};

          if (step.optional) {
            stepProps.completed = step.optional.completed;
            labelProps.optional = <Typography variant='caption'>{strings.OPTIONAL}</Typography>;
          }

          return (
            <Step key={index} {...stepProps}>
              <StepLabel
                {...labelProps}
                sx={{
                  '.MuiStepIcon-root.Mui-active, .MuiStepIcon-root.Mui-completed': {
                    fill: theme.palette.TwClrTxtBrand,
                  },
                  '.MuiStepLabel-label': {
                    fontSize: '16px',
                    fontWeight: 400,
                    color: theme.palette.TwClrTxt,
                  },
                }}
              >
                {step.label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {children}
    </PageForm>
  );
}
