import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Pressable,
    TextInput,
    Image, Modal, TouchableOpacity,
    SafeAreaView, Platform, StatusBar
} from 'react-native';

import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import ProductImage from '../cards/ProductImage';

export default function VisitingProductsScreen({ route }) {
    const { documentId } = route.params;
    const [modalVisible, setModalVisible] = useState(false);
    const [modalImageUrl, setModalImageUrl] = useState('');
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const updateTotalPrice = async () => {
        try {
            const visitingRef = doc(db, 'visitings', documentId);
            const visitingSnap = await getDoc(visitingRef);

            if (!visitingSnap.exists()) return;

            const visitingData = visitingSnap.data();
            const productList = visitingData.products || [];

            if (productList.length === 0) {
                await updateDoc(visitingRef, { total_price: "0" });
                return;
            }

            // Tüm ürünleri getir
            const productSnapshot = await getDocs(collection(db, 'products'));
            const allProducts = productSnapshot.docs.map(doc => ({ ...doc.data() }));

            let total = 0;

            productList.forEach(({ product_code, count }) => {
                const matchingProduct = allProducts.find(p => p.Code === product_code);
                if (matchingProduct && matchingProduct['Price [C]']) {
                    const unitPrice = parseFloat(matchingProduct['Price [C]']);
                    total += unitPrice * count;
                }
            });

            await updateDoc(visitingRef, {
                total_price: total.toFixed(2),
            });

            console.log(`✅ Total price güncellendi: £${total.toFixed(2)}`);

        } catch (error) {
            console.error('❌ Total price update error:', error);
        }
    };


    const updateProductCountInFirestore = async (productCode, count) => {
        try {
            const docRef = doc(db, 'visitings', documentId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) return;

            const data = docSnap.data();
            let updatedProducts = data.products || [];

            // Code zaten varsa, onu güncelle veya sil
            const existingIndex = updatedProducts.findIndex(p => p.product_code === productCode);

            if (count > 0) {
                if (existingIndex !== -1) {
                    // Güncelle
                    updatedProducts[existingIndex].count = count;
                } else {
                    // Yeni ekle
                    updatedProducts.push({ product_code: productCode, count });
                }
            } else {
                // 0 ise sil
                if (existingIndex !== -1) {
                    updatedProducts.splice(existingIndex, 1);
                }
            }

            await updateDoc(docRef, { products: updatedProducts });
            console.log('✅ Firestore güncellendi:', productCode, count);
            await updateTotalPrice();
            console.log('✅ Total Price güncellendi:', productCode, count);
        } catch (error) {
            console.error('❌ Firestore update error:', error);
        }
    };


    const fetchProducts = async () => {
        try {
            // Visiting dokümanını al
            const visitingRef = doc(db, 'visitings', documentId);
            const visitingSnap = await getDoc(visitingRef);

            let visitQuantities = {};
            if (visitingSnap.exists()) {
                const visitData = visitingSnap.data();
                (visitData.products || []).forEach(p => {
                    visitQuantities[p.product_code] = p.count;
                });
            }

            // Tüm ürünleri çek
            const snapshot = await getDocs(collection(db, 'products'));
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setProducts(list);

            // Miktarları eşleştirerek ata
            const initialQuantities = {};
            list.forEach(product => {
                const productCode = product.Code;
                initialQuantities[product.id] = visitQuantities[productCode] || 0;
            });
            setQuantities(initialQuantities);

        } catch (error) {
            console.log('❌ Product fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const changeQuantity = (id, delta) => {
        setQuantities(prev => {
            const newQty = Math.max(0, (prev[id] || 0) + delta);
            return { ...prev, [id]: newQty };
        });
    };

    const filteredProducts = products.filter(item => {
        const q = searchQuery.toLowerCase();
        return (
            item.Description?.toLowerCase().includes(q) ||
            item.Code?.toLowerCase().includes(q)
        );
    });

    const renderItem = ({ item }) => {
        return (
            <Pressable
                style={({ pressed }) => [
                    styles.card,
                    { opacity: pressed ? 0.95 : 1 },
                ]}
            >
                <TouchableOpacity
                    onPress={() => {
                        const url = `https://continentalwholesale.co.uk/images/products/${item.Code}.jpg`;
                        setModalImageUrl(url);
                        setModalVisible(true);
                    }}
                >
                    <ProductImage code={item.Code} />
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.Description}</Text>
                    <Text style={styles.code}>Code: {item.Code}</Text>
                    <Text style={styles.price}>Price: {item['Price [C]']}</Text>
                </View>
                <View style={styles.counterContainer}>
                    <TextInput
                        style={styles.counterInput}
                        value={String(quantities[item.id] || '')}
                        keyboardType="number-pad"
                        maxLength={3}
                        onChangeText={(text) => {
                            const cleaned = text.replace(/[^0-9]/g, '');
                            const numericValue = parseInt(cleaned, 10) || 0;

                            // Yerel state'i güncelle
                            setQuantities(prev => ({ ...prev, [item.id]: numericValue }));

                            // Firestore'u güncelle
                            updateProductCountInFirestore(item.Code, numericValue);
                        }}
                        placeholder="0"
                        placeholderTextColor="#aaa"
                    />
                </View>
            </Pressable>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Select Products</Text>
            <TextInput
                placeholder="Search by name or code..."
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
            />

            {loading ? (
                <ActivityIndicator size="large" color="tomato" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={filteredProducts}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 16 }}
                />
            )}

            {modalVisible && (
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackdrop} onPress={() => setModalVisible(false)} />
                    <View style={styles.modalContent}>
                        <Image
                            source={{ uri: modalImageUrl }}
                            style={styles.fullImage}
                            resizeMode="contain"
                        />
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },

    modalOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContent: {
        width: '90%',
        height: '70%',
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: '100%',
        height: '100%',
    },

    header: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingTop: 16,
        paddingHorizontal: 16,
    },
    searchInput: {
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#f1f1f1',
        borderRadius: 8,
        fontSize: 14,
        color: '#000',
    },
    card: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        marginBottom: 12,
        alignItems: 'center',
    },
    image: {
        width: 50,
        height: 50,
        marginRight: 12,
        borderRadius: 4,
        backgroundColor: '#ddd',
    },
    name: { fontWeight: 'bold', fontSize: 14 },
    code: { fontSize: 12, color: '#666' },
    price: { fontSize: 12, color: '#666' },
    counterContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    counterInput: {
        width: 50,
        height: 35,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        textAlign: 'center',
        fontSize: 16,
        color: '#000',
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    counterButton: {
        paddingHorizontal: 4,
    },
    counterValue: {
        width: 30,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
});
