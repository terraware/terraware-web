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
    CONTACT_US: 'Contact Us',
    CREATE_A_PROJECT: 'Create a Project',
    CREATE_A_SITE: 'Create a Site',
    CREATE_ORGANIZATION: 'Create Organization',
    PROJECT_PROFILE: 'Project Profile',
    REPORT_PROBLEM: 'Report Problem',
    REQUEST_FEATURE: 'Request Feature',
    REQUEST_MOBILE_APP: 'Request Mobile App',
    SITE_PROFILE: 'Site Profile',
  },
});

export default dictionary;
