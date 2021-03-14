import AsyncStorage from '@react-native-async-storage/async-storage';

export const get = async (key) => {
  try {
    return AsyncStorage.getItem(key);
  } catch(e) {
    return null;
  }
}

export const set = async (key, value) => {
  try {
    return AsyncStorage.setItem(key, value)
  } catch (e) {
    throw e;
  }
}