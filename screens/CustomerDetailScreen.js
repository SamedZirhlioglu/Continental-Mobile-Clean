import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function CustomerDetailScreen({ route }) {
    const { customer } = route.params;
    const [visitings, setVisitings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchVisitings = async () => {
        try {
            const q = query(collection(db, 'visitings'), where('customer_code', '==', customer.CODE));
            const snapshot = await getDocs(q);
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Tarih + saat bilgisine göre sıralama (en güncel en üstte)
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

    useEffect(() => {
        fetchVisitings();
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.visitCard}>
            <Text style={styles.text}>📅 {item.date} ⏰ {item.time}</Text>
            <Text style={styles.text}>💰 Total Price: {item.total_price ?? 'N/A'}</Text>
            <Text style={styles.text}>📝 {item.note}</Text>
        </View>
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
});
