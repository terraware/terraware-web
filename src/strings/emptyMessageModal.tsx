import LocalizedStrings from 'react-localization';

const strings = new LocalizedStrings({
  en: {
    CHECK_BACK_LATER: 'Please check back later.',
    EMPTY_MESSAGE_CONTRIBUTOR:
      'Once your administrator has created a project and site, you’ll be able to access your data.',
    SEEDS_EMPTY_MSG_BODY: 'Start by creating a project now. You’ll be able to add a site in the next step.',
    SEEDS_EMPTY_MSG_TITLE: 'Just a moment, let’s create a project and site first.',
    SPECIES_EMPTY_MSG_BODY:
      'Enter species that you collect or plant now to simplify your experience when you’re out in the field.',
    NO_SEEDBANKS_ADMIN_TITLE: 'Just a moment, let’s add a seed bank first.',
    NO_SEEDBANKS_ADMIN_MSG: 'Start by adding a seed bank. You’ll then be able to access and create new accessions.',
    NO_SEEDBANKS_NON_ADMIN_TITLE: 'Please reach out to an administrator from your organization.',
    NO_SEEDBANKS_NON_ADMIN_MSG:
      'Before you can add and manage your accessions, you’ll need to add a seed bank within Terraware. Only admins can add seed banks, so please reach out to yours for assistance.',
  },
});

export default strings;
