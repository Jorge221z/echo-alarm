import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { useState, useRef } from 'react';
import { pick, types, isCancel } from '@react-native-documents/picker';
import { DEFAULT_TONES_DATA } from '../resources/ToneCollector';
import TonePickerModal from '../components/modals/TonePickerModal';
import DefaultToneSelectionModal from '../components/modals/DefaultToneSelectionModal';

const { width } = Dimensions.get('window');

const ToneListItem = ({ item, onDelete }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const height = useRef(new Animated.Value(65)).current; // Reduced height
  const marginBottom = useRef(new Animated.Value(8)).current;

  const handleDelete = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: width,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(height, {
        toValue: 0,
        duration: 300,
        delay: 150,
        useNativeDriver: false,
      }),
      Animated.timing(marginBottom, {
        toValue: 0,
        duration: 300,
        delay: 150,
        useNativeDriver: false,
      })
    ]).start(() => {
      onDelete(item.uri);
    });
  };

  return (
    <Animated.View style={[
      styles.listItem, 
      { 
        transform: [{ translateX }], 
        opacity,
        height,
        marginBottom,
        overflow: 'hidden'
      }
    ]}>
      <View style={styles.listItemContent}>
        <View style={styles.toneIconContainer}>
          <Text style={styles.toneIcon}>🎵</Text>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.listItemText} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.subText}>
            {item.isDefault ? 'Predeterminado' : 'Personalizado'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const EmptyState = () => (
  <View style={styles.emptyStateContainer}>
    <Text style={styles.emptyStateIcon}>🔕</Text>
    <Text style={styles.emptyStateTitle}>¡Todo en silencio!</Text>
    <Text style={styles.emptyStateText}>
      Añade algunos tonos para crear tu alarma perfecta.
    </Text>
  </View>
);

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
      uri: tone.uri,
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

  const toneDeletion = (uri) => {
    const updatedPool = tonePool.filter(tone => tone.uri !== uri);
    setTonePool(updatedPool);
    console.log("Deleted tone with uri: ", uri);
  }

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
          contentContainerStyle={{ alignItems: 'center', flexGrow: 1 }}
          data={tonePool}
          keyExtractor={(item) => item.uri}
          ListEmptyComponent={EmptyState}
          renderItem={({ item }) => (
            <ToneListItem 
              item={item} 
              onDelete={toneDeletion} 
            />
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    width: '95%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    height: '100%',
    width: '100%',
  },
  toneIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toneIcon: {
    fontSize: 18,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  listItemText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  subText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    fontWeight: '400',
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: 'bold',
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
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyStateIcon: {
    fontSize: 60,
    marginBottom: 20,
    opacity: 0.6,
  },
  emptyStateTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
