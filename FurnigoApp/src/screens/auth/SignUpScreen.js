import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase, executeGraphQL } from '../../config/supabase';

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthday, setBirthday] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSignUp = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            birthday: birthday ? birthday.toISOString().split('T')[0] : null,
          },
        },
      });

      if (error) {
        console.error('Sign Up Error:', error);
        Alert.alert('Sign Up Failed', error.message);
        return;
      }

      const user = data.user;
      if (!user) {
        Alert.alert('Sign Up Error', 'User creation failed.');
        return;
      }

  const query = `
  mutation insertIntousersCollection($uuid: uuid!, $email: String!, $name: String!, $birthday: date) {
    insertIntousersCollection(objects: {
      uuid: $uuid,
      email: $email,
      name: $name,
      birthday: $birthday
    }) {
      affectedCount
    }
  }
`;

const variables = {
  uuid: user.id,
  email: user.email,
  name: name,
  birthday: birthday ? birthday.toISOString().split('T')[0] : null,
      };

      const response = await executeGraphQL(query, variables);
    console.log("GraphQL Response:", response);

      if (response.error) {
        console.error('GraphQL Error:', response.error);
        Alert.alert('Error', 'Failed to insert user in public.users');
        return;
      }

      Alert.alert('Success', 'Account created! Check your email for verification.');
      navigation.navigate('Login');
    } catch (err) {
      console.error('Unexpected Error:', err);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput placeholder="Full Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
        <Text>{birthday ? birthday.toDateString() : "Select Birthday"}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={birthday || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setBirthday(selectedDate);
          }}
        />
      )}

      <TouchableOpacity onPress={handleSignUp} style={styles.button}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 5, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  link: { color: '#007AFF', textAlign: 'center', marginTop: 10 },
});

export default SignUpScreen;
