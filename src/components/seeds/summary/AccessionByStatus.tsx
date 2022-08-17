import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { FieldNodePayload, SeedSearchCriteria } from 'src/api/seeds/search';
import { AccessionState } from 'src/api/types/accessions';
import { APP_PATHS } from 'src/constants';
import useDeviceInfo from 'src/utils/useDeviceInfo';

interface Props {
  label: string;
  status: AccessionState;
  quantity: number | undefined;
  setSeedSearchCriteria: (criteria: SeedSearchCriteria) => void;
}

export default function AccessionByStatus({ label, status, quantity, setSeedSearchCriteria }: Props): JSX.Element {
  const { isMobile } = useDeviceInfo();

  const onClick = (state: AccessionState) => {
    const filter: FieldNodePayload = {
      field: 'state',
      values: [state],
      type: 'Exact',
      operation: 'field',
    };

    setSeedSearchCriteria({ state: filter });
  };

  return (
    <Box
      borderRadius='10px'
      border='1px solid #E5E5E5'
      margin='12px'
      textAlign='center'
      width={isMobile ? '100%' : '20%'}
      padding='22px 10px 40px 10px'
    >
      <Link
        onClick={() => onClick(status)}
        id={`update-${status}`}
        to={APP_PATHS.ACCESSIONS}
        style={{ textDecoration: 'none' }}
      >
        <Typography color='#0067C8' fontSize='36px'>
          {quantity}
        </Typography>
      </Link>
      <Typography color='#000000' fontSize='16px'>
        {label}
      </Typography>
    </Box>
  );
}
