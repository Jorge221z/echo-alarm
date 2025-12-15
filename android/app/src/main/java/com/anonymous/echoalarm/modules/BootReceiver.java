package com.anonymous.echoalarm.modules;

import android.annotation.SuppressLint;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;

import java.time.Instant;

public class BootReceiver extends BroadcastReceiver {

    // Definimos una acción personalizada para pruebas
    private static final String ACTION_TEST_BOOT = "com.anonymous.echoalarm.TEST_BOOT";

    @Override
    public void onReceive(Context context, Intent intent) {
        // 1. Usar goAsync para evitar ANR si el sistema va lento
        final PendingResult pendingResult = goAsync();

        new Thread(() -> {
            try {
                handleBoot(context, intent);
            } finally {
                // IMPRESCINDIBLE: Avisar que acabamos
                pendingResult.finish();
            }
        }).start();
        }

    private void handleBoot(Context context, Intent intent) {
        String action = intent.getAction();

        // Aceptamos BOOT_COMPLETED (Real) O nuestra señal de prueba (ADB)
        if (Intent.ACTION_BOOT_COMPLETED.equals(action) || ACTION_TEST_BOOT.equals(action)) {
            Log.d("BootReceiver", "¡Evento de inicio recibido! (" + action + ")");

            // 1. LEER LA LIBRETA
            SharedPreferences prefs = context.getSharedPreferences("EchoAlarmPrefs", Context.MODE_PRIVATE);
            boolean isActive = prefs.getBoolean("isAlarmActive", false);

            if (!isActive) {
                Log.d("BootReceiver", "No había alarmas activas guardadas.");
                return;
            }

            String wakeTimeIso = prefs.getString("wakeTime", null);
            int interval = prefs.getInt("interval", 1);
            int alarmCount = prefs.getInt("alarmCount", 1);
            String tonePoolJson = prefs.getString("tonePool", "[]"); // Recuperamos el JSON string

            if (wakeTimeIso == null) return;

            // 2. RECALCULAR HORA
            long triggerTimeMs = 0;
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    triggerTimeMs = Instant.parse(wakeTimeIso).toEpochMilli();
                } else {
                    triggerTimeMs = System.currentTimeMillis() + 60000;
                }
            } catch (Exception e) {
                Log.e("BootReceiver", "Error parseando fecha guardada: " + e.getMessage());
                return;
            }

            // Si la hora ya pasó, aquí deberías sumar 24h o cancelar.
            if (triggerTimeMs < System.currentTimeMillis()) {
                Log.w("BootReceiver", "La hora guardada ya pasó. Reprogramando para mañana (lógica simple).");
                triggerTimeMs += 86400000; // Sumar 24 horas
            }

            // 3. RECUPERAR EL TONO (URI) DEL JSON
            String savedToneUri = "";
            try {
                JSONArray jsonArray = new JSONArray(tonePoolJson);
                if (jsonArray.length() > 0) {
                    // Por simplicidad en el reinicio, cogemos el primer tono.
                    // Si quisieras ser exacto, necesitarías guardar el índice del siguiente tono.
                    JSONObject firstTone = jsonArray.getJSONObject(0);
                    if (firstTone.has("uri")) {
                        savedToneUri = firstTone.getString("uri");
                    }
                }
            } catch (Exception e) {
                Log.e("BootReceiver", "Error leyendo JSON de tonos: " + e.getMessage());
            }

            // 4. REPROGRAMAR
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (!alarmManager.canScheduleExactAlarms()) {
                    Log.e("BootReceiver", "Sin permiso para alarmas exactas tras reinicio.");
                    return;
                }
            }

            Intent alarmIntent = new Intent(context, AlarmReceiver.class);
            // AHORA SÍ PASAMOS LA URI RECUPERADA
            if (!savedToneUri.isEmpty()) {
                alarmIntent.putExtra("TONE_URI", savedToneUri);
            }

            alarmIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            // Bucle simple para reprogramar (usando la lógica de intervalo)
            // Nota: Para ser perfecto, deberías calcular cuál es la siguiente alarma pendiente real.
            // Aquí reprogramamos la secuencia desde la hora base.
            for (int i = 0; i < alarmCount; i++) {
                long currentTriggerTime = triggerTimeMs + ((long) i * interval * 60 * 1000);

                // Si esta iteración específica ya pasó, la saltamos
                if (currentTriggerTime < System.currentTimeMillis()) continue;

                PendingIntent pendingIntent = PendingIntent.getBroadcast(
                        context,
                        i, // ID único por iteración
                        alarmIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                );

                try {
                    alarmManager.setExactAndAllowWhileIdle(
                            AlarmManager.RTC_WAKEUP,
                            currentTriggerTime,
                            pendingIntent
                    );
                } catch (SecurityException e) {
                    Log.e("BootReceiver", "Error reprogramando alarma " + i);
                }
            }
            Log.i("BootReceiver", "¡Secuencia de alarmas restaurada!");

    }
}
}