package com.anonymous.echoalarm.modules;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.view.View;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;

import com.anonymous.echoalarm.R;

public class AlarmScreenActivity extends AppCompatActivity {

    @Override
    protected void onCreate(android.os.Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(com.anonymous.echoalarm.R.layout.activity_alarm_screen);

        //Found the button
        Button stopButton = findViewById(R.id.stop_alarm_button);

        // Implement the click listener
        stopButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent serviceIntent = new Intent(AlarmScreenActivity.this, AlarmSoundService.class);
                stopService(serviceIntent);
                finish(); // Close the activity and return
            }
        });
    }

}
