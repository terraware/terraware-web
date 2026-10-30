import React, { type JSX } from 'react';

import { Button, DialogBox } from '@terraware/web-components';

import strings from 'src/strings';
import { SiteEditStep } from 'src/types/PlantingSite';

export type SkippedStep = Extract<SiteEditStep, 'stratum_boundaries' | 'substratum_boundaries'>;

export type SkipRemainingStepsConfirmationProps = {
  onContinueSetup: () => void;
  onCreateSite: () => void;
  onClose: () => void;
  skippedStep: SkippedStep;
};

export default function SkipRemainingStepsConfirmation({
  onContinueSetup,
  onCreateSite,
  onClose,
  skippedStep,
}: SkipRemainingStepsConfirmationProps): JSX.Element {
  const isStrata = skippedStep === 'stratum_boundaries';

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      size='large'
      title={isStrata ? strings.CREATE_SITE_WITHOUT_STRATA : strings.CREATE_SITE_WITHOUT_SUBSTRATA}
      message={isStrata ? strings.CREATE_SITE_WITHOUT_STRATA_MESSAGE : strings.CREATE_SITE_WITHOUT_SUBSTRATA_MESSAGE}
      middleButtons={[
        <Button
          id='continue-planting-site-setup'
          key='continue'
          label={strings.CONTINUE_SETUP}
          onClick={onContinueSetup}
          priority='secondary'
          size='medium'
          type='passive'
        />,
        <Button
          id='create-planting-site-anyway'
          key='create'
          label={strings.CREATE_SITE}
          onClick={onCreateSite}
          size='medium'
        />,
      ]}
    />
  );
}
