import { useNavigation } from '@react-navigation/native';
import React from 'react';

import Feed from './Feed';

const Feeds = () => {
  const navigation = useNavigation();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Home',
    });
  }, [navigation]);

  return (
    <>
      <Feed number={1} />
      <Feed number={2} />
    </>
  );
};

export default Feeds;
