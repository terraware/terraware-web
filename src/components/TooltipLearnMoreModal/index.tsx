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
    textAlign: 'left',
  },
  learnMoreLink: {
    color: '#fff',
    fontSize: 'inherit',
    marginLeft: '.5em',
    textDecorationColor: '#fff',
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
      middleButtons={[<Button onClick={onClose} label={strings.DONE} />]}
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
    <Link className={classes.learnMoreLink} component='button' onClick={onClick}>
      {strings.LEARN_MORE}
    </Link>
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
