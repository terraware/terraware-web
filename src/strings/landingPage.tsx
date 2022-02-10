import LocalizedStrings from 'react-localization';

const strings = new LocalizedStrings({
  en: {
    TITLE_WELCOME: 'Welcome to Terraware',
    SUBTITLE_GET_STARTED:
      "To get started, please create your organization now. You'll also be able to set up and manage information on projects, sites, people, and species.",
    DESCRIPTION_ORGANIZATION: 'Your organization may include projects, sites, people, and species.',
    DESCRIPTION_PROJECTS: 'Projects are folders that allow you to group your planting sites.',
    DESCRIPTION_SITES: 'Sites represent each of your planting locations.',
    DESCRIPTION_PEOPLE: 'Invite those who contribute to the organization’s success.',
    DESCRIPTION_SPECIES: 'Manage species that you collect or plant.',
    BUTTON_CREATE_ORGANIZATION: 'Create Organization',
    FOOTNOTE_WAIT_FOR_INVITATION:
      'Not interested in creating your own organization or expecting an invitation? Don’t worry. You’ll receive an email when your admin adds you to the organization.',
  },
});

export default strings;
