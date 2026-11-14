import { buildUser, captureRequests, mockGet, mockPost } from 'src/test-utils';
import { VariableUnion } from 'src/types/documentProducer/Variable';

import { MatrixRow } from './matrixValues';

export const variable: VariableUnion = {
  id: 2,
  stableId: 'v',
  name: 'Habitat',
  type: 'Select',
  isMultiple: true,
  internalOnly: false,
  isList: false,
  isRequired: false,
  options: [
    { id: 7, name: 'Forest, coastal' },
    { id: 8, name: 'Forest' },
  ],
};
export const project: MatrixRow = {
  id: 1,
  name: 'Project',
  acceleratorDetails_dealName: 'Project',
  country_name: 'Brazil',
  phase: 'Phase 1',
  internalUsers: [],
  variables: [
    {
      id: '2',
      stableId: 'v',
      variableName: 'Habitat',
      type: 'Select',
      values: [{ variableValueId: '3', options: [{ id: '7', name: 'Forest, coastal', position: '0' }] }],
    },
  ],
};
export const setupMatrixTest = ({ enabled = false, canEdit = true, empty = false, failSave = false } = {}) => {
  localStorage.setItem('matrixView-columnVisibility', JSON.stringify({ v: true }));
  const user = buildUser({ globalRoles: canEdit ? ['Super-Admin'] : [] });
  mockGet('/api/v1/users/me', { user });
  mockGet('/api/v1/users/me/preferences', { preferences: { editableTableV2: enabled } });
  mockGet('/api/v1/users/me/savedTableViews', { views: [] });
  mockGet('/api/v1/document-producer/variables', { variables: [variable] });
  mockPost('/api/v1/search', { results: empty ? [] : [project] });
  const requests = captureRequests('post', '/api/v1/document-producer/projects/1/values', {}, failSave ? 500 : 200);
  return { user, requests };
};
