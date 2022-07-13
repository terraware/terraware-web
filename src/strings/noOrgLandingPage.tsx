import LocalizedStrings from 'react-localization';

const strings = new LocalizedStrings({
  en: {
    TITLE_WELCOME: 'Welcome to Terraware',
    SUBTITLE_GET_STARTED:
      "To get started, please create your organization now. You'll also be able to set up and manage information on people and species.",
    DESCRIPTION_ORGANIZATION: 'Your organization may include people, and species.',
    DESCRIPTION_PEOPLE: 'Invite those who contribute to the organization’s success.',
    DESCRIPTION_SPECIES: 'Manage species that you collect or plant.',
    FOOTNOTE_WAIT_FOR_INVITATION_1: 'Not interested in creating your own organization or expecting an invitation?',
    FOOTNOTE_WAIT_FOR_INVITATION_2:
      'Don’t worry. You’ll receive an email when your admin adds you to the organization.',
  },
});

export default strings;
