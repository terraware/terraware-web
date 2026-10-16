import React, { type JSX, ReactNode, createContext, useContext } from 'react';

import { Box, ButtonBase, useTheme } from '@mui/material';
import { Button, Icon, Stepper } from '@terraware/web-components';

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
  collapsed: boolean;
  currentStep: SiteEditStep;
  onBack: () => void;
  onNext: () => void;
  onStartOver?: () => void;
  onToggleCollapsed: () => void;
  steps: PlantingSiteStep[];
};

export const EditorStepperContext = createContext<EditorStepperContextValue | undefined>(undefined);

type EditorStepperProps = EditorStepperContextValue & {
  description: ReactNode;
  status?: ReactNode;
};

const EditorStepper = ({
  busy,
  collapsed,
  currentStep,
  description,
  onBack,
  onNext,
  onStartOver,
  status,
  steps,
}: EditorStepperProps): JSX.Element => {
  const theme = useTheme();
  const currentStepIndex = Math.max(
    steps.findIndex((step) => step.type === currentStep),
    0
  );
  const isFinalStep = currentStepIndex === steps.length - 1;

  const buttonSize = collapsed ? 'small' : 'medium';

  const activeStepContent = (
    <>
      {!collapsed && description}
      {status && (
        // zero width keeps the status from widening the collapsed drawer
        <Box minWidth='100%' width={0}>
          {status}
        </Box>
      )}
    </>
  );

  return (
    <Box display='flex' flexDirection='column' height='100%'>
      {/* zero basis keeps the steps from growing the map past its own height, so they scroll instead */}
      <Box flexBasis={0} flexGrow={1} overflow='auto'>
        <Stepper
          activeStep={currentStepIndex}
          orientation='vertical'
          steps={steps.map((step, index) => ({
            ...step,
            description: index === currentStepIndex ? activeStepContent : undefined,
          }))}
          sx={{ padding: theme.spacing(1, 0) }}
        />
        {onStartOver && (
          <Button
            id='start-over'
            label={strings.RESET_BOUNDARY_SETUP}
            onClick={onStartOver}
            disabled={busy}
            priority='secondary'
            type='passive'
            size={buttonSize}
          />
        )}
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
            size={buttonSize}
          />
        )}
        {!isFinalStep && (
          <Button
            id='next-planting-site-create'
            label={strings.NEXT}
            onClick={onNext}
            disabled={busy}
            size={buttonSize}
          />
        )}
      </Box>
    </Box>
  );
};

type EditorStepperEarProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

const EditorStepperEar = ({ collapsed, onToggleCollapsed }: EditorStepperEarProps): JSX.Element => {
  const theme = useTheme();

  return (
    <ButtonBase
      aria-label={collapsed ? strings.SHOW_INSTRUCTIONS : strings.HIDE_INSTRUCTIONS}
      id='toggle-planting-site-create-instructions'
      onClick={onToggleCollapsed}
      sx={{
        background: theme.palette.TwClrBaseWhite,
        border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
        borderRight: 'none',
        borderRadius: '8px 0 0 8px',
        height: '48px',
        width: '24px',
      }}
    >
      <Icon name={collapsed ? 'caretLeft' : 'caretRight'} size='small' style={{ fill: theme.palette.TwClrIcn }} />
    </ButtonBase>
  );
};

/**
 * Map props for an editor step's drawer, showing the steps with the given description under the current one. The status
 * stays visible when the drawer is collapsed.
 */
export const useEditorStepperDrawer = (
  description: ReactNode,
  status?: ReactNode
): Pick<EditableMapProps, 'drawer' | 'drawerEar' | 'drawerSize' | 'drawerStyle' | 'minHeight'> => {
  const context = useContext(EditorStepperContext);

  if (!context) {
    return {};
  }

  return {
    drawer: <EditorStepper {...context} description={description} status={status} />,
    drawerEar: <EditorStepperEar collapsed={context.collapsed} onToggleCollapsed={context.onToggleCollapsed} />,
    drawerSize: context.collapsed ? 'fit-content' : 'medium',
    drawerStyle: context.collapsed ? undefined : { minWidth: '330px', width: '330px' },
    minHeight: '570px',
  };
};
