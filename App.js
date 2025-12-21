
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import TonePoolScreen from './src/screens/TonePoolScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

export default function App() {

  const [tonePool, setTonePool] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingCompleted = await AsyncStorage.getItem('ONBOARDING_COMPLETED');
      setShowOnboarding(onboardingCompleted !== 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setShowOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  // Mostrar pantalla vacía mientras carga
  if (isLoading) {
    return null;
  }

  // Mostrar onboarding si es la primera vez
  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }
  
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Home'>
          
        <Stack.Screen 
          name="Home" 
          options={{ headerShown: false }} 
        >
          {(props) => <HomeScreen {...props} tonePool={tonePool} setTonePool={setTonePool} />}
        </Stack.Screen>

        <Stack.Screen 
          name="TonePool" 
          options={{ headerShown: false }}   
        >
          {(props) => <TonePoolScreen {...props} tonePool={tonePool} setTonePool={setTonePool} />}
        </Stack.Screen>

      </Stack.Navigator>
    </NavigationContainer>
  );
}
