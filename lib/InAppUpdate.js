"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var react_native_2 = require("react-native");
var react_native_device_info_1 = __importDefault(require("react-native-device-info"));
var InAppUpdate = /** @class */ (function () {
    function InAppUpdate() {
        this.config = {
            forceUpdateTitle: 'Update Required',
            forceUpdateMessage: 'A new version of the app is required to continue using this app.',
            updateTitle: 'Update Available',
            updateMessage: 'A new version of the app is available. Would you like to update?',
            checkMajorVersion: true,
            checkMinorVersion: false,
            checkPatchVersion: false,
            appStoreCountry: 'us', // Default to US App Store
        };
    }
    InAppUpdate.getInstance = function () {
        if (!InAppUpdate.instance) {
            InAppUpdate.instance = new InAppUpdate();
        }
        return InAppUpdate.instance;
    };
    InAppUpdate.prototype.configure = function (config) {
        this.config = __assign(__assign({}, this.config), config);
    };
    /**
     * Get the current app version from device info
     */
    InAppUpdate.prototype.getCurrentVersion = function () {
        return react_native_device_info_1.default.getVersion();
    };
    /**
     * Initialize and check for updates when app starts
     * Call this in your App.tsx or main component
     */
    InAppUpdate.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var currentVersion, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        currentVersion = this.getCurrentVersion();
                        // Check for updates
                        return [4 /*yield*/, this.showUpdateAlertIfNeeded(currentVersion)];
                    case 1:
                        // Check for updates
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error initializing in-app update:', error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    InAppUpdate.prototype.parseVersion = function (version) {
        var _a = version.split('.').map(Number), major = _a[0], minor = _a[1], patch = _a[2];
        return { major: major, minor: minor, patch: patch };
    };
    InAppUpdate.prototype.compareVersions = function (current, latest) {
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
    };
    InAppUpdate.prototype.openStore = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var country, url, InAppUpdateModule, updateInfo, url, error_2, url;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(react_native_1.Platform.OS === 'ios')) return [3 /*break*/, 1];
                        country = ((_a = this.config.appStoreCountry) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || 'us';
                        url = "itms-apps://itunes.apple.com/".concat(country, "/app/id").concat(this.config.appStoreId);
                        react_native_1.Linking.openURL(url);
                        return [3 /*break*/, 9];
                    case 1:
                        _b.trys.push([1, 8, , 9]);
                        InAppUpdateModule = react_native_2.NativeModules.InAppUpdateModule;
                        return [4 /*yield*/, InAppUpdateModule.checkForUpdate()];
                    case 2:
                        updateInfo = _b.sent();
                        if (!(updateInfo.updateAvailability === 1)) return [3 /*break*/, 7];
                        if (!updateInfo.isImmediateUpdateAllowed) return [3 /*break*/, 4];
                        return [4 /*yield*/, InAppUpdateModule.startImmediateUpdate()];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 4:
                        if (!updateInfo.isFlexibleUpdateAllowed) return [3 /*break*/, 6];
                        return [4 /*yield*/, InAppUpdateModule.startFlexibleUpdate()];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        url = "market://details?id=".concat(this.config.playStoreId);
                        react_native_1.Linking.openURL(url).catch(function () {
                            react_native_1.Linking.openURL("https://play.google.com/store/apps/details?id=".concat(_this.config.playStoreId));
                        });
                        _b.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_2 = _b.sent();
                        url = "market://details?id=".concat(this.config.playStoreId);
                        react_native_1.Linking.openURL(url).catch(function () {
                            react_native_1.Linking.openURL("https://play.google.com/store/apps/details?id=".concat(_this.config.playStoreId));
                        });
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    InAppUpdate.prototype.showForceUpdateAlert = function () {
        var _this = this;
        react_native_1.Alert.alert(this.config.forceUpdateTitle, this.config.forceUpdateMessage, [
            {
                text: 'Update',
                onPress: function () { return _this.openStore(); },
            },
        ], { cancelable: false });
    };
    InAppUpdate.prototype.showUpdateAlert = function () {
        var _this = this;
        react_native_1.Alert.alert(this.config.updateTitle, this.config.updateMessage, [
            {
                text: 'Later',
                style: 'cancel',
            },
            {
                text: 'Update',
                onPress: function () { return _this.openStore(); },
            },
        ]);
    };
    InAppUpdate.prototype.checkForUpdate = function (currentVersion) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var latestVersion, isInAppUpdateAvailable, country, response, data, InAppUpdateModule, updateInfo, current, latest, updateAvailable, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        latestVersion = void 0;
                        isInAppUpdateAvailable = false;
                        if (!(react_native_1.Platform.OS === 'ios')) return [3 /*break*/, 3];
                        country = ((_a = this.config.appStoreCountry) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || 'us';
                        return [4 /*yield*/, fetch("https://itunes.apple.com/".concat(country, "/lookup?bundleId=").concat(this.config.appStoreId))];
                    case 1:
                        response = _b.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _b.sent();
                        if (!data.results || data.results.length === 0) {
                            throw new Error('App not found in the App Store');
                        }
                        latestVersion = data.results[0].version;
                        return [3 /*break*/, 5];
                    case 3:
                        InAppUpdateModule = react_native_2.NativeModules.InAppUpdateModule;
                        return [4 /*yield*/, InAppUpdateModule.checkForUpdate()];
                    case 4:
                        updateInfo = _b.sent();
                        latestVersion = updateInfo.version;
                        isInAppUpdateAvailable = updateInfo.updateAvailability === 1; // UPDATE_AVAILABLE
                        _b.label = 5;
                    case 5:
                        current = this.parseVersion(currentVersion);
                        latest = this.parseVersion(latestVersion);
                        updateAvailable = this.compareVersions(current, latest);
                        return [2 /*return*/, {
                                updateAvailable: updateAvailable,
                                version: latestVersion,
                                isInAppUpdateAvailable: isInAppUpdateAvailable,
                            }];
                    case 6:
                        error_3 = _b.sent();
                        console.error('Error checking for updates:', error_3);
                        return [2 /*return*/, {
                                updateAvailable: false,
                                version: currentVersion,
                                isInAppUpdateAvailable: false,
                            }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    InAppUpdate.prototype.showUpdateAlertIfNeeded = function (currentVersion) {
        return __awaiter(this, void 0, void 0, function () {
            var updateInfo, current, latest;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkForUpdate(currentVersion)];
                    case 1:
                        updateInfo = _a.sent();
                        if (updateInfo.updateAvailable) {
                            current = this.parseVersion(currentVersion);
                            latest = this.parseVersion(updateInfo.version);
                            if (this.config.checkMajorVersion && current.major < latest.major) {
                                this.showForceUpdateAlert();
                            }
                            else {
                                this.showUpdateAlert();
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return InAppUpdate;
}());
exports.default = InAppUpdate;
