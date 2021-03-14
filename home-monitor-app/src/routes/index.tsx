import React from 'react';

import AuthRoutes from './AuthRoutes';
import AppRoutes from './AppRoutes';
import UserContext from '../common/contexts/user.context';

function Main () {
  return <UserContext.Consumer>
    {({ userData }) => userData?.username
      ? <AppRoutes />
      : <AuthRoutes />
    }
  </UserContext.Consumer>
};

export default Main;
