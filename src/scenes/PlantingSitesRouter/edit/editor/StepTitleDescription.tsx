import React, { useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import TextWithLink from 'src/components/common/TextWithLink';
import VideoDialog from 'src/components/common/VideoDialog';
import { DocType, useDocLinks } from 'src/docLinks';
import { useUser } from 'src/providers';

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
  tutorialDescription?: string | JSX.Element[];
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
  const docLinks = useDocLinks();
  const { userPreferences, updateUserPreferences } = useUser();

  // show the modal automatically if it is user preference controlled, and value is not set to true (dont show preference)
  const userPreferenceControlled = useMemo<boolean>(
    () => !!dontShowAgainPreferenceName && userPreferences[dontShowAgainPreferenceName] !== true,
    [dontShowAgainPreferenceName, userPreferences]
  );
  const [showModal, setShowModal] = useState<boolean>(userPreferenceControlled);

  const onClose = (dontShowAgain?: boolean) => {
    setShowModal(false);
    if (dontShowAgain && !!dontShowAgainPreferenceName) {
      updateUserPreferences({ ...userPreferences, [dontShowAgainPreferenceName]: true });
    }
  };

  return (
    <Box marginBottom={theme.spacing(2)} display='flex' flexDirection='column' minHeight={minHeight}>
      {tutorialDescription && tutorialDocLinkKey && tutorialTitle && (
        <VideoDialog
          description={tutorialDescription}
          link={docLinks[tutorialDocLinkKey]}
          onClose={() => onClose()}
          onDontShowAgain={userPreferenceControlled ? () => onClose(true) : undefined}
          open={showModal}
          title={tutorialTitle}
        />
      )}
      <Typography fontSize='20px' fontWeight={600} lineHeight='28px' color={theme.palette.TwClrTxt}>
        {title}
      </Typography>
      {description.map((line: Description, index: number) => (
        <Typography
          display='inline'
          alignItems='center'
          key={index}
          fontSize='14px'
          fontWeight={line.isBold ? 600 : 400}
          lineHeight='20px'
          color={line.isWarning ? theme.palette.TwClrIcnWarning : theme.palette.TwClrTxt}
          margin={theme.spacing(1, 0)}
          whiteSpace={'line-wrap'}
        >
          {line.hasTutorial ? (
            <TextWithLink
              fontSize='14px'
              handlePrefix={line.handlePrefix}
              handleSuffix={line.handleSuffix}
              onClick={() => setShowModal(true)}
              text={line.text as string}
              key={index}
              style={{ marginLeft: theme.spacing(0.5) }}
            />
          ) : (
            line.text
          )}
        </Typography>
      ))}
    </Box>
  );
}
