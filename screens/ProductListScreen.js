import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Image,
    TextInput,
} from 'react-native';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import ProductCard from '../cards/ProductCard';

export default function ProductListScreen() {
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');

    const fetchProducts = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'products'));
            const items = [];
            querySnapshot.forEach(doc => {
                items.push({ id: doc.id, ...doc.data() });
            });
            setProducts(items);
            setFiltered(items); // başta tüm liste
        } catch (error) {
            console.log('❌ Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSearch = (text) => {
        setQuery(text);
        if (text === '') {
            setFiltered(products);
        } else {
            const lower = text.toLowerCase();
            const filteredData = products.filter(
                item =>
                    item.Description?.toLowerCase().includes(lower) ||
                    item.Code?.toLowerCase().includes(lower)
            );
            setFiltered(filteredData);
        }
    };

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="tomato" />
                <Text>Loading products...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Product List</Text>
            <TextInput
                style={styles.search}
                placeholder="Search by name or code..."
                value={query}
                onChangeText={handleSearch}
            />
            <FlatList
                data={filtered}
                renderItem={({ item }) => <ProductCard item={item} />}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        fontSize: 24,
        fontWeight: '700',
        padding: 16,
        paddingTop: 50,
        backgroundColor: 'white',
    },
    search: {
        backgroundColor: 'white',
        padding: 12,
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 8,
        fontSize: 16,
        marginTop: 12, // 🔹 header'dan boşluk bırakmak için
    },
    list: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        elevation: 2,
    },
    image: {
        width: 80,
        height: 80,
        marginRight: 12,
        borderRadius: 8,
        backgroundColor: '#eee',
    },
    details: {
        flex: 1,
        justifyContent: 'center',
    },
    title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    text: { fontSize: 14, color: '#555' },
});
