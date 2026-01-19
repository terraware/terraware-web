import React, { CSSProperties, type JSX } from 'react';

import TfMain from 'src/components/common/TfMain';
import { useUser } from 'src/providers';
import { Organization } from 'src/types/Organization';

import MyAccountForm, { MyAccountFormProps } from './MyAccountForm';

type MyAccountProps = {
  className?: string;
  edit: boolean;
  hasNav?: boolean;
  organizations?: Organization[];
  reloadData?: () => void;
  includeHeader?: boolean;
};

type MyAccountContentProps = MyAccountFormProps & { style?: CSSProperties };

export default function MyAccountPage(props: MyAccountProps): JSX.Element | null {
  const { user, reloadUser } = useUser();

  if (!user) {
    return null;
  }

  return <MyAccountContent user={{ ...user }} reloadUser={reloadUser} {...props} />;
}

const MyAccountContent = (props: MyAccountContentProps): JSX.Element => {
  return (
    <TfMain style={props.style}>
      <MyAccountForm {...props} />
    </TfMain>
  );
};
