import { Grid, Theme, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import Card from 'src/components/common/Card';
import TextField from '@terraware/web-components/components/Textfield/Textfield';
import { makeStyles } from '@mui/styles';
import { useEffect, useState } from 'react';
import Table from '../common/table';
import { TableColumnType } from '@terraware/web-components';
import { NurseryBatchService, OrganizationUserService } from 'src/services';
import { BatchHistoryItem } from 'src/types/Batch';
import { User } from 'src/types/User';
import { useOrganization } from 'src/providers';
import BatchHistoryRenderer from './BatchHistoryRenderer';
import EventDetailsModal from './EventDetailsModal';

const useStyles = makeStyles((theme: Theme) => ({
  searchField: {
    width: '300px',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
  },
}));

const columns = (): TableColumnType[] => [
  { key: 'createdTime', name: strings.DATE, type: 'date' },
  { key: 'type', name: strings.EVENT, type: 'string' },
  { key: 'editedByName', name: strings.EDITED_BY, type: 'string' },
];

type BatchHistoryProps = {
  batchId: number;
};

export type BatchHistoryItemWithUser = BatchHistoryItem & { editedByName: string };

export default function BatchHistory({ batchId }: BatchHistoryProps): JSX.Element {
  const theme = useTheme();
  const classes = useStyles();
  const [searchValue, setSearchValue] = useState('');
  const [results, setResults] = useState<BatchHistoryItemWithUser[] | null>();
  const [users, setUsers] = useState<User[]>();
  const { selectedOrganization } = useOrganization();
  const [selectedEvent, setSelectedEvent] = useState<any>();
  const [openEventDetailsModal, setOpenEventDetailsModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await OrganizationUserService.getOrganizationUsers(selectedOrganization.id);
      if (response.requestSucceeded) {
        setUsers(response.users);
      }
    };
    fetchUsers();
  }, [selectedOrganization.id]);

  useEffect(() => {
    if (users) {
      const fetchResults = async () => {
        const response = await NurseryBatchService.getBatchHistory(batchId);
        if (response.requestSucceeded) {
          const historyItemsWithUsers =
            response.history?.map((historyItem) => {
              const userSelected = users?.find((user) => user.id === historyItem.createdBy);
              return { ...historyItem, editedByName: `${userSelected?.firstName} ${userSelected?.lastName}` };
            }) || null;
          setResults(historyItemsWithUsers);
        }
      };

      fetchResults();
    }
  }, [users, batchId]);

  const onChangeSearch = (id: string, value: unknown) => {
    setSearchValue(value as string);
  };

  const clearSearch = () => {
    setSearchValue('');
  };

  const onBatchSelected = (batch: any, fromColumn?: string) => {
    setSelectedEvent(batch);
    setOpenEventDetailsModal(true);
  };

  return (
    <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      {openEventDetailsModal && (
        <EventDetailsModal
          onClose={() => {
            setOpenEventDetailsModal(false);
          }}
          selectedEvent={selectedEvent}
        />
      )}
      <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt} marginBottom={theme.spacing(1)}>
        {strings.HISTORY}
      </Typography>
      <Grid item xs={12} className={classes.searchBar}>
        <TextField
          placeholder={strings.SEARCH}
          iconLeft='search'
          label=''
          id='search'
          type='text'
          className={classes.searchField}
          onChange={(value) => onChangeSearch('search', value)}
          value={searchValue}
          iconRight='cancel'
          onClickRightIcon={clearSearch}
        />
      </Grid>
      <Grid item xs={12}>
        {results && (
          <Table
            id='batch-history-table'
            columns={columns}
            rows={results}
            orderBy={'date'}
            Renderer={BatchHistoryRenderer}
            onSelect={onBatchSelected}
            controlledOnSelect={true}
          />
        )}
      </Grid>
    </Card>
  );
}
