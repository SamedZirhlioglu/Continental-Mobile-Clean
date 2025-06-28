// screens/HomeScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
    const handleProductListPress = () => {
        navigation.navigate('ProductList');
    };

    const handleCustomerVisitingPress = () => {
        navigation.navigate('CustomerVisiting');
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.card} onPress={handleProductListPress}>
                <Ionicons name="pricetags-outline" size={30} color="tomato" style={styles.icon} />
                <Text style={styles.title}>Product List</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={handleCustomerVisitingPress}>
                <Ionicons name="people-outline" size={30} color="tomato" style={styles.icon} />
                <Text style={styles.title}>Customer Visiting</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    icon: {
        marginRight: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: '500',
    },
});
