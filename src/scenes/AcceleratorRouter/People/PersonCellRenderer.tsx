import React, { type JSX } from 'react';

import Link from 'src/components/common/Link';
import TextTruncated from 'src/components/common/TextTruncated';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { getHighestGlobalRole } from 'src/types/GlobalRoles';
import { InternalInterest, internalInterestLabel } from 'src/types/UserInternalInterests';

export default function PersonCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, index, value } = props;

  const createLinkToPerson = (iValue: React.ReactNode | unknown[]) => {
    const to = APP_PATHS.ACCELERATOR_PERSON.replace(':userId', `${row.id}`);
    return (
      <Link fontSize='16px' to={to}>
        {iValue as React.ReactNode}
      </Link>
    );
  };

  if (column.key === 'email') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={createLinkToPerson(value)}
        row={row}
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

  if (column.key === 'globalRoles') {
    return <CellRenderer index={index} column={column} value={getHighestGlobalRole(row.globalRoles)} row={row} />;
  }

  if (column.key === 'internalInterests') {
    const interests = row.internalInterests
      .map((interest: InternalInterest) => internalInterestLabel(interest))
      .toSorted();

    return (
      <CellRenderer
        index={index}
        column={column}
        row={row}
        value={
          <TextTruncated stringList={interests} width={400} fontSize={16} moreText={strings.TRUNCATED_TEXT_MORE_LINK} />
        }
      />
    );
  }

  return <CellRenderer {...props} />;
}
