import strings from 'src/strings';
import React, { useState } from 'react';
import { FormControlLabel, Radio, RadioGroup, Theme, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button, DialogBox } from '@terraware/web-components';
import { SiteType } from 'src/types/PlantingSite';

const useStyles = makeStyles((theme: Theme) => ({
  buttonSpacing: {
    marginRight: theme.spacing(2),
  },
}));

export type PlantingSiteSelectTypeModalProps = {
  open: boolean;
  onNext: (siteType: SiteType) => void;
  onClose: () => void;
};

export default function PlantingSiteSelectTypeModal(props: PlantingSiteSelectTypeModalProps): JSX.Element {
  const { open, onNext, onClose } = props;
  const classes = useStyles();
  const theme = useTheme();
  const [detailed, setDetailed] = useState<boolean | null>(null);

  const handleClose = () => {
    setDetailed(null);
    onClose();
  };

  const handleNext = () => {
    onNext(detailed ? 'detailed' : 'simple');
    handleClose();
  };

  const handleTypeChange = (_: React.ChangeEvent<HTMLInputElement>, value: string) => {
    if (value === 'detailed') {
      setDetailed(true);
    } else {
      setDetailed(false);
    }
  };

  return (
    <DialogBox
      scrolled
      onClose={handleClose}
      open={open}
      title={strings.SELECT_PLANTING_SITE_TYPE}
      size={'medium'}
      middleButtons={[
        <Button
          onClick={handleClose}
          id='cancel'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          className={classes.buttonSpacing}
          key='button-1'
        />,
        <Button onClick={handleNext} id='next' label={strings.NEXT} key='button-2' disabled={detailed === null} />,
      ]}
    >
      <Typography marginBottom={theme.spacing(3)} justifyContent='center'>
        {strings.SELECT_PLANTING_SITE_TYPE_DESCRIPTION_1}
      </Typography>
      <Typography marginBottom={theme.spacing(3)} justifyContent='center'>
        {strings.SELECT_PLANTING_SITE_TYPE_DESCRIPTION_2}
      </Typography>
      <Typography marginBottom={theme.spacing(3)} justifyContent='center'>
        {strings.SELECT_PLANTING_SITE_TYPE_DESCRIPTION_3}
      </Typography>

      <Typography color={theme.palette.TwClrTxtSecondary} display='flex' fontSize={14}>
        {strings.PLANTING_SITE_TYPE}
      </Typography>
      <RadioGroup defaultValue={null} name='radio-buttons-group' onChange={handleTypeChange}>
        <FormControlLabel value='simple' control={<Radio />} label={strings.PLANTING_SITE_TYPE_SIMPLE} />
        <FormControlLabel value='detailed' control={<Radio />} label={strings.PLANTING_SITE_TYPE_DETAILED} />
      </RadioGroup>
    </DialogBox>
  );
}
