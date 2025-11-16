# Echo Alarm - AI Coding Agent Instructions

## Project Overview
Echo Alarm ("Cluster Alarm") is a React Native alarm clock app built with Expo SDK 54, using React Native's New Architecture. The core concept: **program a cluster of multiple alarms with rotating tones that can be dynamically shifted by changing only the start time**.

### MVP Goal
Solve the primary use case: "Schedule a cluster of N alarms with interval I minutes, starting at time T, with rotating tones from a user-defined pool. The entire cluster can be rescheduled by changing only T."

## Architecture & Structure

### Navigation Pattern
- Uses React Navigation v7 with Native Stack Navigator (`@react-navigation/native-stack`)
- Entry point: `App.js` defines the navigation structure with `initialRouteName='Home'`
- All screens have `headerShown: false` - custom headers must be implemented in-screen
- Screens receive `navigation` prop automatically from navigator

### Screen Organization
- **Screens**: Located in `src/screens/`
  - `HomeScreen.js`: Main alarm configuration with:
    - Time picker: "Hora de Despertar" (T - first alarm time)
    - Numeric input: "Intervalo" (I - minutes between alarms)
    - Numeric input: "Número de Alarmas" (N - alarm count)
    - Button: "Gestionar Pool de Tonos" (navigates to TonePoolScreen)
    - Action buttons: "ACTIVAR CLÚSTER" and "DESACTIVAR TODAS LAS ALARMAS"
  - `TonePoolScreen.js`: Tone pool management:
    - Button: "Añadir Tono" (opens system file picker for mp3/wav files)
    - List of added tones with delete functionality
- **Logic**: Empty `src/logic/` directory for business logic (profile save/load, native module calls)

### UI/UX Patterns
- **Gradient Backgrounds**: All screens use `LinearGradient` from `react-native-linear-gradient` with consistent color scheme: `['#4A90E2', '#6B5CE7', '#5f61e6ff']`
- **Styling Convention**: 
  - `mainText`: Large (24px), white text with glass-morphism effect (semi-transparent background, border, shadow)
  - `secoundaryText`: Medium (18px), white text for labels (note: typo in style name is consistent across codebase)
  - All text uses white color with subtle shadows for visibility on gradient
- **Input Pattern**: Numeric inputs use `TextInput` with `keyboardType="numeric"`, defaulting to 1 if invalid input

## Development Workflows

### Running the App
```bash
npm start          # Start Expo development server
npm run android    # Build and run on Android (requires Android Studio setup)
npm run ios        # Build and run on iOS (requires Xcode, macOS only)
npm run web        # Run in web browser
```

### Build Configuration
- **iOS**: Uses native build (not Expo Go) - check `ios/Podfile` for pod dependencies
- **Android**: Uses Gradle build system - main config in `android/app/build.gradle`
- **New Architecture**: Enabled via `"newArchEnabled": true` in `app.json`
- **Edge-to-Edge**: Android uses `"edgeToEdgeEnabled": true` for modern UI

### Platform-Specific Notes
- **DateTime Picker**: Uses `@react-native-community/datetimepicker` with `DateTimePickerAndroid.open()` pattern (Android-specific API shown in HomeScreen)
- For iOS, the datetime picker implementation will need different handling (modal/inline display)

## Key Dependencies & Integration Points

### Core Stack
- **Expo SDK 54** with React 19.1.0 and React Native 0.81.5
- **React Navigation 7**: Native Stack with safe area handling
- **UI Components**: 
  - `react-native-linear-gradient` for backgrounds
  - `@react-native-community/datetimepicker` for time selection
  - `react-native-safe-area-context` for notch/edge handling

### State Management & Persistence
- React useState hooks at component level for UI state
- **AsyncStorage**: Save alarm profile (T, I, N, tone pool) when user activates cluster
- **SharedPreferences (Native)**: Store alarm profile for boot persistence and native module access
- Profile JSON structure: `{wakeTime: T, interval: I, alarmCount: N, tonePool: [paths]}`

### Native Module Architecture (Java/Android)
The MVP requires a custom native module for reliable alarm scheduling:

1. **AlarmSchedulerModule** (Bridge to React Native):
   - `setAlarmCluster(profileJSON)`: Cancels existing alarms, parses config, schedules N alarms using AlarmManager.setExactAndAllowWhileIdle()
   - `cancelAllAlarms()`: Cancels all PendingIntents
   - Calculates trigger times: `triggerTime = T + (i * I)` for i = 0 to N-1
   - Assigns rotating tones: `tone = pool[i % pool.length]`

2. **AlarmReceiver** (BroadcastReceiver):
   - Triggers at exact alarm time
   - Starts AlarmSoundService as foreground service with tone path

3. **AlarmSoundService** (ForegroundService):
   - High-priority notification with fullScreenIntent pointing to AlarmScreenActivity
   - Plays alarm tone in loop using MediaPlayer
   - Prevents Android from killing the process

4. **AlarmScreenActivity** (Native Java Activity):
   - **NOT React Native** - lightweight native UI for reliability
   - Shows fullscreen over lockscreen
   - Single "DETENER ALARMA" button stops AlarmSoundService and closes activity

5. **BootReceiver** (BroadcastReceiver for BOOT_COMPLETED):
   - Reads alarm profile from SharedPreferences on device reboot
   - Re-schedules entire alarm cluster to persist across reboots

### Why Native Implementation?
- **Reliability**: AlarmManager.setExactAndAllowWhileIdle() ensures alarms fire even in Doze mode
- **Lockscreen Display**: fullScreenIntent shows alarm UI over lockscreen
- **Boot Persistence**: BootReceiver survives device restarts
- **Performance**: Native alarm dismissal activity responds instantly

## Common Patterns & Conventions

### State Handlers Pattern
```javascript
const [value, setValue] = useState(defaultValue);
const handleValueChange = (input) => {
  const numericalValue = parseInt(input);
  if (!isNaN(numericalValue)) {
    setValue(numericalValue);
  } else {
    setValue(1); // Fallback default
    console.log("Invalid input message");
  }
}
```

### TouchableOpacity for Interactions
Time picker opens via `TouchableOpacity` wrapping display text - consistent pattern for interactive elements

### Component Export
All screens use default export: `export default function ScreenName({ navigation })`

## Project-Specific Decisions

1. **No TypeScript**: Project uses JavaScript without type checking
2. **Hybrid Architecture**: React Native for UI, native Java for alarm reliability
3. **Spanish UI**: All user-facing text in Spanish ("Hora de despertar", "Pool de tonos", "ACTIVAR CLÚSTER")
4. **Single Profile Focus**: MVP supports ONE alarm cluster configuration (no multiple profiles/presets)
5. **Native Alarm Dismissal**: AlarmScreenActivity is pure Java, not React Native, for instant response
6. **Asset Management**: User-selected audio files (mp3/wav) stored with paths in profile, app images in `assets/`

## Implementation Roadmap (MVP)

### Phase 1: React Native UI
- [x] Basic HomeScreen layout with time/interval/count inputs
- [ ] "ACTIVAR CLÚSTER" and "DESACTIVAR" buttons with handlers
- [ ] TonePoolScreen: file picker integration for audio files
- [ ] TonePoolScreen: tone list with delete functionality
- [ ] Navigation: "Gestionar Pool de Tonos" button → TonePoolScreen
- [ ] AsyncStorage: save/load alarm profile

### Phase 2: Native Module Bridge
- [ ] Create `AlarmSchedulerModule.java` with TurboModule setup
- [ ] Expose `setAlarmCluster(String profileJSON)` method
- [ ] Expose `cancelAllAlarms()` method
- [ ] Parse JSON, calculate N trigger times and rotating tone assignments
- [ ] SharedPreferences integration for native persistence

### Phase 3: Native Alarm Execution
- [ ] `AlarmReceiver.java`: BroadcastReceiver for alarm triggers
- [ ] `AlarmSoundService.java`: ForegroundService with MediaPlayer
- [ ] High-priority notification with fullScreenIntent
- [ ] `AlarmScreenActivity.java`: Native dismissal UI (NOT RN)
- [ ] Lockscreen overlay permissions and functionality

### Phase 4: Boot Persistence
- [ ] `BootReceiver.java`: BOOT_COMPLETED listener
- [ ] Re-schedule logic from SharedPreferences
- [ ] AndroidManifest.xml permissions and receiver declarations

### Platform Notes
- **Android-First MVP**: Native implementation targets Android only
- **iOS Future**: Will require different approach (local notifications, background tasks)
- **Expo Limitations**: May need to eject or use custom dev client for native modules

## Testing & Debugging

### React Native Layer
- Use Expo dev tools: shake device or Cmd+M (Android) for dev menu
- AsyncStorage contents: `adb shell run-as com.anonymous.echoalarm cat /data/data/com.anonymous.echoalarm/shared_prefs/*.xml`

### Native Layer (Android)
- Check `android/app/build/` for build artifacts
- LogCat filtering: `adb logcat -s AlarmScheduler:V AlarmReceiver:V AlarmService:V`
- Test alarm triggers: `adb shell am broadcast -a android.intent.action.BOOT_COMPLETED`
- Check scheduled alarms: `adb shell dumpsys alarm | grep echoalarm`
- Test lockscreen display: Set alarm, lock device, wait for trigger

### Critical Test Cases
1. **Cluster Scheduling**: Verify N alarms are scheduled with correct intervals
2. **Tone Rotation**: Confirm tones rotate correctly (pool[i % pool.length])
3. **Lockscreen Wake**: Alarm must display over locked screen
4. **Doze Mode**: Test with device in Doze mode (battery saver)
5. **Boot Persistence**: Reboot device and verify alarms re-schedule
6. **Dismissal**: Ensure "DETENER" button stops sound and closes activity immediately
