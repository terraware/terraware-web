import React, { useEffect, useState } from 'react';

import { Grid, Typography } from '@mui/material';
import { TableColumnType } from '@terraware/web-components/components/table/types';

import Table from 'src/components/common/table';
import { useOrganization } from 'src/providers';
import { SearchService } from 'src/services';
import strings from 'src/strings';
import { SearchRequestPayload } from 'src/types/Search';

const columns = (): TableColumnType[] => [
  { key: 'projectName', name: strings.PROJECT, type: 'string' },
  { key: 'submissionStatus', name: strings.STATUS, type: 'string' },
];

type SpeciesProjectsTableProps = {
  speciesId: number;
};

type SpeciesProjectsResult = {
  submissionStatus: string;
  projectName: string;
};

type SpeciesProjectsSearchResult = {
  participantProjectSpecies: { submissionStatus: string; project: { name: string } }[];
};

export default function SpeciesProjectsTable({ speciesId }: SpeciesProjectsTableProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const [searchResults, setSearchResults] = useState<SpeciesProjectsResult[] | null>();

  useEffect(() => {
    const getApiSearchResults = async () => {
      const searchParams: SearchRequestPayload = {
        prefix: 'species',
        fields: ['participantProjectSpecies.project.name', 'participantProjectSpecies.submissionStatus'],
        search: {
          operation: 'and',
          children: [
            {
              operation: 'field',
              field: 'organization_id',
              type: 'Exact',
              values: [selectedOrganization.id],
            },
            {
              operation: 'field',
              field: 'id',
              type: 'Exact',
              values: [speciesId],
            },
          ],
        },
        count: 1000,
      };

      const apiSearchResults = (await SearchService.search(searchParams)) as SpeciesProjectsSearchResult[];
      // it will always be one result since we are searching by species id
      const firstApiResult = apiSearchResults[0];
      const projects = firstApiResult?.participantProjectSpecies.map((pps) => {
        return {
          submissionStatus: pps.submissionStatus,
          projectName: pps.project.name,
        } as SpeciesProjectsResult;
      });

      setSearchResults(projects);
    };
    getApiSearchResults();
  }, [selectedOrganization]);
  return (
    <>
      {searchResults && (
        <Grid item xs={12}>
          <Grid item xs={12}>
            <Typography fontSize='20px' fontWeight={600}>
              {strings.PROJECTS}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Table id='species-projects' columns={columns} rows={searchResults} orderBy={'projectName'} />
          </Grid>
        </Grid>
      )}
    </>
  );
}
