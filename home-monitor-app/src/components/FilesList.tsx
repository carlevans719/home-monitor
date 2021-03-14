import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, StyleSheet, TouchableHighlight, ToastAndroid, ActivityIndicator } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { useNavigation, useRoute } from '@react-navigation/native';
import base64 from 'base-64';
import { Button } from 'react-native-paper';
import * as FileSystem from 'expo-file-system';

import { API_SERVER } from '../common/constants';
import { IUserData } from '../common/contexts/user.context';

type ProgressCallback = (isDownloading: boolean, progress: number) => void;

const downloadFile = (name: string, userData: IUserData, callback: ProgressCallback) => {
  console.log('touch');
  callback(true, 0);

  const internalCallback = (downloadProgress: any) => {
    console.log('intcb', downloadProgress)
    callback(true, (downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite) * 100);
  };

  MediaLibrary.getPermissionsAsync()
  .then(perm => {
    console.log('permission async', perm)
    if (perm.granted) {
      ToastAndroid.show('Downloading file', ToastAndroid.LONG);
      return FileSystem.createDownloadResumable(
        API_SERVER + '/files/' + name,
        FileSystem.documentDirectory + name,
        {
          headers: {
            'Authorization': `Basic ${base64.encode(userData.username + ':' + userData.password)}`,
          },
        },
        internalCallback,
      ).downloadAsync();
    }
    if (!perm.granted && perm.canAskAgain) {
      return MediaLibrary.requestPermissionsAsync()
        .then(granted => {
          if (!granted.granted) {
            return Promise.reject('Permissions not granted');
          }

          ToastAndroid.show('Downloading file', ToastAndroid.LONG);
          return FileSystem.createDownloadResumable(
            API_SERVER + '/files/' + name,
            FileSystem.documentDirectory + name,
            {
              headers: {
                'Authorization': `Basic ${base64.encode(userData.username + ':' + userData.password)}`,
              },
            },
            internalCallback,
          ).downloadAsync();
        });
    } else {
      return Promise.reject('Permissions not granted')
    }
  })
  .then((res) => {
    console.log('Finished downloading to ', res?.uri);

    if (!res?.uri) {
      return Promise.reject('Download failed');
    }

    return MediaLibrary.saveToLibraryAsync(res.uri);
  })
  .then(() => {
    // callback(false, -1);
    ToastAndroid.show('File downloaded', ToastAndroid.LONG);
  })
  .catch(error => {
    callback(false, -1);
    ToastAndroid.show(error.message, ToastAndroid.LONG);
    console.error(error);
  });
};

const FileItem = ({ name, download, userData }: { name: string, download: boolean, userData: IUserData }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const callback: ProgressCallback = (_isDownloading, _progress) => {
    console.log('isdl', _isDownloading)
    console.log('prog', _progress)
    setIsDownloading(_isDownloading);
    setProgress(_progress);
  };

  useEffect(() => {
    if (download) {
      downloadFile(name, userData, callback);
    }
  }, [download]);

  return (
    <TouchableHighlight disabled={isDownloading} underlayColor="#DDDDDD" onPress={() => downloadFile(name, userData, callback)}>
      <View style={styles.item}>
        <View style={styles.pad}>
          <Text>{name}</Text>
          <Button icon="download">{}</Button>
        </View>

        <View style={[styles.progressBar, { width: progress + '%' }]} />
      </View>
    </TouchableHighlight>
  );
};

const FilesList = ({ userData }: { userData: IUserData }) => {
  const [files, setFiles] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();

  const renderItem = ({ item }: { item: string }) => (
    <FileItem
      name={item}
      download={(route.params as any)?.fileName === item}
      userData={userData}
    />
  );

  useEffect(() => {
    const headers = new Headers();
    headers.set('Authorization', `Basic ${base64.encode(userData.username + ':' + userData.password)}`);
    fetch(API_SERVER + '/files', {
      headers,
    })
      .then(res => res.json())
      .then(json => {
        setFiles(json);
        setIsReady(true);
      })
      .catch(err => {
        console.error(err);
      });
  }, [userData, navigation]);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={files}
        renderItem={renderItem}
        keyExtractor={item => item}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    paddingTop: 20,
  },
  item: {
    flex: 1,
    borderBottomWidth: 1,
  },
  pad: {
    flex: 1,
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 40,
    position: 'relative',
  },
  progressBar: {
    height: 3,
    backgroundColor: 'blue',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
});

export default FilesList;
