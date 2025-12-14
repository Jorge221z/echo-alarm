package com.anonymous.echoalarm.modules;

import android.annotation.SuppressLint;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.provider.Settings;
import android.util.Log;


import androidx.core.app.NotificationCompat;

import com.anonymous.echoalarm.R;

public class AlarmSoundService extends Service {

    private MediaPlayer mediaPlayer;
    
    @Override
    public void onCreate() {
        super.onCreate();

        // 1. Initialize media player
        mediaPlayer = new MediaPlayer();

        mediaPlayer.setLooping(true);

        // 2. Configure AudioAttributes
        mediaPlayer.setAudioAttributes(
                new AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .build()
        );
    }

    @SuppressLint("ForegroundServiceType")
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {

        // ------------------ 1. CHANNEL CREATION ------------------
        final String CHANNEL_ID = "CLUSTER_ALARM_CHANNEL";

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Cluster Alarm Channel",
                    NotificationManager.IMPORTANCE_HIGH
            );
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }

        // ------------------ 2. NOTIFICATION AND ALARM SCREEN (Full Screen Intent) ------------------

        // The Intent we want to execute in full screen (our alarm dismissal UI)
        Intent fullScreenIntent = new Intent(this, AlarmScreenActivity.class);
        // Flags to ensure the Activity launches correctly over other screens
        fullScreenIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK | Intent.FLAG_ACTIVITY_NO_USER_ACTION);

        // PendingIntent: Allows the operating system to launch the Activity
        PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(
                this,
                0,
                fullScreenIntent,
                // FLAG_IMMUTABLE is required on Android 12 (API 31) and higher
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        // Build the Notification (the visible message and the invisible wake-up button)
        @SuppressLint("FullScreenIntentPolicy") Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                // Must have an icon called ic_launcher in your drawables
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle("ALARM ACTIVE - CLUSTER")
                .setContentText("Press 'STOP ALARM' to stop the sound.")
                .setPriority(NotificationCompat.PRIORITY_MAX) // Maximum Priority
                .setCategory(Notification.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                // THIS IS WHAT TURNS ON THE SCREEN AND SHOWS IT OVER THE LOCK SCREEN
                .setFullScreenIntent(fullScreenPendingIntent, true)
                .build();

        // ------------------ 3. FOREGROUND SERVICE LAUNCH ------------------
        // Calls this method and attaches the notification. This is what prevents Android from killing the service!
        startForeground(1, notification);

        try {
            startActivity(fullScreenIntent);
        } catch (Exception e) {
            Log.e("AlarmSoundService", "Fallo al forzar activity: " + e.getMessage());
        }

        // ------------------ 4. MEDIA PLAYBACK START (Media Player) ------------------
        try {
            if (mediaPlayer != null) {
                // Retrieve the URI that AlarmReceiver passed from the Intent
                String toneUriString = intent.getStringExtra("TONE_URI");

                Uri toneUri = null;
                // If the URI is not null, we load the audio from the user's path
                if (toneUriString != null && !toneUriString.isEmpty()) {
                    toneUri = Uri.parse(toneUriString);

                } else {
                    toneUri = Settings.System.DEFAULT_ALARM_ALERT_URI;
                    Log.e("AlarmSoundService", "TONE_URI is null. Cannot play tone. Fallback to default tone");
                }

                mediaPlayer.setDataSource(this, toneUri);
                mediaPlayer.setLooping(true);

                // Prepare and then start (asynchronous to not block the main thread)
                mediaPlayer.prepareAsync();
                mediaPlayer.setOnPreparedListener(MediaPlayer::start);
                
            }
        } catch (Exception e) {
            Log.e("AlarmSoundService", "Error in media playback: " + e.getMessage());
        }

        // START_STICKY: Tells Android that, if the system kills the service, try to restart it
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        if (mediaPlayer != null) {
            if (mediaPlayer.isPlaying()) {
                mediaPlayer.stop();
            }
            mediaPlayer.release();
            mediaPlayer = null;
        }
        super.onDestroy();
    }
    
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
