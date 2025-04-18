# React Native In-App Update

A React Native library for handling in-app updates on both iOS and Android platforms. This library provides a simple way to check for app updates and force users to update when necessary.

## Features

- Check for app updates on both iOS and Android
- Force update when major version changes
- Optional update alerts for minor version changes
- Customizable alert messages and titles
- Configurable version checking (major, minor, patch)
- Uses native Android in-app update feature
- iOS App Store version checking with country/region support
- Automatic version detection using device info

## Installation

1. Install the package:

```bash
npm install react-native-inapp-update
# or
yarn add react-native-inapp-update
```

2. For iOS, no additional setup is required.

## Usage

### Basic Setup

```typescript
import InAppUpdate from 'react-native-inapp-update';

// Configure the library (optional)
InAppUpdate.getInstance().configure({
  forceUpdateTitle: 'Update Required',
  forceUpdateMessage: 'Please update the app to continue using it.',
  updateTitle: 'Update Available',
  updateMessage: 'A new version is available. Would you like to update?',
  checkMajorVersion: true,
  checkMinorVersion: false,
  checkPatchVersion: false,
  appStoreId: 'YOUR_IOS_APP_STORE_ID',
  playStoreId: 'YOUR_ANDROID_PACKAGE_NAME',
  appStoreCountry: 'us', // Optional: specify App Store country (default: 'us')
});
```

### Initialize on App Start

Add the following to your `App.tsx` or main component:

```typescript
import React, { useEffect } from 'react';
import InAppUpdate from 'react-native-inapp-update';

function App() {
  useEffect(() => {
    // Initialize and check for updates when app starts
    InAppUpdate.getInstance().initialize();
  }, []);

  return (
    // Your app components
  );
}
```

### Manual Update Check

```typescript
// Option 1: Check for updates and show alerts if needed
InAppUpdate.getInstance().showUpdateAlertIfNeeded();

// Option 2: Check for updates and handle the result yourself
const updateInfo = await InAppUpdate.getInstance().checkForUpdate();
if (updateInfo.updateAvailable) {
  // Handle update available
  console.log(`New version available: ${updateInfo.version}`);

  // For Android, you can check if in-app update is available
  if (Platform.OS === 'android' && updateInfo.isInAppUpdateAvailable) {
    // Use the native module to start the update
    const {InAppUpdateModule} = NativeModules;
    await InAppUpdateModule.startImmediateUpdate(); // or startFlexibleUpdate()
  } else {
    // Show alert to open store
    InAppUpdate.getInstance().showUpdateAlert();
  }
}
```

## Configuration Options

| Option             | Type    | Default                         | Description                                         |
| ------------------ | ------- | ------------------------------- | --------------------------------------------------- |
| forceUpdateTitle   | string  | 'Update Required'               | Title for force update alert                        |
| forceUpdateMessage | string  | 'A new version is required...'  | Message for force update alert                      |
| updateTitle        | string  | 'Update Available'              | Title for optional update alert                     |
| updateMessage      | string  | 'A new version is available...' | Message for optional update alert                   |
| checkMajorVersion  | boolean | true                            | Whether to check major version changes              |
| checkMinorVersion  | boolean | false                           | Whether to check minor version changes              |
| checkPatchVersion  | boolean | false                           | Whether to check patch version changes              |
| appStoreId         | string  | -                               | iOS App Store ID                                    |
| playStoreId        | string  | -                               | Android package name                                |
| appStoreCountry    | string  | 'us'                            | iOS App Store country code (e.g., 'us', 'gb', 'jp') |

## How it Works

- On iOS: The library checks the App Store for the latest version and compares it with the current version. You can specify the App Store country/region to check against.
- On Android: The library checks if an in-app update is available through the Play Store API.
- The library automatically detects the current app version using device info.

### Version Comparison

- Major version changes (e.g., 1.0.0 to 2.0.0) trigger a force update
- Minor and patch version changes show an optional update alert
- Version checking can be configured through the `configure` method

## Third-Party Dependencies

This library uses the following third-party packages:

- [react-native-device-info](https://github.com/react-native-device-info/react-native-device-info) - For detecting the current app version and device information. Licensed under MIT.
- [Google Play Core Library](https://developer.android.com/guide/playcore) - For Android in-app updates. Licensed under Apache License 2.0.
- [React Native](https://reactnative.dev/) - Core framework for building the library. Licensed under MIT.

## License

MIT
