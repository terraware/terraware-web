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
      <strong>Fern:</strong> A non-flowering vascular plant that reproduces by spores, in the plant division
      Pteridophyta.
    </p>
    <p>
      <strong>Graminoid:</strong> A herbaceous (non-woody) plant with a grass-like morphology, that is elongated culms
      with long, blade-like leaves, in the grass, sedge, or rush family.
    </p>
    <p>
      <strong>Forb:</strong> A herbaceous (non-woody) plant that is NOT a graminoid (grass, sedge, or rush).
    </p>
    <p>
      <strong>Shrub:</strong> A woody plant which is smaller than a tree and has several main stems arising at or near
      the ground.
    </p>
    <p>
      <strong>Tree:</strong> A woody perennial plant, typically having a single stem or trunk growing to a considerable
      height and bearing lateral branches at some distance from the ground.
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
