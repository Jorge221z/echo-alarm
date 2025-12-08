package com.anonymous.echoalarm.modules;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;

import java.util.Objects;

public class AlarmSchedulerModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public AlarmSchedulerModule(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "";
    }

    @ReactMethod
    public void setAlarmCluster(ReadableMap profileJSON) {
        Log.d("AlarmScheduler", "Recibiendo orden de activar clúster...");

        String wakeTimeIso = profileJSON.getString("wakeTime");
        int interval = profileJSON.getInt("interval");
        int alarmCount = profileJSON.getInt("alarmCount");
        ReadableArray tonePool = profileJSON.getArray("tonePool");

        // Persistence
        SharedPreferences prefs = reactContext.getSharedPreferences("ClusterAlarmPrefs", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("wakeTime", wakeTimeIso);
        editor.putInt("interval", interval);
        editor.putInt("alarmCount", alarmCount);

        // URI save
        if (tonePool != null && tonePool.size() > 0) {
            String firstToneUri = Objects.requireNonNull(tonePool.getMap(0)).getString("uri");
            editor.putString("savedToneUri", firstToneUri);
        }
        editor.apply();

        // Schedule the tasks
        scheduleAlarms(wakeTimeIso, interval, alarmCount, tonePool);
    }

    @ReactMethod
    public void cancelAllAlarms() {
        AlarmManager alarmManager = (AlarmManager) reactContext.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(reactContext, AlarmReceiver.class);

        for (int i = 0; i < 50; i++) {
            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                    reactContext,
                    i,
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            if (alarmManager != null) {
                alarmManager.cancel(pendingIntent);
            }
        }
        Log.d("AlarmScheduler", "Todas las alarmas canceladas.");
    }

    private void scheduleAlarms(String wakeTimeIso, int interval, int alarmCount, ReadableArray tonePool) {
        AlarmManager alarmManager = (AlarmManager) reactContext.getSystemService(Context.ALARM_SERVICE);

        long triggerTimeMs = System.currentTimeMillis() + 60000;
        // ISO to millis

        for (int i = 0; i < alarmCount; i++) {
            long currentTriggerTime = triggerTimeMs + ((long) i * interval * 60 * 1000);

            String toneUri = "";
            if (tonePool != null && tonePool.size() > 0) {
                int toneIndex = i % tonePool.size();
                toneUri = Objects.requireNonNull(tonePool.getMap(toneIndex)).getString("uri");
            }

            Intent intent = new Intent(reactContext, AlarmReceiver.class);
            intent.putExtra("TONE_URI", toneUri);

            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                    reactContext,
                    i,
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            if (alarmManager != null) {
                alarmManager.setExactAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        currentTriggerTime,
                        pendingIntent
                );
            }
        }

    }
}
