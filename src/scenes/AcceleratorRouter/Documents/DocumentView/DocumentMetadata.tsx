import { useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import { selectMethodologies } from 'src/redux/features/documentProducer/methodologies/methodologiesSelector';
import { requestListMethodologies } from 'src/redux/features/documentProducer/methodologies/methodologiesThunks';
import { requestGetUser } from 'src/redux/features/user/usersAsyncThunks';
import { selectUser } from 'src/redux/features/user/usersSelectors';
import { useSelectorProcessor } from 'src/redux/hooks/useSelectorProcessor';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { User } from 'src/types/User';
import { Document } from 'src/types/documentProducer/Document';
import { getDateTimeDisplayValue } from 'src/utils/dateFormatter';
import { getUserDisplayName } from 'src/utils/user';

import { getMethodologyName } from '../DocumentsView/helpers';

export type DocumentMetadataProps = {
  document: Document;
};

const DocumentMetadata = ({ document }: DocumentMetadataProps): JSX.Element => {
  const { organizationName, name, methodologyId, ownedBy, modifiedBy, modifiedTime } = document;

  const dispatch = useAppDispatch();
  const theme = useTheme();
  const [ownedByUser, setOwnedByUser] = useState<User>();
  const [modifiedByUser, setModifiedByUser] = useState<User>();

  const ownedBySelector = useAppSelector(selectUser(ownedBy));
  const modifiedBySelector = useAppSelector(selectUser(modifiedBy));
  const { methodologies } = useAppSelector(selectMethodologies);

  useSelectorProcessor(ownedBySelector, setOwnedByUser);
  useSelectorProcessor(modifiedBySelector, setModifiedByUser);

  useEffect(() => {
    dispatch(requestListMethodologies());
  }, [dispatch]);

  useEffect(() => {
    dispatch(requestGetUser(ownedBy));
    dispatch(requestGetUser(modifiedBy));
  }, [dispatch, ownedBy, modifiedBy]);

  const ownedByName = useMemo(() => getUserDisplayName(ownedByUser), [ownedByUser]);
  const modifiedByName = useMemo(() => getUserDisplayName(modifiedByUser), [modifiedByUser]);
  const modifiedTimeDisplay = useMemo(() => getDateTimeDisplayValue(new Date(modifiedTime).getTime()), [modifiedTime]);
  const methodologyName = useMemo(
    () => getMethodologyName(methodologies ?? [], methodologyId),
    [methodologies, methodologyId]
  );

  return (
    <Box display='flex' flexDirection='column' marginTop={3}>
      <Typography fontWeight={400} fontSize='14px' lineHeight='20px' color={theme.palette.TwClrTxt}>
        {organizationName}
      </Typography>
      <Typography
        fontWeight={600}
        fontSize='24px'
        lineHeight='32px'
        color={theme.palette.TwClrTxt}
        margin={theme.spacing(1, 0)}
      >
        {name}
      </Typography>
      <Typography
        fontWeight={400}
        fontSize='14px'
        lineHeight='20px'
        color={theme.palette.TwClrTxt}
        component='pre'
        whiteSpace='pre-wrap'
      >
        {strings.METHODOLOGY}: {methodologyName}
        <br />
        {strings.DOCUMENT_OWNER}: {ownedByName}
        <br />
        {strings.LAST_EDITED_BY}: {modifiedByName}, {modifiedTimeDisplay}
      </Typography>
    </Box>
  );
};

export default DocumentMetadata;
