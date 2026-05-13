import { useEffect, useMemo } from 'react';

import { API_PULL_INTERVAL } from 'src/constants';
import { useOrganization } from 'src/providers';
import { useLazyListOrganizationFeaturesQuery } from 'src/queries/generated/organizationFeatures';

const useOrganizationFeatures = () => {
  const { selectedOrganization } = useOrganization();

  const [listOrganizationFeatures, listOrganizationFeaturesResponse] = useLazyListOrganizationFeaturesQuery({
    pollingInterval: !import.meta.env.PUBLIC_DISABLE_RECURRENT_REQUESTS ? API_PULL_INTERVAL : undefined,
  });

  const features = useMemo(
    () => listOrganizationFeaturesResponse.currentData,
    [listOrganizationFeaturesResponse.currentData]
  );

  useEffect(() => {
    if (selectedOrganization) {
      void listOrganizationFeatures(selectedOrganization.id, true);
    }
  }, [listOrganizationFeatures, selectedOrganization]);

  return features;
};

export default useOrganizationFeatures;
