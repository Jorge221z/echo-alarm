package com.anonymous.echoalarm.modules;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.ComponentName;
import android.os.Build;

public class AlarmReceiver extends BroadcastReceiver{

    @Override
    public void onReceive(Context context, Intent intent) {
        // 1. Create the intent to initialize reproduction system
        Intent serviceIntent = new Intent(context, AlarmSoundService.class);

        // 2. Recover the URI from the tone that were attached to AlarmSchedulerModule (TONE_URI)
        String toneUri = intent.getStringExtra("TONE_URI");
        serviceIntent.putExtra("TONE_URI", toneUri);

        // 3. Start the service in foreground
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(serviceIntent);
        }

    }
}
