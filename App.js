
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import TonePoolScreen from './src/screens/TonePoolScreen';
import { useState } from 'react';

const Stack = createNativeStackNavigator();

export default function App() {

  const [tonePool, setTonePool] = useState([]);
  
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
