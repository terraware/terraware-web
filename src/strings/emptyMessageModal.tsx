import LocalizedStrings from 'react-localization';

const strings = new LocalizedStrings({
  en: {
    CHECK_BACK_LATER: 'Please check back later.',
    SPECIES_EMPTY_MSG_BODY:
      'Enter species that you collect or plant now to simplify your experience when you’re out in the field.',
    NO_SEEDBANKS_ADMIN_TITLE: 'Just a moment, let’s add a seed bank first.',
    NO_SEEDBANKS_ADMIN_MSG: 'Start by adding a seed bank. You’ll then be able to access and create new accessions.',
    NO_SEEDBANKS_MONITORING_ADMIN_MSG:
      "Start by adding a seed bank. If your seed bank was built by Terraformation, you’ll then be able to monitor things like the seed bank's temperature and humidity.",
    NO_SEEDBANKS_NON_ADMIN_TITLE: 'Please reach out to an administrator from your organization.',
    NO_SEEDBANKS_NON_ADMIN_MSG:
      'Before you can add and manage your accessions, you’ll need to add a seed bank within Terraware. Only admins can add seed banks, so please reach out to yours for assistance.',
    NO_SEEDBANKS_MONITORING_NON_ADMIN_MSG:
      'Before you can begin remotely monitoring things like temperature and humidity through a seed bank’s sensor kit, you’ll need to add a seed bank within Terraware. Only admins can add seed banks, so please reach out to yours for assistance.',
    NO_SEEDBANKS_SET_UP_NON_ADMIN_MSG:
      "If your seed bank was built by Terraformation, it is equipped with a sensor kit that you can remotely monitor things like the seed bank's temperature and humidity. Your seed bank either does not have a sensor kit, or it has not yet been set up by your administrator.",
  },
});

export default strings;
