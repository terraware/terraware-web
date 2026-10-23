import { APP_PATHS } from 'src/constants';

import { getOrganizationSwitchPath } from './organization';

describe('getOrganizationSwitchPath', () => {
  it('switches an observation detail page to the observations list', () => {
    expect(getOrganizationSwitchPath('/observations/123')).toBe('/observations');
  });

  it('switches an observation plot detail page to the observations list', () => {
    expect(getOrganizationSwitchPath('/observations/123/stratum/Stratum%20A/plot/9')).toBe('/observations');
  });

  it('switches a planting site dashboard to the plants dashboard', () => {
    expect(getOrganizationSwitchPath('/plants/dashboard/5')).toBe('/plants/dashboard');
  });

  it('switches a nursery batch page to the inventory list', () => {
    expect(getOrganizationSwitchPath('/inventory/nursery/5/batch/6')).toBe('/inventory');
  });

  it('keeps a static species creation page', () => {
    expect(getOrganizationSwitchPath('/species/new')).toBe('/species/new');
  });

  it('keeps a static seed fund report settings page', () => {
    expect(getOrganizationSwitchPath('/seed-fund-reports/settings/edit')).toBe('/seed-fund-reports/settings/edit');
  });

  it('switches a project module page to the projects list', () => {
    expect(getOrganizationSwitchPath('/projects/5/modules/3')).toBe('/projects');
  });

  it('removes a trailing slash from a static path', () => {
    expect(getOrganizationSwitchPath('/species/')).toBe('/species');
  });

  it('falls back to home for an unknown path', () => {
    expect(getOrganizationSwitchPath('/nonexistent/thing')).toBe(APP_PATHS.HOME);
  });

  it('falls back to home for the root path', () => {
    expect(getOrganizationSwitchPath('/')).toBe(APP_PATHS.HOME);
  });

  it('falls back to home for accelerator project pages', () => {
    expect(getOrganizationSwitchPath('/accelerator/projects')).toBe(APP_PATHS.HOME);
  });

  it('falls back to home for the accelerator console root', () => {
    expect(getOrganizationSwitchPath('/accelerator')).toBe(APP_PATHS.HOME);
  });

  it('falls back to home for funder console pages', () => {
    expect(getOrganizationSwitchPath('/funder/home')).toBe(APP_PATHS.HOME);
  });
});
