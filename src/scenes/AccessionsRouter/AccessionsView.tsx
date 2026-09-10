import React from 'react';

import Database from 'src/components/seeds/database';
import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import { useOrganization } from 'src/providers';
import { selectedOrgHasFacilityType } from 'src/utils/organization';

const AccessionsView = () => {
  const { selectedOrganization, reloadOrganizations } = useOrganization();
  const { species, isLoading: speciesLoading } = useOrganizationSpecies();

  return (
    <Database
      hasSeedBanks={selectedOrganization ? selectedOrgHasFacilityType(selectedOrganization, 'Seed Bank') : false}
      hasSpecies={species.length > 0}
      speciesLoading={speciesLoading}
      reloadData={() => void reloadOrganizations()}
    />
  );
};

export default AccessionsView;
