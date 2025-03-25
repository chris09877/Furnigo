import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase, executeGraphQL } from '../config/supabase';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const UpdateProfileScreen = ({ route, navigation }) => {
    const userId = route.params.userId;
    const [birthdate, setBirthdate] = useState(new Date());
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        getUserDetails();
    }, []);

    const getUserDetails = async () => {
        const query = `
        query getUser($uuid: uuid!) {
            usersCollection(filter: { uuid: { eq: $uuid } }) {
                edges {
                    node {
                        name
                        birthday
                        email
                    }
                }
            }
        }`;
        const variables = { uuid: userId };
        const response = await executeGraphQL(query, variables);
        if (response?.usersCollection?.edges?.length > 0) {
            const user = response.usersCollection.edges[0].node;
            setBirthdate(new Date(user.birthday) || new Date());
            setEmail(user.email || "");
            setName(user.name || "");
        } else {
            console.error("User data not found.");
        }
    };

    const handleSaveChanges = async () => {
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            if (email) {
                const { error: emailError } = await supabase.auth.updateUser({ email });
                if (emailError) throw emailError;
            }
            
            if (password) {
                const { error: passwordError } = await supabase.auth.updateUser({ password });
                if (passwordError) throw passwordError;
            }

            const mutation = `
            mutation updateUser($uuid: uuid!, $name: String, $birthday: timestamp, $email: String) {
                updateusersCollection(
                    filter: { uuid: { eq: $uuid } },
                    set: {
                        name: $name,
                        birthday: $birthday,
                        email: $email
                    }
                ) {
                    affectedCount
                }
            }`;
            const variables = {
                uuid: userId,
                name,
                birthday: birthdate.toISOString(),
                email
            };
            
            const response = await executeGraphQL(mutation, variables);
            if (response?.updateusersCollection?.affectedCount > 0) {
                alert("Profile updated successfully");
                navigation.goBack();
            } else {
                console.error("Update failed");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="arrow-left" size={40} color="black" />
            </TouchableOpacity>
            <Text style={styles.header}>Edit Profile</Text>

            <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
            
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                <Text>{birthdate.toDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker value={birthdate} mode="date" display="default" onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setBirthdate(selectedDate);
                }} />
            )}
            
            <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />
            <TextInput style={styles.input} placeholder="New Password" secureTextEntry value={password} onChangeText={setPassword} />
            <TextInput style={styles.input} placeholder="Confirm Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: 50,
        marginTop: 100,
        alignItems: 'center',
    },
    backButton: {
        marginLeft: '-95%',
        marginTop: '-5%',
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 30,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 25,
        padding: 10,
        marginBottom: 15,
        fontSize: 16,
        width: '100%',
    },
    saveButton: {
        backgroundColor: "#007BFF",
        borderRadius: 25,
        paddingVertical: 15,
        alignItems: "center",
        marginTop: 30,
        width: '100%'
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default UpdateProfileScreen;
