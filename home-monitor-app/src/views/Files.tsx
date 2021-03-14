import React from 'react';

import UserContext from '../common/contexts/user.context';
import FilesList from '../components/FilesList';

const Files = () => {
  return (
    <UserContext.Consumer>
      {({ userData }) => (
        <FilesList userData={userData} />
      )}
    </UserContext.Consumer>
  );
};

export default Files;
