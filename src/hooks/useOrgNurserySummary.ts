import { useEffect, useState } from 'react';

import { API_PULL_INTERVAL } from 'src/constants';
import { useOrganization } from 'src/providers';
import NurserySummaryService, { OrganizationNurserySummaryResponse } from 'src/services/NurserySummaryService';

export const useOrgNurserySummary = () => {
  const { selectedOrganization } = useOrganization();

  // populateSummaryInterval value is only being used when it is set.
  const [, setPopulateSummaryInterval] = useState<ReturnType<typeof setInterval>>();
  const [orgNurserySummary, setOrgNurserySummary] = useState<OrganizationNurserySummaryResponse>();

  useEffect(() => {
    if (selectedOrganization) {
      const populateSummary = async () => {
        const response = await NurserySummaryService.getOrganizationNurserySummary(selectedOrganization.id);
        setOrgNurserySummary(response);
      };

      // Update summary information
      void populateSummary();

      // Update interval that keeps summary up to date
      if (!import.meta.env.PUBLIC_DISABLE_RECURRENT_REQUESTS) {
        setPopulateSummaryInterval((currInterval) => {
          if (currInterval) {
            // Clear an existing interval when the facilityId changes
            clearInterval(currInterval);
          }
          return setInterval(() => void populateSummary(), API_PULL_INTERVAL);
        });
      }
    }

    // Clear interval on exit
    return () => {
      setPopulateSummaryInterval((currInterval) => {
        if (currInterval) {
          clearInterval(currInterval);
        }
        return undefined;
      });
    };
  }, [selectedOrganization]);

  return orgNurserySummary;
};
