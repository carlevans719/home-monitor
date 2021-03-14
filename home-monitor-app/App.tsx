import 'react-native-gesture-handler';

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from "react-native-paper";
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Theme } from './src/common/theme';
import { get as getData, set as setData } from './src/common/asyncStorage';
import Main from './src/routes';
import UserContext from './src/common/contexts/user.context';
import { SetUserData } from './src/common/contexts/user.context';
import { USER_DATA_STORAGE_KEY } from './src/common/constants';
import { navigationRef } from './src/common/navigation';

export default function App() {
  const [userData, setUserData] = useState({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    getData(USER_DATA_STORAGE_KEY)
      .then(data => {
        setUserData(JSON.parse(data || '{}'));
        setIsReady(true);
      });
  });

  const updateUserData: SetUserData = (newUserData) => {
    setUserData(newUserData);
    setData(USER_DATA_STORAGE_KEY, JSON.stringify(newUserData));
  }

  const loading = () => (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#000000" />
    </View>
  );

  return (
    <SafeAreaProvider>
      <PaperProvider theme={Theme}>
        <NavigationContainer ref={navigationRef}>
          <UserContext.Provider value={{ userData, setUserData: updateUserData }}>
            {isReady ? <Main /> : loading()}
          </UserContext.Provider>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>

  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
