import React from 'react';

import Database from 'src/components/seeds/database';
import { useOrganization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { selectedOrgHasFacilityType } from 'src/utils/organization';

const AccessionsView = () => {
  const { selectedOrganization, reloadOrganizations } = useOrganization();
  const { species } = useSpeciesData();

  return (
    <Database
      hasSeedBanks={selectedOrganization ? selectedOrgHasFacilityType(selectedOrganization, 'Seed Bank') : false}
      hasSpecies={species.length > 0}
      reloadData={() => void reloadOrganizations()}
    />
  );
};

export default AccessionsView;
