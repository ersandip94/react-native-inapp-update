// Mock react-native-device-info
jest.mock('react-native-device-info', () => ({
  getVersion: jest.fn(),
}));

// Mock react-native
const mockPlatform = {
  OS: 'ios',
  select: jest.fn(obj => obj.ios),
};

const mockLinking = {
  openURL: jest.fn(),
};

jest.mock('react-native', () => ({
  Platform: mockPlatform,
  Alert: {
    alert: jest.fn(),
  },
  Linking: mockLinking,
  NativeModules: {
    InAppUpdateModule: {
      checkForUpdate: jest.fn(),
      startImmediateUpdate: jest.fn(),
      startFlexibleUpdate: jest.fn(),
    },
  },
}));

// Export mocks for direct manipulation in tests
global.__mocks__ = {
  Platform: mockPlatform,
  Linking: mockLinking,
};

// Mock fetch
global.fetch = jest.fn();
