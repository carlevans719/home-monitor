import React from 'react';
import { TouchableWithoutFeedback } from 'react-native';
import { WebView } from 'react-native-webview';
import base64 from 'base-64';

import { API_SERVER } from '../common/constants';
import UserContext from '../common/contexts/user.context';
import { useNavigation, useRoute } from '@react-navigation/native';

const Feed = ({ number }: { number: number }) => {
  const navigation = useNavigation();
  const route = useRoute();

  number = number || (route?.params as any)?.number;
  
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: `Feed ${number}`,
    });
  }, [navigation, number]);

  return (
    <UserContext.Consumer>
      {({ userData }) => (
        <TouchableWithoutFeedback onPress={() => navigation.navigate('Feed', { number })}>
          <WebView
            source={{
              uri: API_SERVER + '/feeds/' + number,
              headers: {
                'Authorization': `Basic ${base64.encode(userData.username + ':' + userData.password)}`
              }
            }}
          />
        </TouchableWithoutFeedback>
      )}
    </UserContext.Consumer>
  );
};

export default Feed;
