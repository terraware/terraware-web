import { Chip, Grid } from '@material-ui/core';
import { useSetRecoilState } from 'recoil';
import { login } from '../../api/auth';
import { User } from '../../api/types/auth';
import sessionSelector from '../../state/selectors/session';
import useForm from '../../utils/useForm';
import TextField from '../common/TextField';

export default function Login(): JSX.Element {
  const setSession = useSetRecoilState(sessionSelector);
  const [record, , onChange] = useForm<User>({
    username: '',
    password: '',
    grant_type: 'password',
  });

  const handleOk = async () => {
    try {
      const token = await login(record);
      setSession(token);
      // tslint:disable-next-line: no-empty
    } catch (ex) {}
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} />
      <Grid item xs={1} />
      <Grid item xs={2}>
        <TextField
          id='username'
          value={record.username}
          onChange={onChange}
          label='Username'
          aria-label='Username'
        />
      </Grid>
      <Grid item xs={2}>
        <TextField
          id='password'
          value={record.password}
          onChange={onChange}
          label='Password'
          aria-label='Password'
        />
      </Grid>
      <Grid item xs={2}>
        <Chip
          id='login'
          label={'Login'}
          clickable
          color='primary'
          onClick={handleOk}
        />
      </Grid>
    </Grid>
  );
}
