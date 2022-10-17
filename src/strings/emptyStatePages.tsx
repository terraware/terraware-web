import LocalizedStrings from 'react-localization';

const strings = new LocalizedStrings({
  en: {
    NO_SPECIES_DESCRIPTION:
      'It looks like you haven’t added any species yet. Having a master species list helps streamline your organization’s seed and plant data entry. You can either add species manually and individually, or import data from a CSV.',
    IMPORT_SPECIES_DESCRIPTION: 'Upload a CSV with scientific names and other optional fields.',
    DOWNLOAD_CSV_TEMPLATE: 'Download a CSV template here.',
    ADD_SPECIES_MANUALLY_DESCRIPTION:
      'Enter scientific name and other optional fields manually, one species at a time.',
    ADD_SEED_BANK_SUBTITLE:
      'How do you process and store your seeds? Set up your seed bank so you can keep track of where your seeds are stored.',
    ADD_NURSERY_SUBTITLE:
      'How do you manage your seedlings? Set up your nursery so you can keep track of your seedlings’ growth.',
    NO_INVENTORY_DESCRIPTION:
      'It looks like you haven’t added inventory yet. You can either import data from a CSV file, or add inventory using our inventory form.',
    IMPORT_INVENTORY_DESCRIPTION: 'Upload a CSV with species, quantities, and other fields.',
    ADD_INVENTORY_MANUALLY_DESCRIPTION:
      'Enter species, quantities, and other relevant information using our inventory form.',
  },
});

export default strings;
