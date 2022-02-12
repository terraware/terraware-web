import LocalizedStrings from 'react-localization';

const strings = new LocalizedStrings({
  en: {
    GOOD_MORNING: 'Good morning!',
    GOOD_MORNING_PERSON: 'Good morning, {0}!',
    GO_TO: 'Go to {0}',
    PEOPLE_CARD_DESCRIPTION: 'We can’t do it alone! Add people to your Organization and assign them roles.',
    PLANTS_CARD_DESCRIPTION:
      'They’ve taken root! View all your plants in one place. Plants can be viewed and analyzed by Project.',
    PROJECTS_CARD_DESCRIPTION:
      'Manage Projects to organize all your Earth saving activities and data. A reforestation Project, for example, will have Sites, which in turn will have Facilities, along with team members who will be involved with the Project.',
    SITES_CARD_DESCRIPTION: 'View Sites under your Project. A Project may have one or more Sites.',
    SEEDS_CARD_DESCRIPTION:
      'Collect seeds and then record and view your accessions. Seed accessions can be viewed and analyzed by Facilities.',
    SPECIES_CARD_DESCRIPTION: 'View the Species that are referenced by your Seed and Plant entries.',
  },
});

export default strings;
