import React, { type JSX } from 'react';

import { Box, Link, useTheme } from '@mui/material';

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
