import { api } from '../generated/acceleratorOrganizations';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listAcceleratorOrganizations: {
      providesTags: [{ type: QueryTagTypes.AcceleratorOrganizations, id: 'LIST' }],
    },
    assignTerraformationContact: {
      invalidatesTags: [{ type: QueryTagTypes.AcceleratorOrganizations, id: 'LIST' }],
    },
  },
});
