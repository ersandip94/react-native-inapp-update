import React, {useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import InAppUpdate from '../src/lib/InAppUpdate';

const App = () => {
  useEffect(() => {
    // Configure the library
    InAppUpdate.getInstance().configure({
      appStoreId: 'YOUR_IOS_APP_STORE_ID', // Replace with your App Store ID
      playStoreId: 'com.example.inappupdate', // Replace with your package name
      appStoreCountry: 'us',
      forceUpdateTitle: 'Update Required',
      forceUpdateMessage: 'Please update the app to continue using it.',
      updateTitle: 'Update Available',
      updateMessage: 'A new version is available. Would you like to update?',
    });

    // Initialize and check for updates automatically
    InAppUpdate.getInstance().initialize();
  }, []);

  const handleManualCheck = async () => {
    const version = InAppUpdate.getInstance().getCurrentVersion();
    await InAppUpdate.getInstance().showUpdateAlertIfNeeded(version);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>In-App Update Example</Text>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Current Version: {InAppUpdate.getInstance().getCurrentVersion()}
          </Text>
          <Text style={styles.infoText}>Platform: {Platform.OS}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleManualCheck}>
          <Text style={styles.buttonText}>Check for Updates</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  infoContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App;
