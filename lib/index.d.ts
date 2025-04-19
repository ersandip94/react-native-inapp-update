interface UpdateConfig {
    forceUpdateTitle?: string;
    forceUpdateMessage?: string;
    updateTitle?: string;
    updateMessage?: string;
    checkMajorVersion?: boolean;
    checkMinorVersion?: boolean;
    checkPatchVersion?: boolean;
    appStoreId?: string;
    playStoreId?: string;
    appStoreCountry?: string;
    maxUpdatePrompts?: number;
    versionCheckUrl?: string;
    useCustomVersionCheck?: boolean;
    showOptionalUpdates?: boolean;
}
interface UpdateInfo {
    updateAvailable: boolean;
    version: string;
    isInAppUpdateAvailable?: boolean;
    isRequiredUpdate: boolean;
}
declare class InAppUpdate {
    private static instance;
    private config;
    private constructor();
    static getInstance(): InAppUpdate;
    configure(config: UpdateConfig): void;
    /**
     * Get the current app version from device info
     */
    getCurrentVersion(): string;
    /**
     * Initialize and check for updates when app starts
     * Call this in your App.tsx or main component
     */
    initialize(): Promise<void>;
    private parseVersion;
    private compareVersions;
    private openStore;
    private showForceUpdateAlert;
    private showUpdateAlert;
    /**
     * Fetch version information from custom JSON file
     */
    private fetchCustomVersionInfo;
    /**
     * Check if current version is below minimum required version
     */
    private isBelowMinRequiredVersion;
    checkForUpdate(currentVersion: string): Promise<UpdateInfo>;
    /**
     * Check version from app stores
     */
    private checkStoreVersion;
    private getUpdatePromptCount;
    private incrementUpdatePromptCount;
    private shouldShowUpdateAlert;
    showUpdateAlertIfNeeded(currentVersion: string): Promise<void>;
}
export default InAppUpdate;
