import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { useState } from 'react';
import { pick, types, isCancel } from '@react-native-documents/picker';
import { DEFAULT_TONES_DATA } from '../resources/ToneCollector';
import TonePickerModal from '../components/modals/TonePickerModal';
import DefaultToneSelectionModal from '../components/modals/DefaultToneSelectionModal';


export default function TonePoolScreen({ navigation, tonePool, setTonePool }) {

  const addCustomTones = async () => {
    try {
      const results = await pick({
        allowMultiSelection: true,
        types: [types.audio],
      });

      if (results.length > 0) {

        // Optionally keep a local copy of the selected tones
        // TODO: Need to see if this necessary for the MVP

        setTonePool([...tonePool, ...results]);
        console.log("Selected tones: ", results);
      } else {
        console.log("No tones selected");
      }

    } catch (error) {
      if (isCancel(error)) {
        console.log("User cancelled tone selection");
      } else {
        console.error("Error selecting tones: ", error);
      }
    }

    setIsModalVisible(false);
  }

  const [isModalVisible, setIsModalVisible] = useState(false); // Modal to pick app tones or user tones
  const [isDefaultSelectionModalVisible, setIsDefaultSelectionModalVisible] = useState(false);

  const openDefaultToneSelection = () => {
    setIsModalVisible(false);
    setIsDefaultSelectionModalVisible(true);
  }

  const handleConfirmDefaultTones = (selectedTones) => {
    const newTones = selectedTones.map(tone => ({
      id: tone.id,
      name: tone.name,
      uri: tone.source, // Using 'source' as 'uri' for consistency
      isDefault: true
    }));

    setTonePool(tonePool => ([...tonePool, ...newTones]));
    console.log("Added default tones: ", newTones);
    setIsDefaultSelectionModalVisible(false);
  }

  const availableDefaultTones = DEFAULT_TONES_DATA.filter(tone => {
    const alreadyInPool = tonePool.some(tp => tp.id === tone.id);
    return !alreadyInPool;
  });

  return (
    <LinearGradient
      colors={['#4A90E2', '#6B5CE7', '#5f61e6ff']}
      style={{ flex: 1 }}>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <Text style={styles.mainText}>Pool de tonos</Text>

        <FlatList
          style={{ marginTop: 20, width: '100%' }}
          contentContainerStyle={{ alignItems: 'center' }}
          data={tonePool}
          keyExtractor={(item) => item.uri}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.listItemText}>{item.name}</Text>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => toneDeletion(item.uri)}
              >
                <Text style={styles.deleteButtonText}>X</Text>
              </TouchableOpacity>
            </View>
          )}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.addButtonText}>Agregar tonos</Text>
        </TouchableOpacity>

        <TonePickerModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onAddDefault={openDefaultToneSelection}
          onAddCustom={addCustomTones}
        />

        <DefaultToneSelectionModal
          visible={isDefaultSelectionModalVisible}
          onClose={() => setIsDefaultSelectionModalVisible(false)}
          onAdd={handleConfirmDefaultTones}
          availableTones={availableDefaultTones}
        />

        <StatusBar style="auto" />
      </View>

    </LinearGradient>
  );
}



const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 50,
    left: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    zIndex: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
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
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
    marginTop: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
