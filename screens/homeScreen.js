import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Button,
  Picker,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { SwipeListView } from 'react-native-swipe-list-view';
import { getEntries, addEntry, updateEntry, deleteEntry } from '../components/services/journal';

const HomeScreen = ({ route }) => {
  const userId = route.params?.userId;
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [description, setDescription] = useState('');
  const [journals, setJournals] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [category, setCategory] = useState('All');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fullImageVisible, setFullImageVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
      await loadJournals();
      setIsLoading(false);
    })();
  }, []);

  const loadJournals = async () => {
    if (!userId) return;
    try {
      const data = await getEntries(userId);
      setJournals(data);
    } catch (e) {
      console.error('Error loading journals:', e);
      Alert.alert('Error', 'Failed to load entries');
    }
  };

  const takePicture = async () => {
    if (!cameraRef) return;
    try {
      const { uri } = await cameraRef.takePictureAsync({ quality: 0.8 });
      setImageUri(uri);
      setIsCameraOpen(false);
    } catch (e) {
      console.error('Camera error:', e);
      Alert.alert('Error', 'Could not take picture');
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        return Alert.alert('Permission', 'Allow photo access');
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (e) {
      console.error('ImagePicker error:', e);
      Alert.alert('Error', 'Could not select image');
    }
  };

  const resetForm = () => {
    setImageUri(null);
    setDescription('');
    setCategory('All');
    setEditingId(null);
  };

  const saveJournal = async () => {
    if (!imageUri || !description.trim()) {
      return Alert.alert('Validation', 'Image and description required');
    }
    try {
      if (editingId) {
        await updateEntry(editingId, imageUri, description.trim(), category);
        Alert.alert('Success', 'Entry updated');
      } else {
        await addEntry(userId, imageUri, description.trim(), new Date().toISOString(), category);
        Alert.alert('Success', 'Entry added');
      }
      await loadJournals();
      resetForm();
    } catch (e) {
      console.error('Save error:', e);
      Alert.alert('Error', 'Failed to save entry');
    }
  };

  const confirmDelete = (id) => Alert.alert('Delete Entry', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: async () => {
        try {
          await deleteEntry(id);
          await loadJournals();
        } catch (e) {
          console.error('Delete error:', e);
          Alert.alert('Error', 'Failed to delete entry');
        }
      },
    },
  ]);

  const showFullImage = (uri) => {
    setSelectedImage(uri);
    setFullImageVisible(true);
  };

  const filtered = category === 'All' ? journals : journals.filter((j) => j.category === category);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading journals...</Text>
      </View>
    );
  }

  if (hasCameraPermission === false) {
    return (
      <View style={styles.center}>
        <Text>No camera access</Text>
        <Button title="Allow Camera" onPress={() => Camera.requestCameraPermissionsAsync()} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Full Image Modal */}
      <Modal visible={fullImageVisible} transparent={true} onRequestClose={() => setFullImageVisible(false)}>
        <View style={styles.fullImageContainer}>
          <TouchableOpacity 
            style={styles.fullImageCloseButton}
            onPress={() => setFullImageVisible(false)}
          >
            <Text style={styles.fullImageCloseText}>✕</Text>
          </TouchableOpacity>
          <Image 
            source={{ uri: selectedImage }} 
            style={styles.fullImage} 
            resizeMode="contain"
          />
        </View>
      </Modal>

      {/* Camera Modal */}
      {Platform.OS !== 'web' && (
        <Modal visible={isCameraOpen} animationType="slide">
          <View style={styles.cameraContainer}>
            <Camera
              style={styles.camera}
              ref={(ref) => setCameraRef(ref)}
              ratio="16:9"
            />
            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.capture} onPress={takePicture}>
                <View style={styles.captureInner} />
              </TouchableOpacity>
              <Button title="Close" onPress={() => setIsCameraOpen(false)} />
            </View>
          </View>
        </Modal>
      )}

      <View style={styles.form}>
        <Text style={styles.heading}>{editingId ? 'Edit Entry' : 'New Entry'}</Text>
        {imageUri ? (
          <TouchableOpacity onPress={() => showFullImage(imageUri)}>
            <Image source={{ uri: imageUri }} style={styles.preview} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder}>
            <Text>No image selected</Text>
          </View>
        )}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.btn} onPress={() => setIsCameraOpen(true)}>
            <Text style={styles.btnText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={pickImage}>
            <Text style={styles.btnText}>Choose Image</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Description..."
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <View style={styles.pickerRow}>
          <Text>Category:</Text>
          {Platform.OS === 'web' ? (
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{ width: '100%', height: 40, marginBottom: 12, marginLeft: 8, borderRadius: 6 }}
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          ) : (
            <Picker
              selectedValue={category}
              onValueChange={setCategory}
              style={styles.picker}
            >
              {categories.map((c) => (
                <Picker.Item key={c} label={c} value={c} />
              ))}
            </Picker>
          )}
        </View>
        <TouchableOpacity style={styles.saveBtn} onPress={saveJournal}>
          <Text style={styles.saveText}>{editingId ? 'Update Entry' : 'Save Entry'}</Text>
        </TouchableOpacity>
        {editingId && (
          <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.list}>
        <Text style={styles.heading}>Your Journals</Text>
        <View style={styles.filterRow}>
          <Text>Filter:</Text>
          {Platform.OS === 'web' ? (
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{ width: '100%', height: 40, marginBottom: 12, marginLeft: 8, borderRadius: 6 }}
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          ) : (
            <Picker
              selectedValue={category}
              onValueChange={setCategory}
              style={styles.picker}
            >
              {categories.map((c) => (
                <Picker.Item key={c} label={c} value={c} />
              ))}
            </Picker>
          )}
        </View>
        {filtered.length > 0 ? (
          <SwipeListView
            data={filtered}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => showFullImage(item.image)}>
                <View style={styles.item}>
                  <Image source={{ uri: item.image }} style={styles.thumb} />
                  <View style={styles.info}>
                    <Text style={styles.desc}>{item.description}</Text>
                    <Text style={styles.meta}>{item.category} — {new Date(item.date).toLocaleDateString()}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            renderHiddenItem={({ item }) => (
              <View style={styles.hidden}>
                <TouchableOpacity
                  style={[styles.hiddenBtn, styles.edit]}
                  onPress={() => {
                    setEditingId(item.id);
                    setImageUri(item.image);
                    setDescription(item.description);
                    setCategory(item.category);
                  }}
                >
                  <Text style={styles.hiddenText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.hiddenBtn, styles.delete]}
                  onPress={() => confirmDelete(item.id)}
                >
                  <Text style={styles.hiddenText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
            rightOpenValue={-150}
            disableRightSwipe
          />
        ) : (
          <View style={styles.empty}>
            <Text>No entries{category !== 'All' ? ` in ${category}` : ''}.</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cameraContainer: { flex: 1, backgroundColor: 'black' },
  camera: { flex: 1 },
  cameraControls: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  capture: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'white' },
  form: { padding: 16, backgroundColor: 'white' },
  heading: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  preview: { width: '100%', height: 200, borderRadius: 8, marginBottom: 12 },
  placeholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  btn: { backgroundColor: '#4285f4', padding: 10, borderRadius: 6, flex: 0.48, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  pickerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  picker: { flex: 1, height: 40 },
  saveBtn: { backgroundColor: '#34a853', padding: 12, borderRadius: 6, alignItems: 'center', marginBottom: 8 },
  saveText: { color: 'white', fontWeight: 'bold' },
  cancelBtn: { backgroundColor: '#ea4335', padding: 12, borderRadius: 6, alignItems: 'center' },
  cancelText: { color: 'white', fontWeight: 'bold' },
  list: { flex: 1, padding: 16 },
  filterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  item: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    alignItems: 'center',
  },
  thumb: { width: 60, height: 60, borderRadius: 6 },
  info: { marginLeft: 12, flex: 1 },
  desc: { fontSize: 16, marginBottom: 4 },
  meta: { fontSize: 12, color: '#666' },
  hidden: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end' },
  hiddenBtn: { justifyContent: 'center', alignItems: 'center', width: 75 },
  edit: { backgroundColor: '#fbbc05' },
  delete: { backgroundColor: '#ea4335' },
  hiddenText: { color: 'white', fontWeight: 'bold' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fullImageContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  fullImageCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImageCloseText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});