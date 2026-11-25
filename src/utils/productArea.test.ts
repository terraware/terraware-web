import { ProductArea, addProductAreaToEvent, getProductArea } from './productArea';

describe('getProductArea', () => {
  const cases: [string, ProductArea][] = [
    ['/accessions/123', 'Seed Bank'],
    ['/seeds/withdrawals', 'Seed Bank'],
    ['/inventory/species/5/batch/9', 'Nursery'],
    ['/batch/withdraw', 'Nursery'],
    ['/plants/planting-seasons/3', 'Planting'],
    ['/observations/70/stratum/x', 'Observations'],
    ['/species/new', 'Species'],
    ['/projects/12', 'Projects'],
    ['/projects/12/modules/3/sessions/4', 'Accelerator Participant'],
    ['/accelerator/projects/868/reports', 'Accelerator Console'],
    ['/deliverables', 'Accelerator Participant'],
    ['/reports/26', 'Accelerator Participant'],
    ['/funder/home', 'Funder'],
    ['/seed-fund-reports', 'Seed Fund Reports'],
    ['/people/4', 'Org & Settings'],
    ['/', 'Home'],
    ['/home', 'Home'],
    ['/welcome', 'Home'],
    ['/help-support', 'Help'],
    ['/login', 'Other'],
    ['/error/cannot-fetch-org-data', 'Other'],
  ];

  it.each(cases)('should map %s to %s', (pathname, area) => {
    expect(getProductArea(pathname)).toBe(area);
  });

  it('should not treat lookalike prefixes as the wrong area', () => {
    expect(getProductArea('/seedlings-dashboard')).toBe('Nursery');
    expect(getProductArea('/inventory-planning')).toBe('Nursery');
  });
});

describe('addProductAreaToEvent', () => {
  it('should use current_url_path when present', () => {
    const event = {
      properties: { current_url_path: '/accessions/1', $current_url: 'https://example.com/species' },
    };
    expect(addProductAreaToEvent(event).properties?.product_area).toBe('Seed Bank');
  });

  it('should fall back to the pathname of $current_url', () => {
    const event = { properties: { $current_url: 'https://example.com/species/new?x=1' } };
    expect(addProductAreaToEvent(event).properties?.product_area).toBe('Species');
  });

  it('should return the event unchanged when no URL properties are present', () => {
    const event = { properties: { foo: 'bar' } };
    expect(addProductAreaToEvent(event)).toBe(event);
  });

  it('should return the event unchanged when $current_url is not a valid URL', () => {
    const event = { properties: { $current_url: 'not a url' } };
    expect(addProductAreaToEvent(event)).toBe(event);
  });

  it('should return the event unchanged when there are no properties', () => {
    const event = {};
    expect(addProductAreaToEvent(event)).toBe(event);
  });

  it('should keep an explicit string product_area even when the URL points to a different area', () => {
    const event = { properties: { product_area: 'Species', current_url_path: '/home' } };
    const result = addProductAreaToEvent(event);

    expect(result).toBe(event);
    expect(result.properties?.product_area).toBe('Species');
  });

  it('should compute product_area from the URL when the existing value is not a string', () => {
    const event = { properties: { product_area: undefined, current_url_path: '/accessions/1' } };
    expect(addProductAreaToEvent(event).properties?.product_area).toBe('Seed Bank');
  });

  it('should not mutate the input event and should keep other properties', () => {
    const event = { event: 'Clicked', properties: { current_url_path: '/home', foo: 'bar' } };
    const result = addProductAreaToEvent(event);

    expect(event.properties).toEqual({ current_url_path: '/home', foo: 'bar' });
    expect(result).not.toBe(event);
    expect(result).toEqual({
      event: 'Clicked',
      properties: { current_url_path: '/home', foo: 'bar', product_area: 'Home' },
    });
  });
});
