import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { NativeModules } from 'react-native';



export default function HomeScreen({ navigation, tonePool, setTonePool }) {

  const [wakeTime, setWakeTime] = useState(new Date());

  const handleTimeChange = (newDate) => {
    setWakeTime(newDate);
  }

  // Function to open the time picker
  const openTimePicker = () => {
    DateTimePickerAndroid.open({
      value: wakeTime,   // Current time already set
      onChange: (event, selectedDate) => {
        const currentDate = selectedDate || wakeTime;
        if (selectedDate) { // Only update if a date is selected
          handleTimeChange(currentDate);
        }
      },
      mode: 'time',
      is24Hour: true,
    });
  }

  const [interval, setInterval] = useState(5);
  const handleIntervalChange = (text) => {
    const numericalValue = parseInt(text);
    if (!isNaN(numericalValue)) {
      setInterval(numericalValue);
    } else {
      setInterval(1); // Default to 1 if input is invalid
      console.log("Invalid input for interval | Falling back to 1");
    }
  }

  const [alarmCount, setAlarmCount] = useState(5);
  const handleAlarmCountChange = (text) => {
    const numericalValue = parseInt(text);
    if (!isNaN(numericalValue)) {
      setAlarmCount(numericalValue);
    } else {
      setAlarmCount(1); // Default to 1 if input is invalid
      console.log("Invalid input for alarm count | Falling back to 1");
    }
  }

  const { AlarmScheduler } = NativeModules;

  const handleClusterActivation = async () => {

    const now = new Date();

    const targetDate = new Date();
    targetDate.setHours(wakeTime.getHours());
    targetDate.setMinutes(wakeTime.getMinutes());
    targetDate.setSeconds(0); // Increase precision to the second
    targetDate.setMilliseconds(0);

    if (targetDate <= now) {
      // The alarm time is earlier than now, set for the next day then
      targetDate.setDate(targetDate.getDate() + 1);
    }
    
    const alarmProfile = {
    wakeTime: targetDate.toISOString(),
    interval: parseInt(interval) || 3,
    alarmCount: parseInt(alarmCount) || 3,
    tonePool: tonePool // Array of {name, uri}
  };

    try {
      await AsyncStorage.setItem('ALARM_PROFILE', JSON.stringify(alarmProfile));
      console.log("Saving alarm profile, ready to be sent to the native java module: ", alarmProfile);

      AlarmScheduler.setAlarmCluster(alarmProfile);
      
    } catch (error) {
      console.error("Error saving alarm profile: ", error);
    }

    console.log("Cluster Activated");
  }

  const handleClusterDeactivation = async () => {
    // TODO : Implement alarm cancellation logic here
    console.log("Cluster Deactivated");
  }

  const loadAlarmProfile = async () => {
    try {
      const perfilJSON = await AsyncStorage.getItem('ALARM_PROFILE');
      if (perfilJSON != null) {
        const perfil = JSON.parse(perfilJSON);
        console.log("Loaded alarm profile: ", perfil);
        return perfil;
      } else {
        console.log("No alarm profile found");
        return null;
      }
    } catch (error) {
      console.error("Error loading alarm profile: ", error);
      return null;
    }
  }
  
  useEffect(() => {

    const fetchAlarmProfile = async () => {
      const perfil = await loadAlarmProfile();
      if (perfil) {
        setWakeTime(new Date(perfil.wakeTime));
        setInterval(perfil.interval);
        setAlarmCount(perfil.alarmCount);
        setSelectedTones(perfil.tonePool || []);
      }
    };

    fetchAlarmProfile();
  }, []);


  return (
    <LinearGradient
      colors={['#4A90E2', '#6B5CE7', '#5f61e6ff']}
      style={{ flex: 1 }}>

      <View style={styles.container}>

        <TouchableOpacity onPress={openTimePicker}>
          <Text style={styles.mainText}>Wake up time {"\n"} {wakeTime.toLocaleTimeString()}</Text>
        </TouchableOpacity>


        <View style={styles.inputSection}>
          <Text style={styles.secoundaryText}>Alarm count for tomorrow: {alarmCount}</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            onChangeText={handleAlarmCountChange}
            value={alarmCount.toString()}
            placeholder="Enter count"
            placeholderTextColor="#CCCCCC"
          />
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.secoundaryText}>Interval: {interval}</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            onChangeText={handleIntervalChange}
            value={interval.toString()}
            placeholder="Enter interval"
            placeholderTextColor="#CCCCCC"
          />
        </View>

        <TouchableOpacity onPress={handleClusterActivation} style={styles.mainButton}>
          <Text style={styles.buttonText}>Activate Cluster</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleClusterDeactivation} style={styles.secondaryButton}>
          <Text style={styles.buttonText}>Deactivate Cluster</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => {navigation.navigate('TonePool'); console.log("Navigating to Tone Pool")}} 
          style={styles.tonePoolButton}>
          <Text style={styles.buttonText}>Manage Tone Pool</Text>
        </TouchableOpacity>

        <StatusBar style="auto" />
      </View>
    </LinearGradient>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 100,
  },
  mainText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  secoundaryText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
  },
  inputSection: {
    alignItems: 'center',
    marginTop: 30,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: 100,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 10,
    borderRadius: 10,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  mainButton: {
    backgroundColor: '#FF6347', // Un color vibrante para el botón principal
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 50,
    elevation: 8, // Sombra para Android
    shadowColor: '#FF6347', // Sombra para iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Estilo menos prominente
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  tonePoolButton: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 10,
  }
});
