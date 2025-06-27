import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';

export default function ProfileScreen() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('Çıkış Hatası', error.message);
    }
  };

  const user = auth.currentUser;

  return (
    <View style={styles.container}>
      <Text style={styles.emailText}>
        {user ? user.email : 'Giriş yapılmamış'}
      </Text>
      <Button title="LOG OUT" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emailText: { fontSize: 18, marginBottom: 20, fontWeight: 'bold' },
});
