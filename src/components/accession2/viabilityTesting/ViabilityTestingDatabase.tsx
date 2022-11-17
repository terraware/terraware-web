import { useTheme, Box } from '@mui/material';
import { Button } from '@terraware/web-components';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import { Accession2 } from 'src/api/accessions2/accession';
import strings from 'src/strings';
import TableCellRenderer from './TableCellRenderer';
import { ViabilityTest } from 'src/api/types/accessions';
import useDeviceInfo from 'src/utils/useDeviceInfo';

interface ViabilityTestingDatabaseProps {
  accession: Accession2;
  canAddTest: boolean;
  onNewViabilityTest: () => void;
  onSelectViabilityTest: (test: ViabilityTest) => void;
}

const columns: TableColumnType[] = [
  { key: 'id', name: '', type: 'number' },
  { key: 'startDate', name: '', type: 'string' },
  { key: 'testType', name: '', type: 'string' },
  { key: 'viabilityPercent', name: '', type: 'number' },
];

const mobileColumns: TableColumnType[] = [
  { key: 'id', name: '', type: 'number' },
  { key: 'viabilityPercent', name: '', type: 'number' },
];

export default function ViabilityTestingDatabase(props: ViabilityTestingDatabaseProps): JSX.Element {
  const { accession, canAddTest, onNewViabilityTest, onSelectViabilityTest } = props;
  const { viabilityTests } = accession;
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  return (
    <Box display='flex' flexDirection='column'>
      <Box display='flex' flexDirection='row' justifyContent='end' alignItems='center' marginBottom={theme.spacing(3)}>
        {canAddTest ? (
          <Button
            priority='secondary'
            label={isMobile ? '' : strings.ADD_TEST}
            icon='plus'
            onClick={onNewViabilityTest}
          />
        ) : (
          <Box sx={{ height: '32px', width: 2 }} />
        )}
      </Box>
      <Box>
        <Table
          id='viability-testing-database'
          columns={isMobile ? mobileColumns : columns}
          rows={viabilityTests || []}
          orderBy='id'
          Renderer={TableCellRenderer}
          onSelect={(test: ViabilityTest) => onSelectViabilityTest(test)}
        />
      </Box>
    </Box>
  );
}
