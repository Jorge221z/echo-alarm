package com.anonymous.echoalarm.modules;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;

import org.json.JSONArray;
import org.json.JSONObject;

import java.time.Instant;
import java.util.Objects;

public class AlarmSchedulerModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public AlarmSchedulerModule(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "AlarmScheduler";
    }

    @ReactMethod
    public void setAlarmCluster(ReadableMap profileJSON) {
        Log.d("AlarmScheduler", "Recibiendo orden de activar clúster...");

        String wakeTimeIso = profileJSON.getString("wakeTime");
        int interval = profileJSON.getInt("interval");
        int alarmCount = profileJSON.getInt("alarmCount");
        ReadableArray tonePool = profileJSON.getArray("tonePool");

        // Persistence
        saveAlarmData(wakeTimeIso, interval, alarmCount, tonePool);

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

        long triggerTimeMs = 0;

        // --- CORRECCIÓN DE PARSEO ---
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                // Instant.parse es mucho más robusto para formatos UTC ("Z")
                triggerTimeMs = Instant.parse(wakeTimeIso).toEpochMilli();
            } else {
                // Fallback para móviles muy viejos (opcional)
                triggerTimeMs = System.currentTimeMillis() + 60000;
            }
        } catch (Exception e) {
            Log.e("AlarmScheduler", "Error parseando fecha: " + e.getMessage());
            triggerTimeMs = System.currentTimeMillis() + 60000; // Solo si falla, usa el minuto
        }

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

    private void saveAlarmData(String wakeTimeIso, int interval, int alarmCount, ReadableArray tonePool) {
        SharedPreferences sharedPreferences = reactContext.getSharedPreferences("EchoAlarmPrefs", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPreferences.edit();

        editor.putString("wakeTime", wakeTimeIso);
        editor.putInt("interval", interval);
        editor.putInt("alarmCount", alarmCount);

        // --- MEJORA: Serialización segura con org.json ---
        JSONArray jsonArray = new JSONArray();

        if (tonePool != null) {
            for (int i = 0; i < tonePool.size(); i++) {
                try {
                    ReadableMap toneMap = tonePool.getMap(i);
                    JSONObject jsonObject = new JSONObject();

                    // Guardamos la URI de forma segura
                    if (toneMap != null && toneMap.hasKey("uri")) {
                        jsonObject.put("uri", toneMap.getString("uri"));
                    }


                    if (toneMap != null && toneMap.hasKey("name")) {
                        jsonObject.put("name", toneMap.getString("name"));
                    }

                    jsonArray.put(jsonObject);
                } catch (Exception e) {
                    Log.e("AlarmScheduler", "Error al guardar tono JSON: " + e.getMessage());
                }
            }
        }
        // Guardamos el array convertido a String de forma segura
        editor.putString("tonePool", jsonArray.toString());

        editor.putBoolean("isAlarmActive", true);
        editor.apply();

        Log.d("AlarmScheduler", "Datos guardados en SharedPreferences para reinicio.");
    }

    @ReactMethod
    public void stopCurrentSound() {
        try {
            // Creamos un intent apuntando AL MISMO servicio que está sonando
            Intent intent = new Intent(reactContext, AlarmSoundService.class);

            // stopService le dice a Android: "Mata este servicio ya"
            reactContext.stopService(intent);

            Log.d("AlarmScheduler", "Orden de parar sonido enviada desde JS");
        } catch (Exception e) {
            Log.e("AlarmScheduler", "Error al intentar parar el sonido: " + e.getMessage());
        }
    }

}
