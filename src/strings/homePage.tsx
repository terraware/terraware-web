import LocalizedStrings from 'react-localization';

const strings = new LocalizedStrings({
  en: {
    WELCOME: 'Welcome!',
    WELCOME_PERSON: 'Welcome, {0}!',
    GO_TO: 'Go to {0}',
    PEOPLE_CARD_DESCRIPTION: 'We can’t do it alone! Add people to your Organization and assign them roles.',
    PLANTS_CARD_DESCRIPTION: 'They’ve taken root! View all your plants in one place.',
    ACCESSIONS_CARD_DESCRIPTION:
      'Collect seeds and then record and view your accessions. Seed accessions can be viewed and analyzed by seed bank.',
    SPECIES_CARD_DESCRIPTION: 'View the Species that are referenced by your Seed and Plant entries.',
    SEED_BANKS_CARD_DESCRIPTION: 'How do you process and store your seeds? Add seed banks to your organization.',
    MONITORING_CARD_DESCRIPTION:
      'Add seed banks to your organization and then monitor things like temperature and humidity through their sensor kits.',
  },
});

export default strings;
