import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import base64 from 'base-64';

import { API_SERVER } from '../../common/constants';
import TextInput from '../../components/common/TextInput';
import PasswordInput from '../../components/common/PasswordInput';
import UserContext from '../../common/contexts/user.context';
import { registerForPush } from '../../common/push';
import { startGeofencing, stopGeofencing } from '../../common/geofencing';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginFailure, setLoginFailure] = useState('');

  return (
    <UserContext.Consumer>
      {({ setUserData }) => (

        <SafeAreaView style={styles.root}>

          <TextInput label="Username" initialValue={username} onChangeText={setUsername} />
          <PasswordInput initialValue={password} onChangeText={setPassword} />

          <Button
            mode='contained'
            loading={isLoggingIn}
            style={styles.button}
            disabled={!username || !password || isLoggingIn}
            onPress={() => {
              setIsLoggingIn(true);
              setLoginFailure('');

              const headers = new Headers();
              headers.set('Authorization', `Basic ${base64.encode(username + ':' + password)}`);

              fetch(API_SERVER + '/files', {
                headers,
              })
                .then(() => {
                  // store and redirect
                  setIsLoggingIn(false);
                  setLoginFailure('');
                  return registerForPush();
                })
                .then((token) => {
                  setUserData({ username, password, pushToken: token });
                  headers.set('Content-Type', 'application/json');
                  return fetch(API_SERVER + '/push-token', {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify({
                      pushtoken: token,
                    }),
                  })
                })
                .then(() => startGeofencing())
                .catch(err => {
                  setIsLoggingIn(false);
                  setLoginFailure(err.message);
                  setUserData({});
                  stopGeofencing();
                })
            }}
          >
            Log in
          </Button>

          <Snackbar
            onDismiss={() => setLoginFailure('')}
            visible={Boolean(loginFailure)}
            action={{ label: 'Ok', onPress: () => setLoginFailure('') }}
            theme={{ colors: { onSurface: '#B00020', accent: '#FFFFFF' }}}
          >
            Invalid username/password
          </Snackbar>
        </SafeAreaView>
      )}
    </UserContext.Consumer>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
    justifyContent: 'center',
  },
  button: {
    marginTop: 10,
  },
  link: {
    marginTop: 30,
  },
});

export default Login;