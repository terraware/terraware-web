import { APP_PATHS } from 'src/constants';

import { getOrganizationSwitchPath } from './organization';

describe('getOrganizationSwitchPath', () => {
  it('strips ID path segments', () => {
    expect(getOrganizationSwitchPath('/observations/123/stratum/Stratum%20A/plot/9')).toBe('/observations');
  });

  it('skips parent paths that are not routes', () => {
    expect(getOrganizationSwitchPath('/inventory/nursery/5/batch/6')).toBe('/inventory');
  });

  it('keeps a static path', () => {
    expect(getOrganizationSwitchPath('/species/new')).toBe('/species/new');
  });

  it('falls back to home for an unknown path', () => {
    expect(getOrganizationSwitchPath('/nonexistent/thing')).toBe(APP_PATHS.HOME);
  });

  it('falls back to home for console paths', () => {
    expect(getOrganizationSwitchPath('/accelerator/projects')).toBe(APP_PATHS.HOME);
  });
});
