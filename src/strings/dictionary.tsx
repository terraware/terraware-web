import LocalizedStrings from 'react-localization';

/*
 * This is where we define general strings whose variable names equal their value.
 * These strings are usually short, no more than 3 words long, and useful across multiple
 * pages in the app.
 * For example, a string definition like this belongs in this file
 *    HELLO: 'Hello'
 * Meanwhile, a string definition like this does NOT belong in this file
 *    GREETING: 'Hello and welcome to Terraware!'
 *
 * TODO: Move relevant strings from ./strings.tsx into this file.
 */
const dictionary = new LocalizedStrings({
  en: {
    ADD_A_SPECIES: 'Add a Species',
    ADD_CONTRIBUTORS: 'Add Contributors',
    CONTACT_US: 'Contact Us',
    CONTRIBUTORS: 'Contributors',
    CREATE_A_PROJECT: 'Create a Project',
    CREATE_A_SITE: 'Create a Site',
    CREATE_ORGANIZATION: 'Create Organization',
    EDIT_PERSON: 'Edit Person',
    INCORRECT_EMAIL_FORMAT: 'Incorrect email format.',
    PERSON_ADDED: 'Person Added',
    PROJECT_PROFILE: 'Project Profile',
    REPORT_PROBLEM: 'Report Problem',
    REQUEST_FEATURE: 'Request Feature',
    REQUIRED_FIELD: 'Required Field',
    SITE_PROFILE: 'Site Profile',
    EDIT_ACCOUNT: 'Edit Account',
    GENERAL: 'General',
    NOTIFICATIONS: 'Notifications',
    ORGANIZATIONS: 'Organizations',
    LEAVE_ORGANIZATION: 'Leave Organization',
    ASSIGN_NEW_OWNER: 'Assign New Owner',
    CANNOT_REMOVE: 'Cannot Remove',
    DELETE_ORGANIZATION: 'Delete Organization',
    REMOVE_PERSON: 'Remove Person',
    REMOVE_PERSON_DESC:
      'Are you sure you want to remove {0}? Removing {0} means they won’t have access to your organization’s data anymore.',
    REMOVE_PEOPLE: 'Remove People',
    REMOVE_PEOPLE_DESC:
      'Are you sure you want to remove these people? Removing these people means they won’t have access to your organization’s data anymore.',
    IMPORT_SPECIES_LIST: 'Import Species List',
    ADD_MANUALLY: 'Add Manually',
  },
});

export default dictionary;
