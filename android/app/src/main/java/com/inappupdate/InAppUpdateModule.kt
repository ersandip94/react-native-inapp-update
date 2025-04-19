package com.inappupdate

import android.app.Activity
import android.content.Intent
import android.content.IntentSender
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import androidx.annotation.NonNull
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import com.google.android.play.core.appupdate.AppUpdateInfo
import com.google.android.play.core.appupdate.AppUpdateManager
import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.install.InstallStateUpdatedListener
import com.google.android.play.core.install.model.AppUpdateType
import com.google.android.play.core.install.model.InstallStatus
import com.google.android.play.core.install.model.UpdateAvailability
import com.google.android.play.core.tasks.Task

class InAppUpdateModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        private const val UPDATE_REQUEST_CODE = 500
    }

    private var appUpdateManager: AppUpdateManager = AppUpdateManagerFactory.create(reactContext)
    private var updatePromise: Promise? = null
    private var installStateUpdatedListener: InstallStateUpdatedListener? = null

    private val activityEventListener = object : BaseActivityEventListener() {
        override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
            if (requestCode == UPDATE_REQUEST_CODE) {
                if (resultCode != Activity.RESULT_OK) {
                    updatePromise?.reject("UPDATE_CANCELLED", "User cancelled or failed to update")
                    updatePromise = null
                }
            }
        }
    }

    init {
        reactContext.addActivityEventListener(activityEventListener)
    }

    @NonNull
    override fun getName(): String = "InAppUpdateModule"

    private fun getAppInfo(): Map<String, Any> {
        return try {
            val pInfo: PackageInfo = reactApplicationContext.packageManager.getPackageInfo(reactApplicationContext.packageName, 0)
            mapOf(
                "packageName" to pInfo.packageName,
                "versionName" to (pInfo.versionName ?: ""),
                "versionCode" to pInfo.longVersionCode,
                "firstInstallTime" to pInfo.firstInstallTime,
                "lastUpdateTime" to pInfo.lastUpdateTime
            )
        } catch (e: PackageManager.NameNotFoundException) {
            emptyMap()
        }
    }

    @ReactMethod
    fun getCurrentAppInfo(promise: Promise) {
        try {
            val appInfo = getAppInfo()
            val result = Arguments.createMap().apply {
                appInfo.forEach { (key, value) ->
                    when (value) {
                        is String -> putString(key, value)
                        is Long -> putDouble(key, value.toDouble())
                        is Int -> putInt(key, value)
                        else -> putString(key, value.toString())
                    }
                }
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun checkForUpdate(promise: Promise) {
        val currentActivity = currentActivity ?: run {
            promise.reject("ERROR", "Activity is null")
            return
        }

        appUpdateManager.appUpdateInfo
            .addOnSuccessListener { appUpdateInfo ->
                val result: WritableMap = Arguments.createMap().apply {
                    // Add update info
                    putInt("updateAvailability", appUpdateInfo.updateAvailability())
                    putInt("updatePriority", appUpdateInfo.updatePriority())
                    putString("availableVersionCode", appUpdateInfo.availableVersionCode().toString())
                    putString("availableVersionName", appUpdateInfo.packageVersionName())
                    putBoolean("isImmediateUpdateAllowed", appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE))
                    putBoolean("isFlexibleUpdateAllowed", appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE))
                    
                    // Add current app info
                    getAppInfo().forEach { (key, value) ->
                        when (value) {
                            is String -> putString(key, value)
                            is Long -> putDouble(key, value.toDouble())
                            is Int -> putInt(key, value)
                            else -> putString(key, value.toString())
                        }
                    }
                }
                promise.resolve(result)
            }
            .addOnFailureListener { e ->
                promise.reject("ERROR", e.message)
            }
    }

    @ReactMethod
    fun startImmediateUpdate(promise: Promise) {
        val currentActivity = currentActivity ?: run {
            promise.reject("ERROR", "Activity is null")
            return
        }

        updatePromise = promise
        appUpdateManager.appUpdateInfo
            .addOnSuccessListener { appUpdateInfo ->
                if (appUpdateInfo.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE &&
                    appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)
                ) {
                    try {
                        appUpdateManager.startUpdateFlowForResult(
                            appUpdateInfo,
                            AppUpdateType.IMMEDIATE,
                            currentActivity,
                            UPDATE_REQUEST_CODE
                        )
                    } catch (e: IntentSender.SendIntentException) {
                        promise.reject("ERROR", e.message)
                    }
                } else {
                    promise.reject("ERROR", "Update not available or not allowed")
                }
            }
            .addOnFailureListener { e ->
                promise.reject("ERROR", e.message)
            }
    }

    @ReactMethod
    fun startFlexibleUpdate(promise: Promise) {
        val currentActivity = currentActivity ?: run {
            promise.reject("ERROR", "Activity is null")
            return
        }

        updatePromise = promise
        appUpdateManager.appUpdateInfo
            .addOnSuccessListener { appUpdateInfo ->
                if (appUpdateInfo.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE &&
                    appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE)
                ) {
                    try {
                        appUpdateManager.startUpdateFlowForResult(
                            appUpdateInfo,
                            AppUpdateType.FLEXIBLE,
                            currentActivity,
                            UPDATE_REQUEST_CODE
                        )
                    } catch (e: IntentSender.SendIntentException) {
                        promise.reject("ERROR", e.message)
                    }
                } else {
                    promise.reject("ERROR", "Update not available or not allowed")
                }
            }
            .addOnFailureListener { e ->
                promise.reject("ERROR", e.message)
            }
    }
} 