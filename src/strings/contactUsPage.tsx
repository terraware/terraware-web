import LocalizedStrings from 'react-localization';

const strings = new LocalizedStrings({
  en: {
    DESCRIPTION_REPORT_PROBLEM:
      'If you’re having trouble using Terraware, please report any issues you’re having and we’ll make it right. Let us know this build version "${process.env.REACT_APP_TERRAWARE_FE_BUILD_VERSION}".',
    DESCRIPTION_REQUEST_FEATURE:
      'We’re always working to improve your Terraware experience and welcome your feedback on our products.',
    DESCRIPTION_TEST_APP: 'Be the first to try our new, field-tested mobile app and let us know what you think.',
    TITLE_REPORT_PROBLEM: 'Report a Problem',
    TITLE_REQUEST_FEATURE: 'Request a Feature',
    TITLE_TEST_APP: 'Test our Mobile App',
  },
});

export default strings;
