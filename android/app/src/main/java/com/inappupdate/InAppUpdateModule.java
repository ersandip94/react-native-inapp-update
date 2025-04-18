package com.inappupdate;

import android.app.Activity;
import android.content.Intent;
import android.content.IntentSender;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.google.android.play.core.appupdate.AppUpdateInfo;
import com.google.android.play.core.appupdate.AppUpdateManager;
import com.google.android.play.core.appupdate.AppUpdateManagerFactory;
import com.google.android.play.core.install.InstallStateUpdatedListener;
import com.google.android.play.core.install.model.AppUpdateType;
import com.google.android.play.core.install.model.InstallStatus;
import com.google.android.play.core.install.model.UpdateAvailability;
import com.google.android.play.core.tasks.Task;

public class InAppUpdateModule extends ReactContextBaseJavaModule {
    private static final int UPDATE_REQUEST_CODE = 500;
    private AppUpdateManager appUpdateManager;
    private Promise updatePromise;
    private InstallStateUpdatedListener installStateUpdatedListener;

    private final ActivityEventListener activityEventListener = new BaseActivityEventListener() {
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
            if (requestCode == UPDATE_REQUEST_CODE) {
                if (resultCode != Activity.RESULT_OK) {
                    if (updatePromise != null) {
                        updatePromise.reject("UPDATE_CANCELLED", "User cancelled or failed to update");
                        updatePromise = null;
                    }
                }
            }
        }
    };

    public InAppUpdateModule(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addActivityEventListener(activityEventListener);
        appUpdateManager = AppUpdateManagerFactory.create(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "InAppUpdateModule";
    }

    @ReactMethod
    public void checkForUpdate(Promise promise) {
        Activity currentActivity = getCurrentActivity();
        if (currentActivity == null) {
            promise.reject("ERROR", "Activity is null");
            return;
        }

        Task<AppUpdateInfo> appUpdateInfoTask = appUpdateManager.getAppUpdateInfo();
        appUpdateInfoTask.addOnSuccessListener(appUpdateInfo -> {
            WritableMap result = Arguments.createMap();
            result.putInt("updateAvailability", appUpdateInfo.updateAvailability());
            result.putInt("updatePriority", appUpdateInfo.updatePriority());
            result.putString("version", appUpdateInfo.packageVersionName());
            result.putBoolean("isImmediateUpdateAllowed", appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE));
            result.putBoolean("isFlexibleUpdateAllowed", appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE));
            promise.resolve(result);
        }).addOnFailureListener(e -> {
            promise.reject("ERROR", e.getMessage());
        });
    }

    @ReactMethod
    public void startImmediateUpdate(Promise promise) {
        Activity currentActivity = getCurrentActivity();
        if (currentActivity == null) {
            promise.reject("ERROR", "Activity is null");
            return;
        }

        updatePromise = promise;
        Task<AppUpdateInfo> appUpdateInfoTask = appUpdateManager.getAppUpdateInfo();
        appUpdateInfoTask.addOnSuccessListener(appUpdateInfo -> {
            if (appUpdateInfo.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE
                    && appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)) {
                try {
                    appUpdateManager.startUpdateFlowForResult(
                            appUpdateInfo,
                            AppUpdateType.IMMEDIATE,
                            currentActivity,
                            UPDATE_REQUEST_CODE
                    );
                } catch (IntentSender.SendIntentException e) {
                    promise.reject("ERROR", e.getMessage());
                }
            } else {
                promise.reject("ERROR", "Update not available or not allowed");
            }
        }).addOnFailureListener(e -> {
            promise.reject("ERROR", e.getMessage());
        });
    }

    @ReactMethod
    public void startFlexibleUpdate(Promise promise) {
        Activity currentActivity = getCurrentActivity();
        if (currentActivity == null) {
            promise.reject("ERROR", "Activity is null");
            return;
        }

        updatePromise = promise;
        Task<AppUpdateInfo> appUpdateInfoTask = appUpdateManager.getAppUpdateInfo();
        appUpdateInfoTask.addOnSuccessListener(appUpdateInfo -> {
            if (appUpdateInfo.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE
                    && appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE)) {
                try {
                    appUpdateManager.startUpdateFlowForResult(
                            appUpdateInfo,
                            AppUpdateType.FLEXIBLE,
                            currentActivity,
                            UPDATE_REQUEST_CODE
                    );
                } catch (IntentSender.SendIntentException e) {
                    promise.reject("ERROR", e.getMessage());
                }
            } else {
                promise.reject("ERROR", "Update not available or not allowed");
            }
        }).addOnFailureListener(e -> {
            promise.reject("ERROR", e.getMessage());
        });
    }
} 