// screens/ProductListScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProductListScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Product list will be shown here.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    text: { fontSize: 18 },
});
