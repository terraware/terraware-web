import { APP_PATHS } from 'src/constants';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import Link from 'src/components/common/Link';
import { ActiveStatuses } from 'src/types/Accession';
import { NumericFormatter } from 'src/utils/useNumber';

export type StorageLocationsCellRendererProps = {
  seedBankId: number;
  numericFormatter: NumericFormatter;
};

export default function StorageLocationsCellRenderer({
  seedBankId,
  numericFormatter,
}: StorageLocationsCellRendererProps) {
  return (props: RendererProps<TableRowType>): JSX.Element => {
    const { column, value, row } = props;

    const createLinkToAccessions = (locationName: string, numAccessions: string) => {
      const to = [
        `${APP_PATHS.ACCESSIONS}/?`,
        `storageLocationName=${locationName}`,
        `facilityId=${seedBankId}`,
        ...ActiveStatuses().map((status) => `stage=${status}`),
      ].join('&');

      return <Link to={to}>{numAccessions}</Link>;
    };

    if (column.key === 'activeAccessions') {
      return (
        <CellRenderer
          {...props}
          value={createLinkToAccessions(row.name as string, numericFormatter.format(value as number))}
        />
      );
    }

    return <CellRenderer {...props} value={value} />;
  };
}
