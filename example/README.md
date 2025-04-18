# React Native In-App Update Example

This is an example project demonstrating how to use the `react-native-inapp-update` library in a React Native application.

## Features Demonstrated

- Automatic version detection using device info
- Checking for updates on app start
- Manual update checking
- Displaying current and latest version information
- Handling updates for both iOS and Android

## Setup

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. For iOS, install pods:

```bash
cd ios && pod install && cd ..
```

3. Configure your app:

   - For iOS: Replace `YOUR_IOS_APP_STORE_ID` in `App.tsx` with your actual App Store ID
   - For Android: Replace `com.example.inappupdate` with your actual package name

## Running the Example

### iOS

```bash
npm run ios
# or
yarn ios
```

### Android

```bash
npm run android
# or
yarn android
```

## What to Expect

When you run the example app, you'll see:

1. A screen showing:

   - Current app version
   - Latest available version
   - Whether an update is available
   - Current platform (iOS/Android)

2. A "Check for Updates" button to manually trigger update checking

3. If an update is available:
   - For iOS: An alert prompting to update via App Store
   - For Android:
     - If in-app update is available: Native in-app update UI
     - If not: Alert prompting to update via Play Store

## Testing Different Scenarios

To test different update scenarios:

1. **Force Update (Major Version Change)**:

   - Deploy a new version with a higher major version number (e.g., 1.0.0 → 2.0.0)
   - The app will show a non-cancelable update alert

2. **Optional Update (Minor/Patch Version Change)**:

   - Deploy a new version with a higher minor or patch version (e.g., 1.0.0 → 1.1.0)
   - The app will show a cancelable update alert

3. **No Update Available**:
   - When running the latest version
   - The app will show "Update Available: No"

## Notes

- For testing iOS updates, you need to have your app published on the App Store
- For testing Android updates, you need to have your app published on the Play Store
- The example uses the US App Store by default. Change `appStoreCountry` in the configuration to test with different regions
