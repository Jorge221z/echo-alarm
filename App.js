
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import TonePoolScreen from './src/screens/TonePoolScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Home'>
          
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ headerShown: false }} 
        />

        <Stack.Screen 
          name="TonePool" 
          component={TonePoolScreen}
          options={{ headerShown: false }} 
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
