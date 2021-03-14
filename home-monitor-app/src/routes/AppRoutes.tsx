import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Button } from 'react-native-paper';
import * as Notifications from 'expo-notifications';

import Feeds from '../views/Feeds';
import Feed from '../views/Feed';
import UserContext from '../common/contexts/user.context';
import FileList from '../components/FilesList';
import { stopGeofencing } from '../common/geofencing';
import { FILES_ROUTE_NAME } from '../common/constants';
import { navigate } from '../common/navigation';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const AppRoutes = () => {
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      // alert(JSON.stringify(response.notification));
      navigate(FILES_ROUTE_NAME, { fileName: response.notification.request.content.data.fileName });
    })

    return () => subscription.remove();
  }, []);

  return (
    <UserContext.Consumer>
      {({ userData, setUserData }) => {
        const logout = () => {
          setUserData({});
          stopGeofencing();
        };

        const headerRight = () => (
          <Button onPress={logout}>Logout</Button>
        );

        return (
          <Drawer.Navigator initialRouteName="Feeds">
            <Drawer.Screen name="Feeds">
              {() => (
                <Stack.Navigator initialRouteName="Feeds">
                  {/* Feeds */}
                  <Stack.Screen name="Feeds" component={Feeds} options={{ title: 'Home', headerRight }} />

                  {/* Feed */}
                  <Stack.Screen name="Feed" component={Feed} options={{ title: 'Feed' }} />
                </Stack.Navigator>
              )}
            </Drawer.Screen>

            <Drawer.Screen name={FILES_ROUTE_NAME}>
              {() => (
                <FileList userData={userData} />
              )}
            </Drawer.Screen>
          </Drawer.Navigator>
        );
      }}
    </UserContext.Consumer>
  );
};

export default AppRoutes;
