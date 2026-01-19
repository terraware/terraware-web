import React, { type JSX, useCallback, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';

import TextWithLink from 'src/components/common/TextWithLink';
import { useDocLinks } from 'src/docLinks';
import strings from 'src/strings';
import { SiteType } from 'src/types/PlantingSite';
import { getRgbaFromHex } from 'src/utils/color';
import useDeviceInfo from 'src/utils/useDeviceInfo';

export type PlantingSiteSelectTypeModalProps = {
  open: boolean;
  onNext: (siteType: SiteType) => void;
  onClose: () => void;
};

export default function PlantingSiteSelectTypeModal(props: PlantingSiteSelectTypeModalProps): JSX.Element {
  const { open, onNext, onClose } = props;
  const theme = useTheme();
  const [detailed, setDetailed] = useState<boolean | null>(null);
  const { isMobile } = useDeviceInfo();
  const docLinks = useDocLinks();

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
          key='button-1'
          style={{ marginRight: theme.spacing(2) }}
        />,
        <Button onClick={handleNext} id='next' label={strings.NEXT} key='button-2' disabled={detailed === null} />,
      ]}
    >
      <Box display='flex' flexDirection='column'>
        <Typography fontSize='20px' lineHeight='28px' fontWeight={600} textAlign='left' margin={theme.spacing(1, 0, 3)}>
          {strings.ADD_PLANTING_SITE_TITLE}
        </Typography>
        <Box display='flex' flexDirection={isMobile ? 'column' : 'row'} gap={3}>
          <SiteTypeSelector
            imageName='select-planting-site-simple@2x.png'
            description={strings.ADD_PLANTING_SITE_SIMPLE_SITE}
            isSelected={detailed === false}
            onClick={() => setDetailed(false)}
            title={strings.SIMPLE_SITE}
          />
          <SiteTypeSelector
            imageName='select-planting-site-detailed@2x.png'
            description={strings.ADD_PLANTING_SITE_DETAILED_SITE}
            isSelected={detailed === true}
            onClick={() => setDetailed(true)}
            title={strings.DETAILED_SITE}
          />
        </Box>
        <Box margin={theme.spacing(3, 0, 0, 0)}>
          <TextWithLink
            fontSize='16px'
            href={docLinks.knowledge_base_stratification}
            isExternal
            text={strings.LEARN_MORE_STRATA}
          />
        </Box>
      </Box>
    </DialogBox>
  );
}

/**
 * The clickable button/image for planting site type selection.
 * This can be extracted out as a reusable component as needed later.
 */
type SiteTypeButtonProps = {
  imageName: string;
  isSelected: boolean;
  onClick: () => void;
};

const SiteTypeButton = ({ imageName, isSelected, onClick }: SiteTypeButtonProps): JSX.Element => {
  const theme = useTheme();

  const rgb = useCallback(
    (opacity: number): string => getRgbaFromHex(theme.palette.TwClrBgSelected as string, opacity / 100),
    [theme]
  );

  return (
    <Box
      width='192px'
      height='192px'
      padding='10px'
      borderRadius={theme.spacing(3)}
      border={`2px solid ${theme.palette.TwClrBrdrTertiary}`}
      margin='0 auto'
      display='flex'
      justifyContent='center'
      sx={{
        cursor: 'pointer',
        backgroundColor: rgb(isSelected ? 100 : 0),
        '&:hover': { backgroundColor: rgb(isSelected ? 100 : 10) },
        '&:active': { backgroundColor: rgb(isSelected ? 100 : 20) },
      }}
      onClick={onClick}
    >
      <Box
        width='160px'
        height='160px'
        margin='auto'
        borderRadius='8px'
        sx={{
          backgroundImage: `url(/assets/${imageName})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          '&:active': { border: `1px solid ${theme.palette.TwClrBgSelected}` },
        }}
      />
    </Box>
  );
};

/**
 * Planting Site type selector that renders a selection button
 * with title and description.
 */
type SiteTypeSelectorProps = SiteTypeButtonProps & {
  description: string;
  title: string;
};

const SiteTypeSelector = (props: SiteTypeSelectorProps): JSX.Element => {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const { description, title } = props;
  const { ...buttonProps }: SiteTypeButtonProps = props;

  return (
    <Box minWidth={isMobile ? 'auto' : '350px'} display='flex' flexDirection='column'>
      <SiteTypeButton {...buttonProps} />
      <Typography fontSize='20px' lineHeight='28px' fontWeight={600} textAlign='center' margin={theme.spacing(2, 0, 3)}>
        {title}
      </Typography>
      <Typography fontSize='16px' lineHeight='24px' fontWeight={400} textAlign='center' whiteSpace='pre-wrap'>
        {description}
      </Typography>
    </Box>
  );
};
