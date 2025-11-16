import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';

export default function HomeScreen({ navigation }) {
  return (
  <LinearGradient
        colors={['#4A90E2', '#6B5CE7', '#5f61e6ff']}
        style={{flex: 1}}>

    <View style={styles.container}>
      <Text style={styles.mainText}>Hora de despertar -&gt; 8:00</Text>

      <Text style={styles.secoundaryText}>Número de alarmas {"\n"}programadas -&gt; 12</Text>

      

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
    paddingTop: 30,
    paddingHorizontal: 20,
  }
});
