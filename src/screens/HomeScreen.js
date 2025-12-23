import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Modal, NativeModules, Animated, Alert } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { useEffect, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TimePickerModal from '../components/modals/TimePickerModal';



export default function HomeScreen({ navigation, tonePool, setTonePool }) {

  const [wakeTime, setWakeTime] = useState(new Date());
  const [isClusterActive, setIsClusterActive] = useState(false);
  
  // Estado para modal personalizado
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ 
    type: 'success', 
    title: '', 
    message: '', 
    buttonText: '',
    showSecondButton: false,
    secondButtonText: '',
    onSecondButtonPress: null
  });
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const showCustomModal = (type, title, message, buttonText = 'OK', options = {}) => {
    setModalContent({ 
      type, 
      title, 
      message, 
      buttonText,
      showSecondButton: options.showSecondButton || false,
      secondButtonText: options.secondButtonText || '',
      onSecondButtonPress: options.onSecondButtonPress || null
    });
    setModalVisible(true);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  // Estado para el modal de selección de hora
  const [timePickerVisible, setTimePickerVisible] = useState(false);

  const handleTimeChange = (newDate) => {
    setWakeTime(newDate);
  };

  const openTimePicker = () => {
    setTimePickerVisible(true);
  };

  const [interval, setIntervalValue] = useState(5);
  const handleIntervalChange = (text) => {
    const numericalValue = parseInt(text);
    if (!isNaN(numericalValue) && numericalValue > 0) {
      setIntervalValue(numericalValue);
    } else {
      setIntervalValue(1); // Default to 1 if input is invalid
      console.log("Invalid input for interval | Falling back to 1");
    }
  }
  const incrementInterval = () => setIntervalValue(prev => prev + 1);
  const decrementInterval = () => setIntervalValue(prev => Math.max(1, prev - 1));

  const [alarmCount, setAlarmCount] = useState(5);
  const handleAlarmCountChange = (text) => {
    const numericalValue = parseInt(text);
    if (!isNaN(numericalValue) && numericalValue > 0) {
      setAlarmCount(numericalValue);
    } else {
      setAlarmCount(1); // Default to 1 if input is invalid
      console.log("Invalid input for alarm count | Falling back to 1");
    }
  }
  const incrementAlarmCount = () => setAlarmCount(prev => prev + 1);
  const decrementAlarmCount = () => setAlarmCount(prev => Math.max(1, prev - 1));

  const { AlarmScheduler, OverlayPermissionModule } = NativeModules;

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
      setIsClusterActive(true);
      
      // Calcular hora de última alarma
      const lastAlarmTime = new Date(targetDate);
      lastAlarmTime.setMinutes(lastAlarmTime.getMinutes() + (interval * (alarmCount - 1)));
      const lastTimeStr = lastAlarmTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      const firstTimeStr = wakeTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      
      showCustomModal(
        'success',
        '¡Clúster Activado!',
        `🔔 ${alarmCount} alarmas programadas\n\n` +
        `⏰ Primera: ${firstTimeStr}\n` +
        `⏰ Última: ${lastTimeStr}\n` +
        `⏱️ Intervalo: ${interval} min\n\n` +
        `🎵 Tonos: ${tonePool.length > 0 ? tonePool.length + ' en rotación' : 'Por defecto'}`,
        '¡Perfecto!'
      );
      
    } catch (error) {
      console.error("Error saving alarm profile: ", error);
      showCustomModal(
        'error',
        'Error',
        'No se pudo activar el clúster.\nInténtalo de nuevo.',
        'Entendido'
      );
    }

    console.log("Cluster Activated");
  }

  const handleClusterDeactivation = async () => {
    try {
      // Java module call to cancel alarms
      await AlarmScheduler.cancelAllAlarms();
      console.log("All alarms cancelled via native module.");

      // Kill the current sounding alarm if any
      await AlarmScheduler.stopCurrentSound();
      console.log("Current sounding alarm (if any) killed via native module.");

      // Clean async storage
      await AsyncStorage.removeItem('ALARM_PROFILE');
      console.log("Alarm profile removed from AsyncStorage.");

      setIsClusterActive(false);
      showCustomModal(
        'deactivate',
        'Clúster Desactivado',
        'Todas las alarmas han sido canceladas.\n\n💤 Configura uno nuevo cuando quieras.',
        'OK'
      );

    } catch (error) {
      console.error("Error cancelling alarm cluster: ", error);
    }
    console.log("Cluster Fully Deactivated");
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
        setIntervalValue(perfil.interval);
        setAlarmCount(perfil.alarmCount);
        setTonePool(perfil.tonePool || []);
        setIsClusterActive(true); // Si hay perfil guardado, hay alarmas activas
      }
    };

    fetchAlarmProfile();
  }, []);

  const checkAndRequestOverlayPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      console.log("Checking overlay permission...");
      const hasPermission = await OverlayPermissionModule.hasPermission();
      console.log("Overlay permission status: ", hasPermission);
      if (!hasPermission) {
        showCustomModal(
          'permission',
          'Permiso Requerido',
          '🔓 Para que la alarma suene y se muestre correctamente sobre otras apps, necesitas activar este permiso.\n\n' +
          'Sin este permiso, la alarma no podrá despertarte cuando el teléfono esté bloqueado.',
          'Cancelar',
          {
            showSecondButton: true,
            secondButtonText: 'Activar',
            onSecondButtonPress: () => {
              OverlayPermissionModule.requestPermission();
              hideModal();
            }
          }
        );
      } else {
        console.log("Overlay permission already granted.");
      }
    } catch (e) {
      console.error(e);
    }
  }
};

  useEffect(() => {
    if (Platform.OS === 'android' && OverlayPermissionModule) {
      checkAndRequestOverlayPermission();
    } else {
      console.error("Overlay permission check skipped: Not Android or module not available.");
    }
  }, []);


  return (
    <LinearGradient
      colors={['#4A90E2', '#6B5CE7', '#5f61e6ff']}
      style={{ flex: 1 }}>

      <View style={styles.container}>

        {/* Indicador de estado */}
        <View style={[styles.statusBadge, isClusterActive ? styles.statusActive : styles.statusInactive]}>
          <Text style={styles.statusText}>
            {isClusterActive ? '🔔 Alarma Activa' : '😴 Sin Alarmas'}
          </Text>
        </View>

        <TouchableOpacity onPress={openTimePicker} disabled={isClusterActive}>
          <Text style={[styles.mainText, isClusterActive && styles.disabledText]}>
            Hora de despertar{"\n"}{wakeTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </Text>
        </TouchableOpacity>


        <View style={styles.inputSection}>
          <Text style={styles.secoundaryText}>Número de alarmas</Text>
          <View style={styles.stepperContainer}>
            <View style={[styles.valueDisplay, isClusterActive && styles.inputDisabled]}>
              <Text style={styles.valueDisplayText}>{alarmCount}</Text>
            </View>
            <View style={styles.stepperButtons}>
              <TouchableOpacity 
                onPress={incrementAlarmCount} 
                style={[styles.stepperButton, isClusterActive && styles.stepperButtonDisabled]}
                disabled={isClusterActive}
              >
                <Text style={styles.stepperButtonText}>▲</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={decrementAlarmCount} 
                style={[styles.stepperButton, isClusterActive && styles.stepperButtonDisabled]}
                disabled={isClusterActive}
              >
                <Text style={styles.stepperButtonText}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.secoundaryText}>Intervalo (minutos)</Text>
          <View style={styles.stepperContainer}>
            <View style={[styles.valueDisplay, isClusterActive && styles.inputDisabled]}>
              <Text style={styles.valueDisplayText}>{interval}</Text>
            </View>
            <View style={styles.stepperButtons}>
              <TouchableOpacity 
                onPress={incrementInterval} 
                style={[styles.stepperButton, isClusterActive && styles.stepperButtonDisabled]}
                disabled={isClusterActive}
              >
                <Text style={styles.stepperButtonText}>▲</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={decrementInterval} 
                style={[styles.stepperButton, isClusterActive && styles.stepperButtonDisabled]}
                disabled={isClusterActive}
              >
                <Text style={styles.stepperButtonText}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Botón principal condicional */}
        {!isClusterActive ? (
          <TouchableOpacity onPress={handleClusterActivation} style={styles.mainButton}>
            <Text style={styles.buttonText}>Activar Clúster</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleClusterDeactivation} style={styles.deactivateButton}>
            <Text style={styles.buttonText}>Desactivar Clúster</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          onPress={() => {navigation.navigate('TonePool'); console.log("Navigating to Tone Pool")}} 
          style={styles.tonePoolButton}>
          <Text style={styles.buttonText}>🎵 Gestionar Tonos</Text>
        </TouchableOpacity>

        {/* Modal de selección de hora */}
        <TimePickerModal
          visible={timePickerVisible}
          onClose={() => setTimePickerVisible(false)}
          onConfirm={handleTimeChange}
          initialTime={wakeTime}
        />

        {/* Modal Personalizado */}
        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="fade"
          onRequestClose={hideModal}
        >
          <View style={styles.modalOverlay}>
            <Animated.View style={[
              styles.modalContainer,
              { transform: [{ scale: scaleAnim }] }
            ]}>
              <LinearGradient
                colors={
                  modalContent.type === 'success' 
                    ? ['#4CAF50', '#45a049'] 
                    : modalContent.type === 'error'
                    ? ['#E74C3C', '#c0392b']
                    : modalContent.type === 'permission'
                    ? ['#FF9800', '#F57C00']
                    : ['#6B5CE7', '#5f61e6']
                }
                style={styles.modalHeader}
              >
                <Text style={styles.modalIcon}>
                  {modalContent.type === 'success' ? '✅' : 
                   modalContent.type === 'error' ? '❌' : 
                   modalContent.type === 'permission' ? '🔐' : '🛑'}
                </Text>
                <Text style={styles.modalTitle}>{modalContent.title}</Text>
              </LinearGradient>
              
              <View style={styles.modalBody}>
                <Text style={styles.modalMessage}>{modalContent.message}</Text>
                
                {modalContent.showSecondButton ? (
                  <View style={styles.modalButtonsRow}>
                    <TouchableOpacity 
                      onPress={hideModal}
                      style={styles.modalButtonSecondary}
                    >
                      <Text style={styles.modalButtonSecondaryText}>{modalContent.buttonText}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={modalContent.onSecondButtonPress}
                      style={[styles.modalButton, styles.modalButtonPermission]}
                    >
                      <Text style={styles.modalButtonText}>{modalContent.secondButtonText}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    onPress={hideModal}
                    style={[
                      styles.modalButton,
                      modalContent.type === 'success' && styles.modalButtonSuccess,
                      modalContent.type === 'error' && styles.modalButtonError,
                      modalContent.type === 'deactivate' && styles.modalButtonDeactivate,
                    ]}
                  >
                    <Text style={styles.modalButtonText}>{modalContent.buttonText}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          </View>
        </Modal>

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
    paddingTop: 60,
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  statusInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  mainText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 25,
    paddingHorizontal: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  disabledText: {
    opacity: 0.6,
  },
  secoundaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  inputSection: {
    alignItems: 'center',
    marginTop: 25,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueDisplay: {
    height: 50,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  valueDisplayText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  inputDisabled: {
    opacity: 0.5,
  },
  stepperButtons: {
    marginLeft: 10,
  },
  stepperButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  stepperButtonDisabled: {
    opacity: 0.4,
  },
  stepperButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  mainButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 45,
    borderRadius: 30,
    marginTop: 40,
    elevation: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  deactivateButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 16,
    paddingHorizontal: 45,
    borderRadius: 30,
    marginTop: 40,
    elevation: 8,
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  tonePoolButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginTop: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 15,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  modalHeader: {
    paddingVertical: 25,
    alignItems: 'center',
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  modalBody: {
    padding: 25,
    alignItems: 'center',
  },
  modalMessage: {
    color: '#CCCCCC',
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 25,
  },
  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 25,
    minWidth: 150,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  modalButtonSecondary: {
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 25,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  modalButtonSecondaryText: {
    color: '#AAAAAA',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalButtonSuccess: {
    backgroundColor: '#4CAF50',
  },
  modalButtonError: {
    backgroundColor: '#E74C3C',
  },
  modalButtonDeactivate: {
    backgroundColor: '#6B5CE7',
  },
  modalButtonPermission: {
    backgroundColor: '#FF9800',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
