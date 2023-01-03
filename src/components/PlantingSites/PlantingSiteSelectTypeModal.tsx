import strings from 'src/strings';
import Button from 'src/components/common/button/Button';
import React, { useState } from 'react';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import { FormControlLabel, Radio, RadioGroup, Theme, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  buttonSpacing: {
    marginRight: theme.spacing(2),
  },
}));

export type PlantingSiteSelectTypeModalProps = {
  open: boolean;
  onNext: (goToCreate: boolean) => void;
  onClose: () => void;
};

export default function PlantingSiteSelectTypeModal(props: PlantingSiteSelectTypeModalProps): JSX.Element {
  const { open, onNext, onClose } = props;
  const classes = useStyles();
  const theme = useTheme();
  const [withMap, setWithMap] = useState<boolean | null>(null);

  const handleClose = () => {
    setWithMap(null);
    onClose();
  };

  const handleNext = () => {
    onNext(withMap === false);
    handleClose();
  };

  const handleTypeChange = (_: React.ChangeEvent<HTMLInputElement>, value: string) => {
    if (value === 'withMap') {
      setWithMap(true);
    } else {
      setWithMap(false);
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
        <Button onClick={handleNext} id='next' label={strings.NEXT} key='button-2' disabled={withMap === null} />,
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
        <FormControlLabel value='withMap' control={<Radio />} label={strings.WITH_MAP} />
        <FormControlLabel value='withoutMap' control={<Radio />} label={strings.WITHOUT_MAP} />
      </RadioGroup>
    </DialogBox>
  );
}
