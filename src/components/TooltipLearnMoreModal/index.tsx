import React, { type JSX } from 'react';

import { Box, Link, useTheme } from '@mui/material';

import { useLocalization } from 'src/providers';
import strings from 'src/strings';

import DialogBox from '../common/DialogBox/DialogBox';
import Button from '../common/button/Button';

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
  const theme = useTheme();
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
      <Box
        sx={{
          color: theme.palette.TwClrTxt,
          textAlign: 'left',
        }}
      >
        {content}
      </Box>
    </DialogBox>
  );
}

export const LearnMoreLink = (props: { onClick: () => void }): JSX.Element => {
  const theme = useTheme();
  const { onClick } = props;

  return (
    <>
      {' '}
      <Link
        component='button'
        onClick={onClick}
        sx={{
          color: theme.palette.TwClrTxtInverse,
          fontSize: 'inherit',
          textDecorationColor: theme.palette.TwClrTxtInverse,
          verticalAlign: 'text-top',
        }}
      >
        {strings.LEARN_MORE}
      </Link>
    </>
  );
};

export const LearnMoreModalContentGrowthForm = (): JSX.Element => {
  const { activeLocale } = useLocalization();
  const collator = new Intl.Collator(activeLocale || undefined);

  const elements: JSX.Element[] = [
    [strings.FERN, strings.LEARN_MORE_GROWTH_FORM_FERN],
    [strings.GRAMINOID, strings.LEARN_MORE_GROWTH_FORM_GRAMINOID],
    [strings.FORB, strings.LEARN_MORE_GROWTH_FORM_FORB],
    [strings.SHRUB, strings.LEARN_MORE_GROWTH_FORM_SHRUB],
    [strings.TREE, strings.LEARN_MORE_GROWTH_FORM_TREE],
    [strings.FUNGUS, strings.LEARN_MORE_GROWTH_FORM_FUNGUS],
    [strings.LICHEN, strings.LEARN_MORE_GROWTH_FORM_LICHEN],
    [strings.MOSS, strings.LEARN_MORE_GROWTH_FORM_MOSS],
    [strings.VINE, strings.LEARN_MORE_GROWTH_FORM_VINE],
    [strings.LIANA, strings.LEARN_MORE_GROWTH_FORM_LIANA],
    [strings.SUBSHRUB, strings.LEARN_MORE_GROWTH_FORM_SUBSHRUB],
    [strings.MULTIPLE_FORMS, strings.LEARN_MORE_GROWTH_FORM_MULTIPLE_FORMS],
    [strings.HERB, strings.LEARN_MORE_GROWTH_FORM_HERB],
  ]
    .sort((a, b) => collator.compare(a[0], b[0]))
    .map(([name, description], index) => (
      <p key={`growthForm-${index}`}>
        <strong>{name}:</strong> {description}
      </p>
    ));

  return <>{elements}</>;
};

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
    <p>
      <strong>
        {strings.LIKELY_INTERMEDIATE} / {strings.LIKELY_ORTHODOX} / {strings.LIKELY_RECALCITRANT}:
      </strong>
      {' ' + strings.LEARN_MORE_SEED_STORAGE_BEHAVIOR_LIKELY}
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
