import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';



export default function HomeScreen({ navigation }) {

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
  }
});
