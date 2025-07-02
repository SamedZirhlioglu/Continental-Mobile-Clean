import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { imageMap } from '../scripts/imageMap'

export default function PackagesScreen() {
    const [packages, setPackages] = useState([]);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'packages'));
                const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPackages(list);
            } catch (err) {
                console.log('❌ Error fetching packages:', err);
            }
        };

        fetchPackages();
    }, []);

    const getImageForCode = (code) => {
        return imageMap[code] || require('../assets/placeholder.png');
    };

    const renderField = (label, value, unit = '') => {
        const hasValue = value !== undefined && value !== null && value !== '';

        return (
            <Text style={styles.text}>
                <Text style={{ fontWeight: 'bold' }}>{label}</Text>
                {hasValue ? ` ${value}${unit}` : ''}
            </Text>
        );
    };


    const renderItem = ({ item }) => {
        return (
            <View style={styles.card}>
                <Image
                    source={getImageForCode(item.Code)}
                    style={styles.image}
                    resizeMode="contain"
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.title}>📦 {item.Name}</Text>
                    {renderField('🔢 Code:', item.Code)}
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
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.screenTitle}>📦 Packages</Text>
            <FlatList
                data={packages}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 16 }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    screenTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingHorizontal: 16,
        paddingTop: 16,
        marginBottom: 20,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#f1f1f1',
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
        alignItems: 'flex-start', // ⬅️ Fotoğrafı üstte hizala
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 6,
        marginTop: 12,
        backgroundColor: '#eee',
        alignSelf: 'flex-start', // ⬅️ Resmi yukarı sabitle
    },
    title: { fontSize: 16, fontWeight: 'bold' },
    text: {
        fontSize: 13,
        color: '#444',
        marginBottom: 2,
    },
});
