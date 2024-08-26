import { getCombinedStatus } from './util';

describe('getCombinedStatus', () => {
  it('should combine the statuses correctly', () => {
    // Error overrides all statuses
    expect(getCombinedStatus(['error', 'success', 'partial-success'])).toEqual('error');
    expect(getCombinedStatus(['success', 'partial-success', 'error'])).toEqual('error');
    expect(getCombinedStatus(['pending', 'error'])).toEqual('error');
    expect(getCombinedStatus(['error', 'pending', 'success', 'partial-success'])).toEqual('error');

    // Partial Success overrides success only
    expect(getCombinedStatus(['success', 'partial-success'])).toEqual('partial-success');
    expect(getCombinedStatus(['partial-success', 'success'])).toEqual('partial-success');

    // Pending overrides all statuses except error
    expect(getCombinedStatus(['pending', 'partial-success'])).toEqual('pending');
    expect(getCombinedStatus(['partial-success', 'pending'])).toEqual('pending');

    // Success only exists if all statuses are success
    expect(getCombinedStatus(['success', 'success'])).toEqual('success');
  });
});
