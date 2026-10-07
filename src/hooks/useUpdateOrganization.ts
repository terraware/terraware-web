import { useCallback } from 'react';

import { useUpdateOrganizationMutation } from 'src/queries/generated/organizations';
import { Organization } from 'src/types/Organization';

const useUpdateOrganization = () => {
  const [updateOrganization] = useUpdateOrganizationMutation();

  return useCallback(
    async (organization: Organization): Promise<boolean> => {
      const result = await updateOrganization({
        organizationId: organization.id,
        updateOrganizationRequestPayload: {
          ...organization,
          botanicalCountryCode: organization.botanicalCountryCode ?? null,
        },
      });
      return !('error' in result);
    },
    [updateOrganization]
  );
};

export default useUpdateOrganization;
