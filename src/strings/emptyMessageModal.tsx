import LocalizedStrings from 'react-localization';

const strings = new LocalizedStrings({
  en: {
    CHECK_BACK_LATER: 'Please check back later.',
    COLLECT_IN_FIELD_PLANT_DATA: 'Collect In-field Plant Data',
    EMPTY_MESSAGE_CONTRIBUTOR:
      'Once your administrator has created a project and site, you’ll be able to access your data.',
    PLANTS_EMPTY_MSG_BODY:
      'Start by creating a project now. You’ll be able to add a site in the next step. Once both of these are set up, please request our new mobile app to begin collecting data.',
    PLANTS_EMPTY_MSG_TITLE: 'Just a moment, let’s create a project and site first.',
    SPECIES_EMPTY_MSG_BODY:
      'Enter species that you collect or plant now to simplify your experience when you’re out in the field.',
    REQUEST_MOBILE_APP: 'Request Mobile App',
    TERRAWARE_MOBILE_APP_INFO_MSG:
      'Our Terraware mobile app is used to collect in-field plant data and is still in beta testing. To be the first to try it out, send us a request.',
  },
});

export default strings;
