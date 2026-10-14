import React, { type JSX, ReactNode, createContext, useContext } from 'react';

import { Box, useTheme } from '@mui/material';
import { Button, Stepper } from '@terraware/web-components';

import type { EditableMapProps } from 'src/components/NewMap/EditableMap';
import strings from 'src/strings';
import { SiteEditStep } from 'src/types/PlantingSite';

type OptionalStep = {
  completed: boolean;
};

export type PlantingSiteStep = {
  type: SiteEditStep;
  label: string;
  // to govern optional steps and their status
  optional?: OptionalStep;
};

type EditorStepperContextValue = {
  busy: boolean;
  currentStep: SiteEditStep;
  onBack: () => void;
  onNext: () => void;
  steps: PlantingSiteStep[];
};

export const EditorStepperContext = createContext<EditorStepperContextValue | undefined>(undefined);

type EditorStepperProps = EditorStepperContextValue & {
  description: ReactNode;
};

const EditorStepper = ({ busy, currentStep, description, onBack, onNext, steps }: EditorStepperProps): JSX.Element => {
  const theme = useTheme();
  const currentStepIndex = Math.max(
    steps.findIndex((step) => step.type === currentStep),
    0
  );
  const isFinalStep = currentStepIndex === steps.length - 1;

  return (
    <Box display='flex' flexDirection='column' height='100%'>
      {/* zero basis keeps the steps from growing the map past its own height, so they scroll instead */}
      <Box flexBasis={0} flexGrow={1} overflow='auto'>
        <Stepper
          activeStep={currentStepIndex}
          orientation='vertical'
          steps={steps.map((step, index) => ({
            ...step,
            description: index === currentStepIndex ? description : undefined,
          }))}
          sx={{ padding: theme.spacing(1, 0) }}
        />
      </Box>
      <Box
        display='flex'
        gap={theme.spacing(1)}
        justifyContent={currentStepIndex > 0 ? 'space-between' : 'flex-end'}
        padding={theme.spacing(1, 0)}
        whiteSpace='nowrap'
      >
        {currentStepIndex > 0 && (
          <Button
            id='back-planting-site-create'
            label={strings.BACK}
            onClick={onBack}
            disabled={busy}
            priority='secondary'
            type='passive'
            size='medium'
          />
        )}
        <Button
          id='save-planting-site-create'
          label={isFinalStep ? strings.CREATE_PLANTING_SITE : strings.NEXT}
          onClick={onNext}
          disabled={busy}
          size='medium'
        />
      </Box>
    </Box>
  );
};

/**
 * Map drawer props for an editor step, showing the steps with the given description under the current one.
 */
export const useEditorStepperDrawer = (description: ReactNode): Pick<EditableMapProps, 'drawer' | 'drawerSize'> => {
  const context = useContext(EditorStepperContext);

  if (!context) {
    return {};
  }

  return {
    drawer: <EditorStepper {...context} description={description} />,
    drawerSize: 'medium',
  };
};
