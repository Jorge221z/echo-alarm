import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { useState } from 'react';

export default function TonePoolScreen({ navigation }) {

  const [selectedTones, setSelectedTones] = useState([]);
  const handleToneSelection = (toneObject) => {
    if (toneObject && toneObject.uri) {
      setSelectedTones([...selectedTones, toneObject]);
    } else {
      console.log("No tone selected");
    }
  }



  return (
    <LinearGradient
      colors={['#4A90E2', '#6B5CE7', '#5f61e6ff']}
      style={{ flex: 1 }}>

      <View style={styles.container}>
        <Text style={styles.mainText}>Pool de tonos</Text>

        <FlatList
          style={{ marginTop: 20, width: '100%' }}
          contentContainerStyle={{ alignItems: 'center' }}
          data={selectedTones}
          keyExtractor={(item) => item.uri}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.listItemText}>{item.name}</Text>
            </View>
          )}
        />

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
  },
  listItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Fondo semitransparente claro
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginVertical: 6, // Space between items
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4, // Shadow for Android
    flexDirection: 'row', // To align text and button horizontally
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500', // Slightly less bold than the title
    flexShrink: 1, // Allows the text to shrink if it's too long
  },
  // Style for the delete button (which comes next)
  deleteButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    padding: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
