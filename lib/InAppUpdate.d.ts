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
}
interface UpdateInfo {
    updateAvailable: boolean;
    version: string;
    isInAppUpdateAvailable?: boolean;
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
    checkForUpdate(currentVersion: string): Promise<UpdateInfo>;
    private getUpdatePromptCount;
    private incrementUpdatePromptCount;
    private shouldShowUpdateAlert;
    showUpdateAlertIfNeeded(currentVersion: string): Promise<void>;
}
export default InAppUpdate;
