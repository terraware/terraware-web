import React, { type JSX } from 'react';

import { Box, Typography } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';

import { problemText } from 'src/scenes/PlantingSitesRouter/hooks/usePlantingSiteProblemsToast';
import strings from 'src/strings';
import { PlantingSiteProblem } from 'src/types/PlantingSite';

export type DraftProblemsConfirmationProps = {
  onBackToEdit: () => void;
  onSaveAnyway: () => void;
  problems: PlantingSiteProblem[];
};

export default function DraftProblemsConfirmation({
  onBackToEdit,
  onSaveAnyway,
  problems,
}: DraftProblemsConfirmationProps): JSX.Element {
  return (
    <DialogBox
      onClose={onBackToEdit}
      open={true}
      title={strings.DRAFT_PLANTING_SITE_HAS_PROBLEMS}
      size='medium'
      message={strings.DRAFT_PLANTING_SITE_SAVE_ANYWAY_MESSAGE}
      middleButtons={[
        <Button
          id='back-to-edit-draft-planting-site'
          key='back'
          label={strings.BACK_TO_EDIT}
          onClick={onBackToEdit}
          priority='secondary'
          type='passive'
        />,
        <Button id='save-draft-planting-site-anyway' key='save' label={strings.SAVE_ANYWAY} onClick={onSaveAnyway} />,
      ]}
    >
      <Box component='ul' textAlign='left' margin={0}>
        {problems.map((problem, index) => (
          <Typography component='li' key={index}>
            {problemText(problem)}
          </Typography>
        ))}
      </Box>
    </DialogBox>
  );
}
