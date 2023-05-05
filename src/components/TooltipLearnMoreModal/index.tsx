import { Box, Link, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';

import strings from 'src/strings';
import Button from '../common/button/Button';
import DialogBox from '../common/DialogBox/DialogBox';

const useStyles = makeStyles((theme: Theme) => ({
  spacing: {
    marginRight: theme.spacing(2),
  },
  content: {
    color: theme.palette.TwClrTxt,
    textAlign: 'left',
  },
  learnMoreLink: {
    color: theme.palette.TwClrTxtInverse,
    fontSize: 'inherit',
    textDecorationColor: theme.palette.TwClrTxtInverse,
    verticalAlign: 'text-top',
  },
}));

export type TooltipLearnMoreModalData = {
  content?: NonNullable<React.ReactNode>;
  title: string;
};

export type TooltipLearnMoreModalProps = {
  content?: NonNullable<React.ReactNode>;
  onClose: () => void;
  open: boolean;
  title?: string;
};

export default function TooltipLearnMoreModal(props: TooltipLearnMoreModalProps): JSX.Element {
  const classes = useStyles();
  const { open, onClose, title, content } = props;

  return (
    <DialogBox
      middleButtons={[<Button key={strings.DONE} onClick={onClose} label={strings.DONE} />]}
      onClose={onClose}
      open={open}
      scrolled
      size='medium'
      title={title ?? strings.LEARN_MORE}
    >
      <Box className={classes.content}>{content}</Box>
    </DialogBox>
  );
}

export const LearnMoreLink = (props: { onClick: () => void }): JSX.Element => {
  const classes = useStyles();
  const { onClick } = props;

  return (
    <>
      {' '}
      <Link className={classes.learnMoreLink} component='button' onClick={onClick}>
        {strings.LEARN_MORE}
      </Link>
    </>
  );
};

export const LearnMoreModalContentGrowthForm = (): JSX.Element => (
  <>
    <p>
      <strong>{strings.FERN}:</strong> {strings.LEARN_MORE_GROWTH_FORM_FERN}
    </p>
    <p>
      <strong>{strings.GRAMINOID}:</strong> {strings.LEARN_MORE_GROWTH_FORM_GRAMINOID}
    </p>
    <p>
      <strong>{strings.FORB}:</strong> {strings.LEARN_MORE_GROWTH_FORM_FORB}
    </p>
    <p>
      <strong>{strings.SHRUB}:</strong> {strings.LEARN_MORE_GROWTH_FORM_SHRUB}
    </p>
    <p>
      <strong>{strings.TREE}:</strong> {strings.LEARN_MORE_GROWTH_FORM_TREE}
    </p>
    <p>
      <strong>{strings.FUNGUS}:</strong> {strings.LEARN_MORE_GROWTH_FORM_FUNGUS}
    </p>
    <p>
      <strong>{strings.LICHEN}:</strong> {strings.LEARN_MORE_GROWTH_FORM_LICHEN}
    </p>
    <p>
      <strong>{strings.MOSS}:</strong> {strings.LEARN_MORE_GROWTH_FORM_MOSS}
    </p>
  </>
);

export const LearnMoreModalContentConservationStatus = (): JSX.Element => (
  <>
    <p>
      <strong>{strings.ENDANGERED}:</strong> {strings.LEARN_MORE_CONSERVATION_STATUS_ENDANGERED}
    </p>
    <p>
      <strong>{strings.RARE}:</strong> {strings.LEARN_MORE_CONSERVATION_STATUS_RARE}
    </p>
  </>
);

export const LearnMoreModalContentSeedStorageBehavior = (): JSX.Element => (
  <>
    <p>
      <strong>{strings.INTERMEDIATE}:</strong> {strings.LEARN_MORE_SEED_STORAGE_BEHAVIOR_INTERMEDIATE}
    </p>
    <p>
      <strong>{strings.ORTHODOX}:</strong> {strings.LEARN_MORE_SEED_STORAGE_BEHAVIOR_ORTHODOX}
    </p>
    <p>
      <strong>{strings.RECALCITRANT}:</strong> {strings.LEARN_MORE_SEED_STORAGE_BEHAVIOR_RECALCITRANT}
    </p>
  </>
);

export const LearnMoreModalContentSeedType = (): JSX.Element => (
  <>
    <p>
      <strong>{strings.FRESH}:</strong> {strings.TOOLTIP_VIABILITY_TEST_FRESH}
    </p>
    <p>
      <strong>{strings.STORED}:</strong> {strings.TOOLTIP_VIABILITY_TEST_STORED}
    </p>
  </>
);

export const LearnMoreModalContentSubstrate = (): JSX.Element => (
  <>
    <p>{strings.FOR_LAB_GERMINATION}</p>
    <p>
      <strong>{strings.AGAR_PETRI_DISH}:</strong> {strings.TOOLTIP_VIABILITY_TEST_AGAR_PETRI_DISH}
    </p>
    <p>
      <strong>{strings.PAPER_PETRI_DISH}:</strong> {strings.TOOLTIP_VIABILITY_TEST_PAPER_PETRI_DISH}
    </p>
    <p>
      <strong>{strings.SAND_PETRI_DISH}:</strong> {strings.TOOLTIP_VIABILITY_TEST_SAND_PETRI_DISH}
    </p>
    <p>
      <strong>{strings.NURSERY_MEDIA}:</strong> {strings.TOOLTIP_VIABILITY_TEST_NURSERY_MEDIA}
    </p>
    <p>{strings.FOR_NURSERY_GERMINATION}</p>
    <p>
      <strong>{strings.MEDIA_MIX}:</strong> {strings.TOOLTIP_VIABILITY_TEST_MEDIA_MIX}
    </p>
    <p>
      <strong>{strings.SOIL}:</strong> {strings.TOOLTIP_VIABILITY_TEST_SOIL}
    </p>
    <p>
      <strong>{strings.SAND}:</strong> {strings.TOOLTIP_VIABILITY_TEST_SAND}
    </p>
    <p>
      <strong>{strings.MOSS}:</strong> {strings.TOOLTIP_VIABILITY_TEST_MOSS}
    </p>
    <p>
      <strong>{strings.PERLITE_VERMICULITE}:</strong> {strings.TOOLTIP_VIABILITY_TEST_PERLITE_VERMICULITE}
    </p>
  </>
);

export const LearnMoreModalContentTreatment = (): JSX.Element => (
  <>
    <p>{strings.FOR_LAB_AND_NURSERY_GERMINATION}</p>
    <p>
      <strong>{strings.SOAK}:</strong> {strings.TOOLTIP_VIABILITY_TEST_SOAK}
    </p>
    <p>
      <strong>{strings.SCARIFY}:</strong> {strings.TOOLTIP_VIABILITY_TEST_SCARIFY}
    </p>
    <p>
      <strong>{strings.CHEMICAL}:</strong> {strings.TOOLTIP_VIABILITY_TEST_CHEMICAL}
    </p>
    <p>
      <strong>{strings.STRATIFICATION}:</strong> {strings.TOOLTIP_VIABILITY_TEST_STRATIFICATION}
    </p>
  </>
);

export const LearnMoreModalContentCollectionSource = (): JSX.Element => (
  <>
    <p>
      <strong>{strings.WILD_IN_SITU}:</strong> {strings.WILD_IN_SITU_DESCRIPTION}
    </p>
    <p>
      <strong>{strings.REINTRODUCED}:</strong> {strings.REINTRODUCED_DESCRIPTION}
    </p>
    <p>
      <strong>{strings.CULTIVATED_EX_SITU}:</strong> {strings.CULTIVATED_EX_SITU_DESCRIPTION}
    </p>
  </>
);
