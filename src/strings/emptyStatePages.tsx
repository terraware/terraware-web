import LocalizedStrings from 'react-localization';

const strings = new LocalizedStrings({
  en: {
    NO_PROJECTS_SUBTITLE:
      'What projects are you focused on? Like folders, projects keep you organized and connected by grouping your team’s work in one place.',
    NO_PROJECTS_DESCRIPTION_PEOPLE: 'Add people for each project.',
    NO_PROJECTS_DESCRIPTION_PROJECTS: 'Define your project type and status.',
    NO_PROJECTS_DESCRIPTION_SITES: 'View sites linked to your projects.',
    NO_SITES_SUBTITLE: 'Where are you planting? Create a site for each of your planting locations.',
    NO_SITES_DESCRIPTION_PROJECTS: 'Assign your planting site to a project.',
    NO_SITES_DESCRIPTION_SITES: 'Name and describe your planting site.',
    NO_SPECIES_DESCRIPTION:
      'It looks like you haven’t added any species yet. Having a master species list helps streamline your organization’s seed and plant data entry. You can either add species manually and individually, or import data from a CSV.',
    IMPORT_SPECIES_DESCRIPTION: 'Upload a CSV with scientific names and other optional fields.',
    IMPORT_SPECIES_LINK: 'Download a CSV template here.',
    ADD_MANUALLY_DESCRIPTION: 'Enter scientific name and other optional fields manually, one species at a time.',
  },
});

export default strings;
