import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, StyleSheet, Pressable,
    ActivityIndicator, TextInput, TouchableOpacity, Modal, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CustomerDetailScreen({ route, navigation }) {
    const { customer } = route.params;
    const [visitings, setVisitings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [note, setNote] = useState('');

    useEffect(() => {
        fetchVisitings();
    }, []);
    const insets = useSafeAreaInsets();

    const handleToggleCompleted = async (visit) => {
        try {
            const ref = doc(db, 'visitings', visit.id);
            await updateDoc(ref, { completed: !visit.completed });
            fetchVisitings(); // veriyi tekrar çek
        } catch (error) {
            console.log('❌ update error:', error);
        }
    };


    const fetchVisitings = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'visitings'), where('customer_code', '==', customer.CODE));
            const snapshot = await getDocs(q);
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const sortedList = list.sort((a, b) => {
                const aTime = new Date(`${a.date}T${a.time || '00:00'}`);
                const bTime = new Date(`${b.date}T${b.time || '00:00'}`);
                return bTime - aTime;
            });

            setVisitings(sortedList);
        } catch (error) {
            console.log('❌ Visiting fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddVisit = async () => {
        if (!note.trim()) {
            Alert.alert('Validation', 'Please enter a note.');
            return;
        }

        const now = new Date();
        const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const time = now.toTimeString().slice(0, 5);   // HH:mm

        const newVisit = {
            customer_code: customer.CODE,
            date,
            time,
            note,
            total_price: "0",
            products: [],
            completed: false,
        };

        try {
            await addDoc(collection(db, 'visitings'), newVisit);
            setModalVisible(false);
            setNote('');
            fetchVisitings(); // listeyi yenile
        } catch (err) {
            console.log('❌ Error adding visit:', err);
            Alert.alert('Error', 'Failed to add visit.');
        }
    };

    const renderItem = ({ item }) => (
        <Pressable
            onPress={() => navigation.navigate('VisitingProducts', { documentId: item.id })}

            style={({ pressed }) => [
                styles.visitCard,
                {
                    backgroundColor: item.completed ? '#d4edda' : '#dbeafe',
                    opacity: pressed ? 0.9 : 1,
                },
            ]}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.text}>📅 {item.date} ⏰ {item.time}</Text>
                    <Text style={styles.text}>💰 Total Price: {item.total_price ?? 'N/A'}</Text>
                    <Text style={styles.text}>📝 {item.note}</Text>
                </View>
                <Pressable onPress={() => handleToggleCompleted(item)} hitSlop={10}>
                    <Ionicons
                        name={item.completed ? 'checkmark-circle' : 'checkmark-circle-outline'}
                        size={28}
                        color={item.completed ? 'green' : 'gray'}
                    />
                </Pressable>
            </View>
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Visitings for {customer.NAME}</Text>
            {loading ? (
                <ActivityIndicator size="large" color="tomato" style={{ marginTop: 20 }} />
            ) : visitings.length === 0 ? (
                <Text style={styles.empty}>No visits found.</Text>
            ) : (
                <FlatList
                    data={visitings}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                />
            )}

            {/* FAB Button */}
            <TouchableOpacity style={styles.fab(insets)} onPress={() => setModalVisible(true)}>
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>


            {/* Modal for new note */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add New Visit</Text>
                        <TextInput
                            placeholder="Enter note..."
                            style={styles.input}
                            multiline
                            value={note}
                            onChangeText={setNote}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                                <Text style={{ color: '#555' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleAddVisit} style={styles.saveButton}>
                                <Text style={{ color: '#fff' }}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        backgroundColor: '#fff',
    },
    visitCard: {
        backgroundColor: '#f8f8f8',
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
    },
    text: { fontSize: 14, marginBottom: 4 },
    empty: { padding: 16, fontSize: 16, color: '#999' },

    fab: (insets) => ({
        position: 'absolute',
        bottom: insets.bottom + 16,  // güvenli alanı hesaba katar
        right: 24,
        backgroundColor: 'tomato',
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    }),


    modalContainer: {
        flex: 1,
        backgroundColor: '#00000088',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        height: 100,
        textAlignVertical: 'top',
        marginBottom: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginRight: 10,
    },
    saveButton: {
        backgroundColor: 'tomato',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
    },
});
