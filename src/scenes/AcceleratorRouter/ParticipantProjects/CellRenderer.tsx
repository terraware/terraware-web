import React, { type JSX } from 'react';

import Link from 'src/components/common/Link';
import TextTruncated from 'src/components/common/TextTruncated';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { CohortPhaseType, getPhaseString } from 'src/types/Cohort';
import { getCountryByCode } from 'src/utils/country';

export default function ParticipantProjectsCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, value } = props;
  const { countries } = useLocalization();

  const createLinkToProject = () => {
    const to = APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', `${row.projectId}`);
    return (
      <Link fontSize='16px' to={to}>
        {value as React.ReactNode}
      </Link>
    );
  };

  if (column.key === 'dealName') {
    return (
      <CellRenderer
        {...props}
        value={createLinkToProject()}
        sx={{
          fontSize: '16px',
          '& > p': {
            fontSize: '16px',
          },
        }}
        title={value as string}
      />
    );
  }

  if (column.key === 'countryCode') {
    return <CellRenderer {...props} value={getCountryByCode(countries, value as string)?.name ?? ''} />;
  }

  if (column.key === 'cohortPhase') {
    return <CellRenderer {...props} value={getPhaseString(value as CohortPhaseType)} />;
  }

  if (column.key === 'landUseModelTypes') {
    return (
      <CellRenderer
        {...props}
        value={
          <TextTruncated fontSize={16} stringList={value as string[]} moreText={strings.TRUNCATED_TEXT_MORE_LINK} />
        }
      />
    );
  }

  return <CellRenderer {...props} />;
}
