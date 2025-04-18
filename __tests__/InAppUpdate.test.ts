import InAppUpdate from '../src/lib/InAppUpdate';
import {Platform, Alert, Linking} from 'react-native';
import DeviceInfo from 'react-native-device-info';

// Mock the required modules
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn(obj => obj.ios),
  },
  Alert: {
    alert: jest.fn(),
  },
  Linking: {
    openURL: jest.fn(),
  },
  NativeModules: {
    InAppUpdateModule: {
      checkForUpdate: jest.fn(),
      startImmediateUpdate: jest.fn(),
      startFlexibleUpdate: jest.fn(),
    },
  },
}));

jest.mock('react-native-device-info', () => ({
  getVersion: jest.fn(),
}));

describe('InAppUpdate', () => {
  let instance: InAppUpdate;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset the singleton instance
    (InAppUpdate as any).instance = undefined;

    // Get a fresh instance
    instance = InAppUpdate.getInstance();

    // Reset Platform.OS to default
    global.__mocks__.Platform.OS = 'ios';
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance when getInstance is called multiple times', () => {
      const instance1 = InAppUpdate.getInstance();
      const instance2 = InAppUpdate.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Configuration', () => {
    it('should set default configuration values', () => {
      const config = {
        appStoreId: '123456789',
        playStoreId: 'com.example.app',
      };
      instance.configure(config);
      expect(instance['config'].appStoreId).toBe('123456789');
      expect(instance['config'].playStoreId).toBe('com.example.app');
    });
  });

  describe('Version Management', () => {
    it('should get current version from DeviceInfo', () => {
      (DeviceInfo.getVersion as jest.Mock).mockReturnValue('1.0.0');
      expect(instance.getCurrentVersion()).toBe('1.0.0');
    });

    it('should parse version string correctly', () => {
      const version = instance['parseVersion']('1.2.3');
      expect(version).toEqual({
        major: 1,
        minor: 2,
        patch: 3,
      });
    });

    it('should compare versions correctly', () => {
      const current = {major: 1, minor: 0, patch: 0};
      const latest = {major: 2, minor: 0, patch: 0};

      instance.configure({checkMajorVersion: true});
      expect(instance['compareVersions'](current, latest)).toBe(true);

      instance.configure({checkMajorVersion: false});
      expect(instance['compareVersions'](current, latest)).toBe(false);
    });
  });

  describe('Update Checking', () => {
    beforeEach(() => {
      (DeviceInfo.getVersion as jest.Mock).mockReturnValue('1.0.0');
    });

    it('should check for updates on iOS', async () => {
      Platform.OS = 'ios';
      global.fetch = jest.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            results: [{version: '2.0.0'}],
          }),
      });

      const updateInfo = await instance.checkForUpdate('1.0.0');
      expect(updateInfo.updateAvailable).toBe(true);
      expect(updateInfo.version).toBe('2.0.0');
    });

    it('should check for updates on Android', async () => {
      Platform.OS = 'android';
      const mockUpdateInfo = {
        updateAvailability: 1,
        version: '2.0.0',
        isImmediateUpdateAllowed: true,
      };

      (
        require('react-native').NativeModules.InAppUpdateModule
          .checkForUpdate as jest.Mock
      ).mockResolvedValue(mockUpdateInfo);

      const updateInfo = await instance.checkForUpdate('1.0.0');
      expect(updateInfo.updateAvailable).toBe(true);
      expect(updateInfo.version).toBe('2.0.0');
      expect(updateInfo.isInAppUpdateAvailable).toBe(true);
    });
  });

  describe('Alert Display', () => {
    it('should show force update alert for major version updates', async () => {
      Platform.OS = 'ios';
      global.fetch = jest.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            results: [{version: '2.0.0'}],
          }),
      });

      instance.configure({
        checkMajorVersion: true,
        forceUpdateTitle: 'Force Update',
        forceUpdateMessage: 'Please update',
      });

      await instance.showUpdateAlertIfNeeded('1.0.0');
      expect(Alert.alert).toHaveBeenCalledWith(
        'Force Update',
        'Please update',
        expect.any(Array),
        {cancelable: false},
      );
    });

    it('should show optional update alert for minor version updates', async () => {
      Platform.OS = 'ios';
      global.fetch = jest.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            results: [{version: '1.1.0'}],
          }),
      });

      instance.configure({
        checkMinorVersion: true,
        updateTitle: 'Optional Update',
        updateMessage: 'Update available',
      });

      await instance.showUpdateAlertIfNeeded('1.0.0');
      expect(Alert.alert).toHaveBeenCalledWith(
        'Optional Update',
        'Update available',
        expect.any(Array),
      );
    });
  });
});
