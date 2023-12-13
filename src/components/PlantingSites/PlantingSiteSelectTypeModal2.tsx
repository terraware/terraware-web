import strings from 'src/strings';
import React, { useState } from 'react';
import { Box, Theme, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button, DialogBox, Icon, IconName } from '@terraware/web-components';
import { SiteType } from 'src/types/PlantingSite';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const useStyles = makeStyles((theme: Theme) => ({
  buttonSpacing: {
    marginRight: theme.spacing(2),
  },
  icon: {
    width: '150px',
    height: '150px',
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
  const { isMobile } = useDeviceInfo();

  const handleClose = () => {
    setDetailed(null);
    onClose();
  };

  const handleNext = () => {
    onNext(detailed ? 'detailed' : 'simple');
    handleClose();
  };

  return (
    <DialogBox
      scrolled
      onClose={handleClose}
      open={open}
      title={strings.ADD_PLANTING_SITE}
      size={'x-large'}
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
      <Box display='flex' flexDirection='column'>
        <Typography fontSize='20px' lineHeight='28px' fontWeight={600} textAlign='left' margin={theme.spacing(1, 0, 3)}>
          {strings.ADD_PLANTING_SITE_TITLE}
        </Typography>
        <Box display='flex' flexDirection={isMobile ? 'column' : 'row'} gap={3}>
          <SiteTypeButton
            description={strings.ADD_PLANTING_SITE_SIMPLE_SITE}
            icon='blobbyIconLeaf'
            isSelected={detailed === false}
            onClick={() => setDetailed(false)}
            title={strings.SIMPLE_SITE}
          />
          <SiteTypeButton
            description={strings.ADD_PLANTING_SITE_DETAILED_SITE}
            icon='blobbyIconSeedBank'
            isSelected={detailed === true}
            onClick={() => setDetailed(true)}
            title={strings.DETAILED_SITE}
          />
        </Box>
      </Box>
    </DialogBox>
  );
}

type SiteTypeButtonProps = {
  description: string;
  icon: IconName;
  isSelected: boolean;
  onClick: () => void;
  title: string;
};

const SiteTypeButton = ({ description, icon, isSelected, onClick, title }: SiteTypeButtonProps): JSX.Element => {
  const theme = useTheme();
  const classes = useStyles();
  const { isMobile } = useDeviceInfo();

  return (
    <Box minWidth={isMobile ? 'auto' : '350px'} display='flex' flexDirection='column'>
      <Box
        width='192px'
        height='192px'
        padding='10px'
        borderRadius={theme.spacing(3)}
        border={
          isSelected ? `4px solid ${theme.palette.TwClrBrdrSelected}` : `2px solid ${theme.palette.TwClrBrdrTertiary}`
        }
        margin='0 auto'
        sx={{ cursor: 'pointer' }}
        onClick={onClick}
      >
        <Box width='160px' height='160px' borderRadius='8px'>
          <Icon name={icon} size='xlarge' className={classes.icon} />
        </Box>
      </Box>
      <Typography fontSize='20px' lineHeight='28px' fontWeight={600} textAlign='center' margin={theme.spacing(2, 0, 3)}>
        {title}
      </Typography>
      <Typography fontSize='16px' lineHeight='24px' fontWeight={400} textAlign='center' whiteSpace='pre-wrap'>
        {description}
      </Typography>
    </Box>
  );
};
