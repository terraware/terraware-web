import React from 'react';

import Link from 'src/components/common/Link';
import TextTruncated from 'src/components/common/TextTruncated';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { CohortPhaseType, getPhaseString } from 'src/types/Cohort';

export default function ParticipantProjectsCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, value } = props;

  const createLinkToProject = () => {
    const to = APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', `${row.id}`);
    return (
      <Link fontSize='16px' to={to}>
        {value as React.ReactNode}
      </Link>
    );
  };

  if (column.key === 'name') {
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

  if (column.key === 'participant_cohort_phase') {
    return <CellRenderer {...props} value={getPhaseString(value as CohortPhaseType)} />;
  }

  if (column.key === 'acceleratorDetails_confirmedReforestableLand') {
    return <CellRenderer {...props} value={row.acceleratorDetails_confirmedReforestableLand} />;
  }

  if (column.key === 'landUseModelTypes.landUseModelType') {
    return <CellRenderer {...props} value={<TextTruncated fontSize={16} stringList={value as string[]} />} />;
  }

  return <CellRenderer {...props} />;
}
