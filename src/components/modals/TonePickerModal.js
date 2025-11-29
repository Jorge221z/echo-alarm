import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function TonePickerModal({ visible, onClose, onAddDefault, onAddCustom }) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>¿Qué tonos deseas añadir?</Text>

          <TouchableOpacity
            style={styles.modalButton}
            onPress={onAddDefault}>
            <Text style={styles.modalButtonText}>Tonos de la Aplicación (Predeterminados)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalButton}
            onPress={onAddCustom}>
            <Text style={styles.modalButtonText}>Tonos Personalizados del Móvil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modalButton, styles.buttonClose]}
            onPress={onClose}>
            <Text style={styles.modalButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dim background
  },
  modalView: {
    margin: 20,
    backgroundColor: '#6B5CE7', // Match theme
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  modalButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    width: 250,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonClose: {
    backgroundColor: '#FF6B6B', // Reddish for cancel
    marginTop: 10,
    borderColor: 'transparent',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});
