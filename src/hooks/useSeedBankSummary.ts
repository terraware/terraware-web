import { useEffect, useState } from 'react';

import { API_PULL_INTERVAL } from 'src/constants';
import { useOrganization } from 'src/providers';
import SeedBankService, { SummaryResponse } from 'src/services/SeedBankService';

export const useSeedBankSummary = () => {
  const { selectedOrganization } = useOrganization();

  // populateSummaryInterval value is only being used when it is set.
  const [, setPopulateSummaryInterval] = useState<ReturnType<typeof setInterval>>();
  const [seedBankSummary, setSeedBankSummary] = useState<SummaryResponse>();

  useEffect(() => {
    if (selectedOrganization) {
      const populateSummary = async () => {
        const response = await SeedBankService.getSummary(selectedOrganization.id);
        setSeedBankSummary(response);
      };

      // Update summary information
      populateSummary();

      // Update interval that keeps summary up to date
      if (!process.env.REACT_APP_DISABLE_RECURRENT_REQUESTS) {
        setPopulateSummaryInterval((currInterval) => {
          if (currInterval) {
            // Clear an existing interval when the facilityId changes
            clearInterval(currInterval);
          }
          return setInterval(populateSummary, API_PULL_INTERVAL);
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

  return seedBankSummary;
};
