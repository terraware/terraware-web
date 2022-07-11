import LocalizedStrings from 'react-localization';

const strings = new LocalizedStrings({
  en: {
    WELCOME: 'Welcome!',
    WELCOME_PERSON: 'Welcome, {0}!',
    GO_TO: 'Go to {0}',
    PEOPLE_CARD_DESCRIPTION: 'We can’t do it alone! Add people to your Organization and assign them roles.',
    PLANTS_CARD_DESCRIPTION: 'They’ve taken root! View all your plants in one place.',
    SEEDS_CARD_DESCRIPTION:
      'Collect seeds and then record and view your accessions. Seed accessions can be viewed and analyzed by Facilities.',
    SPECIES_CARD_DESCRIPTION: 'View the Species that are referenced by your Seed and Plant entries.',
  },
});

export default strings;
