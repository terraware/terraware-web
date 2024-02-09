import { useState } from 'react';
import { Box, Theme, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import TextWithLink from 'src/components/common/TextWithLink';
import VideoDialog from 'src/components/common/VideoDialog';
import { useDocLinks, DocType } from 'src/docLinks';

const useStyles = makeStyles((theme: Theme) => ({
  clickableText: {
    marginLeft: theme.spacing(0.5),
  },
}));

export type Description = {
  handlePrefix?: (prefix: string) => string | JSX.Element[];
  handleSuffix?: (suffix: string) => string | JSX.Element[];
  hasTutorial?: boolean;
  isWarning?: boolean;
  isBold?: boolean;
  text: string | JSX.Element[];
};

export type StepTitleDescriptionProps = {
  description: Description[];
  dontShowAgainPreferenceName?: string;
  minHeight?: string;
  title: string;
  tutorialDescription?: string;
  tutorialDocLinkKey?: DocType;
  tutorialTitle?: string;
};

export default function StepTitleDescription(props: StepTitleDescriptionProps): JSX.Element {
  const {
    description,
    dontShowAgainPreferenceName,
    minHeight,
    title,
    tutorialDescription,
    tutorialDocLinkKey,
    tutorialTitle,
  } = props;
  const theme = useTheme();
  const classes = useStyles();
  const docLinks = useDocLinks();

  // this is a placeholder for the instructions modal trigger
  const [showModal, setShowModal] = useState<boolean>(dontShowAgainPreferenceName !== undefined);
  const [dontShowModalAgain, setDontShowModalAgain] = useState<boolean>(dontShowAgainPreferenceName === undefined);

  const onClose = (dontShowAgain?: boolean) => {
    setShowModal(false);
    if (dontShowAgain) {
      setDontShowModalAgain(true);
    }
  };

  return (
    <Box marginBottom={theme.spacing(2)} display='flex' flexDirection='column' minHeight={minHeight}>
      {tutorialDescription && tutorialDocLinkKey && tutorialTitle && (
        <VideoDialog
          description={tutorialDescription}
          link={docLinks[tutorialDocLinkKey]}
          onClose={() => onClose()}
          onDontShowAgain={dontShowModalAgain ? undefined : () => onClose(true)}
          open={showModal}
          title={tutorialTitle}
        />
      )}
      <Typography fontSize='20px' fontWeight={600} lineHeight='28px' color={theme.palette.TwClrTxt}>
        {title}
      </Typography>
      {description.map((line: Description, index: number) => (
        <Typography
          display='flex'
          alignItems='center'
          key={index}
          fontSize='14px'
          fontWeight={line.isBold ? 600 : 400}
          lineHeight='20px'
          color={line.isWarning ? theme.palette.TwClrIcnWarning : theme.palette.TwClrTxt}
          margin={theme.spacing(1, 0)}
        >
          {line.hasTutorial ? (
            <TextWithLink
              className={classes.clickableText}
              fontSize='14px'
              handlePrefix={line.handlePrefix}
              handleSuffix={line.handleSuffix}
              onClick={() => setShowModal(true)}
              text={line.text as string}
              key={index}
            />
          ) : (
            line.text
          )}
        </Typography>
      ))}
    </Box>
  );
}
