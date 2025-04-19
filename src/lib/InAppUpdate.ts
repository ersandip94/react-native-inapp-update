import {Platform, Alert, Linking} from 'react-native';
import {NativeModules} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UpdateConfig {
  forceUpdateTitle?: string;
  forceUpdateMessage?: string;
  updateTitle?: string;
  updateMessage?: string;
  checkMajorVersion?: boolean;
  checkMinorVersion?: boolean;
  checkPatchVersion?: boolean;
  appStoreId?: string; // iOS App Store ID
  playStoreId?: string; // Android Play Store ID
  appStoreCountry?: string; // iOS App Store country code (e.g., 'us', 'gb', 'jp')
  maxUpdatePrompts?: number; // Maximum number of times to show update alert
  versionCheckUrl?: string; // URL to JSON file containing version information
  useCustomVersionCheck?: boolean; // Whether to use custom version check from JSON file
  showOptionalUpdates?: boolean; // Whether to show update alerts for non-required versions
}

interface Version {
  major: number;
  minor: number;
  patch: number;
}

interface UpdateInfo {
  updateAvailable: boolean;
  version: string;
  isInAppUpdateAvailable?: boolean; // Only for Android
  isRequiredUpdate: boolean;
}

interface CustomVersionInfo {
  minRequiredVersion: string;
  releaseNotes?: string;
}

class InAppUpdate {
  private static instance: InAppUpdate;
  private config: UpdateConfig = {
    forceUpdateTitle: 'Update Required',
    forceUpdateMessage:
      'A new version of the app is required to continue using this app.',
    updateTitle: 'Update Available',
    updateMessage:
      'A new version of the app is available. Would you like to update?',
    checkMajorVersion: true,
    checkMinorVersion: false,
    checkPatchVersion: false,
    appStoreCountry: 'us', // Default to US App Store
    maxUpdatePrompts: 3, // Default to 3 prompts
    useCustomVersionCheck: false, // Default to using store version check
    showOptionalUpdates: true, // Default to showing optional updates
  };

  private constructor() {}

  public static getInstance(): InAppUpdate {
    if (!InAppUpdate.instance) {
      InAppUpdate.instance = new InAppUpdate();
    }
    return InAppUpdate.instance;
  }

  public configure(config: UpdateConfig): void {
    this.config = {...this.config, ...config};
  }

  /**
   * Get the current app version from device info
   */
  public getCurrentVersion(): string {
    return DeviceInfo.getVersion();
  }

  /**
   * Initialize and check for updates when app starts
   * Call this in your App.tsx or main component
   */
  public async initialize(): Promise<void> {
    try {
      // Get current version from device info
      const currentVersion = this.getCurrentVersion();

      // Check for updates
      await this.showUpdateAlertIfNeeded(currentVersion);
    } catch (error) {
      console.error('Error initializing in-app update:', error);
    }
  }

  private parseVersion(version: string): Version {
    const [major, minor, patch] = version.split('.').map(Number);
    return {major, minor, patch};
  }

  private compareVersions(current: Version, latest: Version): boolean {
    if (this.config.checkMajorVersion && current.major < latest.major) {
      return true;
    }
    if (this.config.checkMinorVersion && current.minor < latest.minor) {
      return true;
    }
    if (this.config.checkPatchVersion && current.patch < latest.patch) {
      return true;
    }
    return false;
  }

  private async openStore(): Promise<void> {
    if (Platform.OS === 'ios') {
      const country = this.config.appStoreCountry?.toLowerCase() || 'us';
      const url = `itms-apps://itunes.apple.com/${country}/app/id${this.config.appStoreId}`;
      Linking.openURL(url);
    } else {
      try {
        const InAppUpdateModule = NativeModules.InAppUpdateModule;
        if (!InAppUpdateModule) {
          console.error('InAppUpdateModule is not available');
          // Fallback to Play Store
          const url = `market://details?id=${this.config.playStoreId}`;
          Linking.openURL(url).catch(() => {
            Linking.openURL(
              `https://play.google.com/store/apps/details?id=${this.config.playStoreId}`,
            );
          });
          return;
        }

        const updateInfo = await InAppUpdateModule.checkForUpdate();

        if (updateInfo.updateAvailability === 1) {
          // UPDATE_AVAILABLE
          if (updateInfo.isImmediateUpdateAllowed) {
            await InAppUpdateModule.startImmediateUpdate();
          } else if (updateInfo.isFlexibleUpdateAllowed) {
            await InAppUpdateModule.startFlexibleUpdate();
          } else {
            // Fallback to Play Store if in-app update is not available
            const url = `market://details?id=${this.config.playStoreId}`;
            Linking.openURL(url).catch(() => {
              Linking.openURL(
                `https://play.google.com/store/apps/details?id=${this.config.playStoreId}`,
              );
            });
          }
        }
      } catch (error) {
        console.error('Error using in-app update:', error);
        // Fallback to Play Store on error
        const url = `market://details?id=${this.config.playStoreId}`;
        Linking.openURL(url).catch(() => {
          Linking.openURL(
            `https://play.google.com/store/apps/details?id=${this.config.playStoreId}`,
          );
        });
      }
    }
  }

  private showForceUpdateAlert(): void {
    Alert.alert(
      this.config.forceUpdateTitle!,
      this.config.forceUpdateMessage!,
      [
        {
          text: 'Update',
          onPress: () => this.openStore(),
        },
      ],
      {cancelable: false},
    );
  }

  private showUpdateAlert(): void {
    Alert.alert(this.config.updateTitle!, this.config.updateMessage!, [
      {
        text: 'Later',
        style: 'cancel',
      },
      {
        text: 'Update',
        onPress: () => this.openStore(),
      },
    ]);
  }

  /**
   * Fetch version information from custom JSON file
   */
  private async fetchCustomVersionInfo(): Promise<CustomVersionInfo | null> {
    if (!this.config.versionCheckUrl) {
      return null;
    }

    try {
      const response = await fetch(this.config.versionCheckUrl);
      const data = await response.json();

      if (!data || !data.minRequiredVersion) {
        console.error('Invalid version data format in JSON file');
        return null;
      }

      return {
        minRequiredVersion: data.minRequiredVersion,
        releaseNotes: data.releaseNotes,
      };
    } catch (error) {
      console.error('Error fetching custom version info:', error);
      return null;
    }
  }

  /**
   * Check if current version is below minimum required version
   */
  private isBelowMinRequiredVersion(
    currentVersion: string,
    minRequiredVersion: string,
  ): boolean {
    const current = this.parseVersion(currentVersion);
    const minRequired = this.parseVersion(minRequiredVersion);

    if (current.major < minRequired.major) {
      return true;
    }
    if (
      current.major === minRequired.major &&
      current.minor < minRequired.minor
    ) {
      return true;
    }
    if (
      current.major === minRequired.major &&
      current.minor === minRequired.minor &&
      current.patch < minRequired.patch
    ) {
      return true;
    }

    return false;
  }

  public async checkForUpdate(currentVersion: string): Promise<UpdateInfo> {
    try {
      let isInAppUpdateAvailable = false;
      let isRequiredUpdate = false;
      let updateAvailable = false;
      let latestVersion = currentVersion;

      // Check if we should use custom version check
      if (this.config.useCustomVersionCheck) {
        const customVersionInfo = await this.fetchCustomVersionInfo();

        if (customVersionInfo) {
          // Check if current version is below minimum required version
          isRequiredUpdate = this.isBelowMinRequiredVersion(
            currentVersion,
            customVersionInfo.minRequiredVersion,
          );

          // For non-required updates, only show if showOptionalUpdates is true
          if (!isRequiredUpdate && this.config.showOptionalUpdates) {
            // Check if there's a newer version available in the store
            const storeInfo = await this.checkStoreVersion(currentVersion);
            updateAvailable = storeInfo.updateAvailable;
            isInAppUpdateAvailable = storeInfo.isInAppUpdateAvailable || false;
            latestVersion = storeInfo.version;
          } else {
            updateAvailable = isRequiredUpdate;
          }
        } else {
          // Fallback to store version check if custom check fails
          return this.checkStoreVersion(currentVersion);
        }
      } else {
        // Use store version check
        return this.checkStoreVersion(currentVersion);
      }

      return {
        updateAvailable,
        version: latestVersion,
        isInAppUpdateAvailable,
        isRequiredUpdate,
      };
    } catch (error) {
      console.error('Error checking for updates:', error);
      return {
        updateAvailable: false,
        version: currentVersion,
        isInAppUpdateAvailable: false,
        isRequiredUpdate: false,
      };
    }
  }

  /**
   * Check version from app stores
   */
  private async checkStoreVersion(currentVersion: string): Promise<UpdateInfo> {
    try {
      let latestVersion: string;
      let isInAppUpdateAvailable = false;

      if (Platform.OS === 'ios') {
        // iOS: Fetch version from App Store
        const country = this.config.appStoreCountry?.toLowerCase() || 'us';
        const response = await fetch(
          `https://itunes.apple.com/${country}/lookup?bundleId=${this.config.appStoreId}`,
        );
        const data = await response.json();
        if (!data.results || data.results.length === 0) {
          throw new Error('App not found in the App Store');
        }
        latestVersion = data.results[0].version;
      } else {
        // Android: Use Play Store in-app update
        const InAppUpdateModule = NativeModules.InAppUpdateModule;
        if (!InAppUpdateModule) {
          console.error('InAppUpdateModule is not available');
          // Return current version as latest if module is not available
          return {
            updateAvailable: false,
            version: currentVersion,
            isInAppUpdateAvailable: false,
            isRequiredUpdate: false,
          };
        }

        const updateInfo = await InAppUpdateModule.checkForUpdate();

        latestVersion = updateInfo.version;
        isInAppUpdateAvailable = updateInfo.updateAvailability === 1; // UPDATE_AVAILABLE
      }

      const current = this.parseVersion(currentVersion);
      const latest = this.parseVersion(latestVersion);
      const updateAvailable = this.compareVersions(current, latest);
      const isRequiredUpdate =
        this.config.checkMajorVersion && current.major < latest.major;

      return {
        updateAvailable,
        version: latestVersion,
        isInAppUpdateAvailable,
        isRequiredUpdate: isRequiredUpdate || false,
      };
    } catch (error) {
      console.error('Error checking store version:', error);
      return {
        updateAvailable: false,
        version: currentVersion,
        isInAppUpdateAvailable: false,
        isRequiredUpdate: false,
      };
    }
  }

  private async getUpdatePromptCount(version: string): Promise<number> {
    try {
      const count = await AsyncStorage.getItem(
        `update_prompt_count_${version}`,
      );
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.error('Error getting update prompt count:', error);
      return 0;
    }
  }

  private async incrementUpdatePromptCount(version: string): Promise<void> {
    try {
      const count = await this.getUpdatePromptCount(version);
      await AsyncStorage.setItem(
        `update_prompt_count_${version}`,
        (count + 1).toString(),
      );
    } catch (error) {
      console.error('Error incrementing update prompt count:', error);
    }
  }

  private async shouldShowUpdateAlert(version: string): Promise<boolean> {
    const count = await this.getUpdatePromptCount(version);
    return count < (this.config.maxUpdatePrompts || 3);
  }

  public async showUpdateAlertIfNeeded(currentVersion: string): Promise<void> {
    const updateInfo = await this.checkForUpdate(currentVersion);

    if (updateInfo.updateAvailable) {
      if (updateInfo.isRequiredUpdate) {
        // Show force update alert for required updates
        this.showForceUpdateAlert();
      } else if (await this.shouldShowUpdateAlert(updateInfo.version)) {
        this.showUpdateAlert();
        await this.incrementUpdatePromptCount(updateInfo.version);
      }
    }
  }
}

export default InAppUpdate;
