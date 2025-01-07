import { Location, useLocation } from 'react-router-dom';

type State = {
  from?: string;
};
type StateLocation = Location<State>;

export default function useStateLocation(): StateLocation {
  const location = useLocation() as StateLocation;

  return location;
}

export function getLocation(pathname: string, location: StateLocation, search?: string): Location<State> {
  if (location.state?.from) {
    return {
      pathname,
      state: {
        from: location.state.from,
      },
      search: search || '',
      key: '',
      hash: '#',
    };
  } else {
    return {
      pathname,
      state: {
        from: location.pathname,
      },
      search: search || '',
      key: '',
      hash: '#',
    };
  }
}
