import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import base64 from 'base-64';

import { get as getData } from './asyncStorage';
import {
  API_SERVER,
  GEOFENCING_TASK_NAME,
  USER_DATA_STORAGE_KEY,
} from './constants';

import { IUserData } from './contexts/user.context';

TaskManager.defineTask(GEOFENCING_TASK_NAME, async ({ data: { eventType }, error }: any) => {
  if (error) {
    console.error(error.message);
    return;
  }

  try {
    const userDataString = await getData(USER_DATA_STORAGE_KEY);
    const { username, password }: IUserData = JSON.parse(userDataString || '{}');
    if (!username || !password) {
      throw new Error('Cannot load user data for geofencing notification');
    }

    const event = eventType === Location.LocationGeofencingEventType.Enter
      ? 'enter'
      : 'exit';

    const headers = new Headers();
    headers.set('Authorization', `Basic ${base64.encode(username + ':' + password)}`);
    headers.set('Content-Type', 'application/json');

    console.log(headers)
    await fetch(API_SERVER + '/geofencing', {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        event,
      }),
    })

  } catch (ex) {
    console.error(ex.message);
  }
});

export const startGeofencing = async () => {
  try {
    const res = await Location.requestPermissionsAsync();
    if (res.status !== 'granted') {
      throw new Error('Permissions not granted');
    }

    const userLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.LocationAccuracy.Highest,
    });

    return await Location.startGeofencingAsync(GEOFENCING_TASK_NAME, [{
      identifier: 'home',
      latitude: userLocation.coords.latitude,
      longitude: userLocation.coords.longitude,
      radius: 100,
      notifyOnEnter: true,
      notifyOnExit: true,
    }]);
  } catch (ex) {
    alert(ex.message)
    console.error(ex.message);
    return false;
  }
};

export const stopGeofencing = () => {
  return Location.stopGeofencingAsync(GEOFENCING_TASK_NAME);
};
