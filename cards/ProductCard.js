import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Pressable,
} from 'react-native';

export default function ProductCard({ item }) {
    const [imageError, setImageError] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const imageUrl = `https://continentalwholesale.co.uk/images/products/${item.Code}.jpg`;

    return (
        <>
            <Pressable onPress={() => setModalVisible(true)}>
                <View style={styles.card}>
                    <Image
                        source={
                            imageError
                                ? require('../assets/placeholder.png')
                                : { uri: imageUrl }
                        }
                        style={styles.image}
                        onError={() => setImageError(true)}
                    />
                    <View style={styles.details}>
                        <Text style={styles.title}>{item.Description}</Text>
                        <Text style={styles.text}>
                            <Text style={styles.label}>Code:</Text> {item.Code}
                        </Text>
                        <Text style={styles.text}>
                            <Text style={styles.label}>Size:</Text> {item.Size}
                        </Text>
                        <Text style={styles.text}>
                            <Text style={styles.label}>Qty:</Text> {item.Qty}
                        </Text>
                        <Text style={styles.text}>
                            <Text style={styles.label}>Price:</Text> £{item["Price [C]"]}
                        </Text>
                    </View>
                </View>
            </Pressable>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <Image
                            source={
                                imageError
                                    ? require('../assets/placeholder.png')
                                    : { uri: imageUrl }
                            }
                            style={styles.modalImage}
                            resizeMode="contain"
                        />
                    </View>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
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
    text: { fontSize: 14, color: '#555', marginBottom: 2 },
    label: { fontWeight: 'bold', color: '#333' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        height: '70%',
        borderRadius: 12,
        overflow: 'hidden',
    },
    modalImage: {
        width: '100%',
        height: '100%',
    },
});
