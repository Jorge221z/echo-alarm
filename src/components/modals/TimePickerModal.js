import React, { useState, useEffect, useRef } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';

export default function TimePickerModal({ visible, onClose, onConfirm, initialTime }) {
  const [selectedHour, setSelectedHour] = useState(initialTime?.getHours() || 7);
  const [selectedMinute, setSelectedMinute] = useState(initialTime?.getMinutes() || 0);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setSelectedHour(initialTime?.getHours() || 7);
      setSelectedMinute(initialTime?.getMinutes() || 0);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible, initialTime]);

  const handleConfirm = () => {
    const newDate = new Date();
    newDate.setHours(selectedHour);
    newDate.setMinutes(selectedMinute);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    onConfirm(newDate);
    hideModal();
  };

  const hideModal = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const incrementHour = () => setSelectedHour(prev => (prev + 1) % 24);
  const decrementHour = () => setSelectedHour(prev => (prev - 1 + 24) % 24);
  const incrementMinute = () => setSelectedMinute(prev => (prev + 1) % 60);
  const decrementMinute = () => setSelectedMinute(prev => (prev - 1 + 60) % 60);

  // Incremento rápido de 5 minutos
  const incrementMinuteFast = () => setSelectedMinute(prev => (prev + 5) % 60);
  const decrementMinuteFast = () => setSelectedMinute(prev => (prev - 5 + 60) % 60);

  const formatNumber = (num) => num.toString().padStart(2, '0');

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={hideModal}
    >
      <View style={styles.overlay}>
        <Animated.View style={[
          styles.container,
          { transform: [{ scale: scaleAnim }] }
        ]}>
          <LinearGradient
            colors={['#4A90E2', '#6B5CE7']}
            style={styles.header}
          >
            <Text style={styles.headerIcon}>⏰</Text>
            <Text style={styles.headerTitle}>Hora de Despertar</Text>
          </LinearGradient>

          <View style={styles.body}>
            {/* Display grande de la hora seleccionada */}
            <View style={styles.timeDisplayContainer}>
              <Text style={styles.timeDisplay}>
                {formatNumber(selectedHour)}:{formatNumber(selectedMinute)}
              </Text>
            </View>

            {/* Selectores de hora y minuto */}
            <View style={styles.pickersContainer}>
              {/* Selector de Hora */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Hora</Text>
                <View style={styles.pickerControls}>
                  <TouchableOpacity onPress={incrementHour} style={styles.arrowButton}>
                    <Text style={styles.arrowText}>▲</Text>
                  </TouchableOpacity>
                  <View style={styles.valueContainer}>
                    <Text style={styles.valueText}>{formatNumber(selectedHour)}</Text>
                  </View>
                  <TouchableOpacity onPress={decrementHour} style={styles.arrowButton}>
                    <Text style={styles.arrowText}>▼</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Separador */}
              <View style={styles.separator}>
                <Text style={styles.separatorText}>:</Text>
              </View>

              {/* Selector de Minuto */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Minuto</Text>
                <View style={styles.pickerControls}>
                  <TouchableOpacity onPress={incrementMinute} style={styles.arrowButton}>
                    <Text style={styles.arrowText}>▲</Text>
                  </TouchableOpacity>
                  <View style={styles.valueContainer}>
                    <Text style={styles.valueText}>{formatNumber(selectedMinute)}</Text>
                  </View>
                  <TouchableOpacity onPress={decrementMinute} style={styles.arrowButton}>
                    <Text style={styles.arrowText}>▼</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Botones de incremento rápido para minutos */}
            <View style={styles.quickButtons}>
              <TouchableOpacity onPress={decrementMinuteFast} style={styles.quickButton}>
                <Text style={styles.quickButtonText}>-5 min</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={incrementMinuteFast} style={styles.quickButton}>
                <Text style={styles.quickButtonText}>+5 min</Text>
              </TouchableOpacity>
            </View>

            {/* Botones de acción */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity onPress={hideModal} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
                <LinearGradient
                  colors={['#4CAF50', '#45a049']}
                  style={styles.confirmButtonGradient}
                >
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
  },
  header: {
    paddingVertical: 22,
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  body: {
    padding: 25,
    alignItems: 'center',
  },
  timeDisplayContainer: {
    backgroundColor: 'rgba(107, 92, 231, 0.2)',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 16,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(107, 92, 231, 0.4)',
  },
  timeDisplay: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '300',
    letterSpacing: 4,
  },
  pickersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  pickerColumn: {
    alignItems: 'center',
  },
  pickerLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pickerControls: {
    alignItems: 'center',
  },
  arrowButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 12,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  arrowText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  valueContainer: {
    backgroundColor: 'rgba(74, 144, 226, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    marginVertical: 5,
    minWidth: 70,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.5)',
  },
  valueText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
  },
  separator: {
    paddingHorizontal: 15,
    paddingTop: 25,
  },
  separatorText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '300',
  },
  quickButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 25,
  },
  quickButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  quickButtonText: {
    color: '#AAAAAA',
    fontSize: 14,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cancelButtonText: {
    color: '#AAAAAA',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  confirmButtonGradient: {
    paddingVertical: 14,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
