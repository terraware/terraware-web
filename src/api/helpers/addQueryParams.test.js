import addQueryParams from 'src/api/helpers/addQueryParams';

const endpoint = 'api/v1/test';

test('addQueryParams returns an unaltered endpoint when params record is empty', () => {
  const params = {};
  expect(addQueryParams(endpoint, params)).toEqual(endpoint);
});

test('addQueryParams returns the correct endpoint when one query parameter is specified', () => {
  const params = { maxNumResults: '10' };
  expect(addQueryParams(endpoint, params)).toEqual(endpoint + '?maxNumResults=10');
});

test('addQueryParams returns the correct endpoint when more than one query parameter is specified', () => {
  const params = { maxNumResults: '10', order: 'ascending', exclude: 'hidden' };
  const expectedEndpoint = endpoint + '?maxNumResults=10&order=ascending&exclude=hidden';
  expect(addQueryParams(endpoint, params)).toEqual(expectedEndpoint);
});
