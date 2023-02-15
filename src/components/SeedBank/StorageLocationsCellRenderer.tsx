import { APP_PATHS } from 'src/constants';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import Link from 'src/components/common/Link';
import { ActiveStatuses } from 'src/types/Accession';
import { NumericFormatter } from 'src/types/Number';

export type StorageLocationsCellRendererProps = {
  seedBankId?: number;
  numericFormatter: NumericFormatter;
  editMode: boolean;
};

export default function StorageLocationsCellRenderer({
  seedBankId,
  numericFormatter,
  editMode,
}: StorageLocationsCellRendererProps) {
  return (props: RendererProps<TableRowType>): JSX.Element => {
    const { column, value, row } = props;

    const createLinkToAccessions = (locationName: string, data: string) => {
      const to = [
        `${APP_PATHS.ACCESSIONS}/?`,
        `storageLocationName=${locationName}`,
        `facilityId=${seedBankId}`,
        ...ActiveStatuses().map((status) => `stage=${status}`),
      ].join('&');

      return <Link to={to}>{data}</Link>;
    };

    if (column.key === 'activeAccessions') {
      const activeAccessionsStr = numericFormatter.format(value as number);

      return (
        <CellRenderer
          {...props}
          value={editMode ? activeAccessionsStr : createLinkToAccessions(row.name as string, activeAccessionsStr)}
        />
      );
    }

    if (column.key === 'name') {
      const locationName = row.name as string;

      return <CellRenderer {...props} value={editMode ? <Link>{locationName}</Link> : locationName} />;
    }

    return <CellRenderer {...props} value={value} />;
  };
}
