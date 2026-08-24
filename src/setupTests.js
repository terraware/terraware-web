// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Start the mock API server and fail any test that makes an unmocked request.
import './test-utils/msw/setup';
// Load the string tables before anything renders, so components see real copy rather than
// undefined. See src/test-utils/README.md.
import './test-utils/setupStrings';
