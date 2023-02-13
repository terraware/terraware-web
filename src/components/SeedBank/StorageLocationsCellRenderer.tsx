import { APP_PATHS } from 'src/constants';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import Link from 'src/components/common/Link';
import { ActiveStatuses } from 'src/types/Facility';
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
    const { column, value } = props;

    const createLinkToAccessions = (locationName: string) => {
      const to = [
        `${APP_PATHS.ACCESSIONS}/?`,
        `storageLocationName=${locationName}`,
        `facilityId=${seedBankId}`,
        ...ActiveStatuses().map((status) => `stage=${status}`),
      ].join('&');

      return <Link to={to}>{locationName}</Link>;
    };

    if (column.key === 'name') {
      return <CellRenderer {...props} value={createLinkToAccessions(value as string)} />;
    }

    if (column.key === 'activeAccessions') {
      return <CellRenderer {...props} value={numericFormatter.format(value as number)} />;
    }

    return <CellRenderer {...props} value={value} />;
  };
}
