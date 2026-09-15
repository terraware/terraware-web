import React, { type JSX, useCallback, useState } from 'react';

import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { Checkbox, Icon } from '@terraware/web-components';

import { useLocalization } from 'src/providers/hooks';

import AccessionQuantityRow from './AccessionQuantityRow';
import { AccessionWithdrawInfo, WithdrawPurpose, WithdrawQuantity } from './types';
import { withdrawAllValue } from './withdrawCalc';

type QuantitiesStepProps = {
  accessions: AccessionWithdrawInfo[];
  purpose: WithdrawPurpose;
  withdrawByWeight: boolean;
  withdrawByAccession: Record<number, WithdrawQuantity>;
  onChangeWithdrawBy: (byWeight: boolean) => void;
  setRow: (accessionId: number, quantity: WithdrawQuantity) => void;
  setAllRows: (rows: Record<number, WithdrawQuantity>) => void;
};

const QuantitiesStep = ({
  accessions,
  purpose,
  withdrawByWeight,
  withdrawByAccession,
  onChangeWithdrawBy,
  setRow,
  setAllRows,
}: QuantitiesStepProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const [withdrawAll, setWithdrawAll] = useState(false);

  const onChangeMode = useCallback(
    (_: React.ChangeEvent<HTMLInputElement>, value: string) => {
      setWithdrawAll(false);
      onChangeWithdrawBy(value === 'weight');
    },
    [onChangeWithdrawBy]
  );

  const onToggleWithdrawAll = useCallback(
    (checked: boolean) => {
      setWithdrawAll(checked);
      if (!checked) {
        setAllRows({});
        return;
      }
      const rows: Record<number, WithdrawQuantity> = {};
      accessions.forEach((accession) => {
        const all = withdrawAllValue(accession, withdrawByWeight);
        if (all) {
          rows[accession.id] = { value: all.value, units: all.units };
        }
      });
      setAllRows(rows);
    },
    [accessions, setAllRows, withdrawByWeight]
  );

  const onRowChange = useCallback(
    (accessionId: number, quantity: WithdrawQuantity) => {
      setWithdrawAll(false);
      setRow(accessionId, quantity);
    },
    [setRow]
  );

  return (
    <Box textAlign='left'>
      <Box display='flex' alignItems='center' gap={2} marginBottom={theme.spacing(2)}>
        <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
          {strings.WITHDRAW_BY}
        </Typography>
        <RadioGroup row name='withdraw-by' value={withdrawByWeight ? 'weight' : 'count'} onChange={onChangeMode}>
          <FormControlLabel value='count' control={<Radio />} label={strings.SEED_COUNT} />
          <FormControlLabel value='weight' control={<Radio />} label={strings.SEED_WEIGHT} />
        </RadioGroup>
        <Checkbox
          id='withdrawAll'
          name='withdrawAll'
          label={strings.WITHDRAW_ALL}
          value={withdrawAll}
          onChange={onToggleWithdrawAll}
        />
      </Box>

      <Table size='small'>
        <TableHead>
          <TableRow>
            <TableCell>{strings.ACCESSION}</TableCell>
            <TableCell>{strings.REMAINING}</TableCell>
            <TableCell>{strings.WITHDRAW}</TableCell>
            {withdrawByWeight && (
              <>
                <TableCell>{strings.EST_COUNT}</TableCell>
                <TableCell>
                  <Box display='flex' alignItems='center' gap={0.5}>
                    {strings.SUBSET_WEIGHT_COUNT}
                    <Tooltip title={strings.SUBSET_WEIGHT_COUNT_TOOLTIP}>
                      <Box display='flex' alignItems='center'>
                        <Icon name='info' size='small' fillColor={theme.palette.TwClrIcnSecondary} />
                      </Box>
                    </Tooltip>
                  </Box>
                </TableCell>
              </>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {accessions.map((accession) => (
            <AccessionQuantityRow
              key={accession.id}
              accession={accession}
              purpose={purpose}
              withdrawByWeight={withdrawByWeight}
              quantity={withdrawByAccession[accession.id]}
              onChange={(quantity) => onRowChange(accession.id, quantity)}
            />
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default QuantitiesStep;
