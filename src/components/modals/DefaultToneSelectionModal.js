import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

export default function DefaultToneSelectionModal({ visible, onClose, onAdd, availableTones }) {
  const [selectedIds, setSelectedIds] = useState([]);

  // Reset selection when modal opens/closes or available tones change
  useEffect(() => {
    if (visible) {
      setSelectedIds([]);
    }
  }, [visible, availableTones]);

  const toggleSelection = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleAdd = () => {
    const selectedTones = availableTones.filter(tone => selectedIds.includes(tone.id));
    onAdd(selectedTones);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Selecciona los tonos</Text>

          {availableTones.length === 0 ? (
            <Text style={styles.emptyText}>No hay más tonos disponibles.</Text>
          ) : (
            <FlatList
              data={availableTones}
              keyExtractor={(item) => item.id}
              style={styles.list}
              renderItem={({ item }) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <TouchableOpacity
                    style={[
                      styles.toneItem,
                      isSelected && styles.toneItemSelected
                    ]}
                    onPress={() => toggleSelection(item.id)}
                  >
                    <Text style={styles.toneItemText}>{item.name}</Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.buttonCancel]}
              onPress={onClose}>
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>

            {availableTones.length > 0 && (
              <TouchableOpacity
                style={[styles.modalButton, styles.buttonAdd]}
                onPress={handleAdd}
                disabled={selectedIds.length === 0}
              >
                <Text style={[
                  styles.modalButtonText, 
                  selectedIds.length === 0 && styles.disabledText
                ]}>
                  Añadir ({selectedIds.length})
                </Text>
              </TouchableOpacity>
            )}
          </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: '#6B5CE7',
    borderRadius: 20,
    padding: 20,
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
  list: {
    width: '100%',
    marginBottom: 20,
  },
  toneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  toneItemSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: '#FFFFFF',
  },
  toneItemText: {
    color: 'white',
    fontSize: 16,
  },
  checkmark: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    width: '48%',
  },
  buttonCancel: {
    backgroundColor: '#FF6B6B',
  },
  buttonAdd: {
    backgroundColor: '#4A90E2',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledText: {
    color: 'rgba(255, 255, 255, 0.5)',
  }
});
