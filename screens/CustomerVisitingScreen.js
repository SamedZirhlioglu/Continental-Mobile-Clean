import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TextInput,
    ActivityIndicator,
    Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function CustomerVisitingScreen({ navigation }) {
    const [customers, setCustomers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');

    const fetchCustomers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'customers'));
            const list = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setCustomers(list);
            setFiltered(list);
        } catch (error) {
            console.log('❌ Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleSearch = (text) => {
        setQuery(text);
        const lower = text.toLowerCase();
        const results = customers.filter((item) =>
            (item.NAME || '').toLowerCase().includes(lower) ||
            (item.TEL || '').toLowerCase().includes(lower) ||
            (item.MOBILE || '').toLowerCase().includes(lower) ||
            (item.ADDRESS1 || '').toLowerCase().includes(lower) ||
            (item.CITY || '').toLowerCase().includes(lower)
        );
        setFiltered(results);
    };

    const renderItem = ({ item }) => (
        <Pressable onPress={() => navigation.navigate('CustomerDetail', { customer: item })}>
            <View style={styles.card}>
                <Text style={styles.name}>👤 {item.NAME}</Text>
                <Text style={styles.text}>🆔 {item.CODE}</Text>
                <Text style={styles.text}>📞 {item.TEL || item.MOBILE}</Text>
                <Text style={styles.text}>🏠 {item.ADDRESS1}</Text>
                <Text style={styles.text}>📍 {item.CITY} / {item['POST CODE']}</Text>
            </View>
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Customer Visiting</Text>

            <TextInput
                style={styles.search}
                placeholder="Search by name, phone, or address..."
                value={query}
                onChangeText={handleSearch}
            />

            {loading ? (
                <ActivityIndicator size="large" color="tomato" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={filtered}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fefefe' },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        padding: 16,
        paddingBottom: 8,
        backgroundColor: 'white',
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
    },
    search: {
        backgroundColor: '#fff',
        padding: 12,
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 8,
        fontSize: 16,
        borderColor: '#ccc',
        borderWidth: 1,
        marginTop: 12, // 🔹 header'dan boşluk bırakmak için
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        elevation: 2,
    },
    name: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    text: { fontSize: 14, color: '#555' },
});
