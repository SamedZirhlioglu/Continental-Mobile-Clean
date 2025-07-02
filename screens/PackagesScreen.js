import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TextInput,
    Pressable,
    ScrollView,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { imageMap } from '../scripts/imageMap'

export default function PackagesScreen() {
    const [packages, setPackages] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalImage, setModalImage] = useState(null);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'packages'));
                const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPackages(list);

                const uniqueCategories = [
                    ...new Set(list.map(item => item.Category).filter(Boolean)),
                ];
            } catch (err) {
                console.log('❌ Error fetching packages:', err);
            }
        };

        fetchPackages();
    }, []);

    const toggleExpand = (id) => {
        setExpandedId(prev => (prev === id ? null : id));
    };

    const renderField = (label, value, unit = '') => (
        <Text style={styles.text}>
            <Text style={styles.label}>{label}</Text>
            {value ? ` ${value}${unit}` : ''}
        </Text>
    );

    const getImageForCode = (code) => {
        return imageMap[code] || require('../assets/placeholder.png');
    };

    const filteredData = packages.filter(item => {
        const matchesSearch =
            item.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.Code?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory
            ? item.Category === selectedCategory
            : true;
        return matchesSearch && matchesCategory;
    });

    const filteredCategories = [
        ...new Set(filteredData.map(item => item.Category).filter(Boolean)),
    ];

    const renderItem = useCallback(({ item }) => (
        <Pressable onPress={() => toggleExpand(item.id)} style={styles.card}>
            <Pressable
                onPress={() => {
                    setModalImage(item.Code);
                    setModalVisible(true);
                }}
            >
                <Image
                    source={getImageForCode(item.Code)}
                    style={styles.image}
                    resizeMode="contain"
                />
            </Pressable>
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.title}>{item.Name}</Text>
                {renderField('🔢 Code:', item.Code)}
                {expandedId === item.id && (
                    <>
                        {renderField('🏷️ Category:', item.Category)}
                        {renderField('💷 Pallet Price:', item['Pallet Price'])}
                        {renderField('💸 CNT Price:', item['CNT Price'])}
                        {renderField('📦 Case Size:', item['Case Size'])}
                        {renderField('📄 PLY:', item.PLY)}
                        {renderField('📏 Perf Length:', item['Perf Length (mm)'], ' mm')}
                        {renderField('↔️ Roll Width:', item['Roll Width (mm)'], ' mm')}
                        {renderField('🧻 Sheets:', item['Number of Sheets'])}
                        {renderField('🔘 Roll Diameter:', item['Roll Diameter (mm)'], ' mm')}
                        {renderField('⚖️ GSM:', item.GSM)}
                        {renderField('🏋️ Roll Weight:', item['Roll Weight (g)'], ' g')}
                        {renderField('🧱 Core Weight:', item['Core Weight (g)'], ' g')}
                        {renderField('🎨 Color:', item.Color)}
                        {renderField('🌸 Fragrance:', item.Fragrance)}
                        {renderField('📦 Pallet Count:', item['Pallet Count'])}
                    </>
                )}
            </View>
        </Pressable>
    ), [expandedId]);

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>📦 Packages</Text>

            <View style={styles.filterHeader}>
                <TextInput
                    placeholder="Search by name or code..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchInput}
                    placeholderTextColor="#888"
                />

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                    <Pressable
                        style={[styles.categoryButton, !selectedCategory && styles.selectedCategory]}
                        onPress={() => {
                            setSelectedCategory(null)
                            setExpandedId(null)
                        }}
                    >
                        <Text style={styles.categoryText}>All</Text>
                    </Pressable>
                    {filteredCategories.map(cat => (
                        <Pressable
                            key={cat}
                            style={[
                                styles.categoryButton,
                                selectedCategory === cat && styles.selectedCategory,
                            ]}
                            onPress={() => {
                                setSelectedCategory(cat)
                                setExpandedId(null)
                            }}
                        >
                            <Text style={styles.categoryText}>{cat}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                ListHeaderComponent={<View style={{ height: 0 }} />}
                data={filteredData}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 16 }}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
            />

            <Modal visible={modalVisible} transparent animationType="fade">
                <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <Image
                            source={getImageForCode(modalImage)}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="contain"
                        />
                    </View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingHorizontal: 16,
        paddingTop: 16,
        marginBottom: 8,
    },
    searchInput: {
        height: 36,
        paddingHorizontal: 12,
        backgroundColor: '#f1f1f1',
        borderRadius: 8,
        fontSize: 14,
        color: '#000',
        marginBottom: 8,
    },
    filterHeader: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 4,
        backgroundColor: '#fff',
        zIndex: 1,
    },
    categoryScroll: {
        height: 36,
    },
    categoryButton: {
        height: 32,
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        marginRight: 8,
        backgroundColor: '#eee',
    },
    selectedCategory: {
        backgroundColor: 'tomato',
    },
    categoryText: {
        color: '#000',
        fontSize: 13,
        fontWeight: '500',
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 6,
        backgroundColor: '#eee',
        alignSelf: 'flex-start',
    },
    title: { fontSize: 16, fontWeight: 'bold' },
    text: { fontSize: 13, marginBottom: 2, color: '#333' },
    label: { fontWeight: 'bold' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        height: '70%',
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
    },
});
