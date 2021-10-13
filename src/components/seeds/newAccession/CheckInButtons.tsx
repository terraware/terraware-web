import React from 'react';
import Button from '../../../components/common/button/Button';
import strings from '../../../strings';

interface Props {
  pendingCheckIn: boolean;
  isCheckingIn: boolean;
  isCheckedIn: boolean;
  onSubmitHandler: () => void;
}

export default function CheckInButtons({
  pendingCheckIn,
  isCheckingIn,
  isCheckedIn,
  onSubmitHandler,
}: Props): JSX.Element {
  return (
    <Button
      id='checkIn'
      label={isCheckedIn ? strings.CHECKED_IN : isCheckingIn ? strings.CHECKING_IN : strings.CHECK_IN}
      onClick={() => onSubmitHandler()}
    />
  );
}
