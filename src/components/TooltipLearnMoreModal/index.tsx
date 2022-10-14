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
      <strong>Endangered:</strong> Species that are rare and whose wild populations have a high risk of extinction; see
      also any local definitions.
    </p>
    <p>
      <strong>Rare:</strong> Species with limited wild population sizes, often found in isolated geographical locations;
      may meet criteria for endangered or threatened status but have not yet been legally listed or assessed.
    </p>
  </>
);

export const LearnMoreModalContentSeedStorageBehavior = (): JSX.Element => (
  <>
    <p>
      <strong>Intermediate:</strong> Seeds are between orthodox and recalcitrant seeds in their behavior; may include
      tolerating partial desiccation, tolerating cool but not freezing temperatures, or being short-lived regardless of
      storage conditions.
    </p>
    <p>
      <strong>Orthodox:</strong> Seeds tolerate levels of desiccation required for frozen storage (5-8% moisture
      content) and temperatures of -20°C or lower.
    </p>
    <p>
      <strong>Recalcitrant:</strong> Seeds do not tolerate levels of desiccation required for ex situ (off-site)
      conservation.
    </p>
  </>
);
