import { Grid } from '@mui/material';
import { Textfield } from '@terraware/web-components';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Accession2, getAccession2, updateAccession2 } from 'src/api/accessions2/accession';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';
import FormBottomBar from '../common/FormBottomBar';
import { APP_PATHS } from 'src/constants';

export default function Accession2Edit(): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const { accessionId } = useParams<{ accessionId: string }>();
  const [accession, setAccession] = useState<Accession2>();
  const [record, setRecord, onChange] = useForm(accession);
  const history = useHistory();

  useEffect(() => {
    const populateAccession = async () => {
      const response = await getAccession2(parseInt(accessionId, 10));
      setAccession(response);
      setRecord(response);
    };

    if (accessionId !== undefined) {
      populateAccession();
    } else {
      setAccession(undefined);
    }
  }, [accessionId, setRecord]);

  const mainStructureSize = isMobile ? 12 : 6;

  const goToAccession2View = () => {
    if (accession) {
      history.push(APP_PATHS.ACCESSIONS2_ITEM.replace(':accessionId', accession.id.toString()));
    }
  };

  const saveAccession = async () => {
    if (record) {
      const response = await updateAccession2(record);
      if (response.requestSucceeded && accession) {
        history.push(APP_PATHS.ACCESSIONS2_ITEM.replace(':accessionId', accession.id.toString()));
      }
    }
  };

  return (
    <Grid container>
      <Grid container item xs={12} padding={4} paddingBottom={'92px'}>
        <Grid item xs={12}>
          <h1>{strings.EDIT_ACCESSION}</h1>
        </Grid>
        {accession ? (
          <Grid container xs={12} spacing={2}>
            <Grid item xs={mainStructureSize}>
              <Textfield
                id='speciesCommonName'
                type='text'
                label={strings.SPECIES}
                value={record?.speciesCommonName}
                onChange={onChange}
              />
            </Grid>

            <Grid item xs={mainStructureSize}>
              <Textfield
                id='collectedDate'
                type='text'
                label={strings.COLLECTING_DATE_REQUIRED}
                value={record?.collectedDate}
                onChange={onChange}
              />
            </Grid>

            <Grid item xs={mainStructureSize}>
              <Textfield
                id='collector'
                type='text'
                label={strings.COLLECTOR}
                value={record?.collectors ? record?.collectors[0] : ''}
                onChange={onChange}
              />
            </Grid>

            <Grid item xs={mainStructureSize}>
              <Textfield
                id='collectionSiteName'
                type='text'
                label={strings.COLLECTING_SITE}
                value={record?.collectionSiteName}
                onChange={onChange}
              />
            </Grid>

            <Grid item xs={mainStructureSize}>
              <Textfield
                id='collectionSiteLandowner'
                type='text'
                label={strings.LANDOWNER}
                value={record?.collectionSiteLandowner}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={mainStructureSize}>
              <Textfield
                id='collectionSiteCity'
                type='text'
                label={strings.CITY}
                value={record?.collectionSiteCity}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={isMobile ? 12 : 6}>
              <Textfield
                id='collectionSiteCountrySubdivision'
                type='text'
                label={strings.STATE_PROVINCE_REGION}
                value={record?.collectionSiteCountrySubdivision}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={isMobile ? 12 : 6}>
              <Textfield
                id='collectionSiteCountryCode'
                type='text'
                label={strings.COUNTRY}
                value={record?.collectionSiteCountryCode}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={mainStructureSize}>
              <Textfield
                id='collectionSiteNotes'
                type='textarea'
                label={strings.DIRECTION_OR_DESCRIPTION}
                value={record?.collectionSiteNotes}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={mainStructureSize}>
              <Textfield
                id='collectionSiteCoordinates'
                type='text'
                label={strings.GPS_COORDINATES}
                value={
                  record?.collectionSiteCoordinates
                    ? `${record?.collectionSiteCoordinates[0].latitude}, ${record?.collectionSiteCoordinates[0].longitude}`
                    : ''
                }
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={mainStructureSize}>
              <Textfield
                id='collectionSource'
                type='text'
                label={strings.COLLECTION_SOURCE}
                value={record?.collectionSource}
                onChange={onChange}
              />
            </Grid>
          </Grid>
        ) : null}
      </Grid>
      <FormBottomBar onCancel={goToAccession2View} onSave={saveAccession} />
    </Grid>
  );
}
