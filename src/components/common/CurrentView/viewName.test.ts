import strings from 'src/strings';

import { getViewNameError } from './viewName';

describe('getViewNameError', () => {
  test.each(['', '   ', '\t\n'])('requires a name when given %j', (name) => {
    expect(getViewNameError(name, [])).toBe(strings.VIEW_NAME_REQUIRED);
  });

  test('reports a required name before checking for duplicates', () => {
    expect(getViewNameError('  ', ['', '  '])).toBe(strings.VIEW_NAME_REQUIRED);
  });

  test('rejects a name that matches an existing name exactly', () => {
    expect(getViewNameError('My View', ['Other', 'My View'])).toBe(strings.VIEW_NAME_EXISTS);
  });

  test('rejects a name that differs from an existing name only by case', () => {
    expect(getViewNameError('my view', ['MY VIEW'])).toBe(strings.VIEW_NAME_EXISTS);
  });

  test('rejects a name that differs from an existing name only by surrounding whitespace', () => {
    expect(getViewNameError('  My View  ', ['My View'])).toBe(strings.VIEW_NAME_EXISTS);
    expect(getViewNameError('My View', ['  my view '])).toBe(strings.VIEW_NAME_EXISTS);
  });

  test('accepts a name that does not match any existing name', () => {
    expect(getViewNameError('My View 2', ['My View', 'Other'])).toBeUndefined();
  });

  test('accepts a name when there are no existing names', () => {
    expect(getViewNameError('My View', [])).toBeUndefined();
  });

  test('treats inner whitespace as significant', () => {
    expect(getViewNameError('My  View', ['My View'])).toBeUndefined();
  });
});
