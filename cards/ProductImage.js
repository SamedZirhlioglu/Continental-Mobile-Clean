import React, { useState } from 'react';
import { Image, View, StyleSheet } from 'react-native';

export default function ProductImage({ code }) {
    const [imageError, setImageError] = useState(false);

    const imageUrl = `https://continentalwholesale.co.uk/images/products/${code}.jpg`;

    return (
        <Image
            source={
                imageError
                    ? require('../assets/placeholder.png')
                    : { uri: imageUrl }
            }
            style={styles.image}
            onError={() => {
                setImageError(true);
            }}
        />
    );
}

const styles = StyleSheet.create({
    image: {
        width: 50,
        height: 50,
        borderRadius: 4,
        marginRight: 10,
        backgroundColor: '#eee',
    },
});
