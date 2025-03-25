import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase, executeGraphQL } from '../config/supabase';

const ProfilePic = ({ userUuid, initialUrl }) => {
    const [userId, setUserId] = useState(null);
    const [profileImage, setProfileImage] = useState(initialUrl);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userUuid) {
            console.error("User UUID is missing.");
            return;
        }
        fetchUserId();
    }, [userUuid]);

    const fetchUserId = async () => {
        const query = `
            query getUserId($uuid: uuid!) {
                usersCollection(filter: { uuid: { eq: $uuid } }) {
                    edges {
                        node {
                            id
                        }
                    }
                }
            }
        `;

        const variables = { uuid: userUuid };

        try {
            const response = await executeGraphQL(query, variables);
            if (response?.usersCollection?.edges?.length > 0) {
                const fetchedId = response.usersCollection.edges[0].node.id;
                setUserId(fetchedId);
                fetchProfileImage(fetchedId);
            } else {
                console.error("User not found in database.");
            }
        } catch (error) {
            console.error("Error fetching user ID:", error);
        }
    };

    const fetchProfileImage = async (id) => {
        try {
            const { data } = supabase.storage
                .from('profile-pictures')
                .getPublicUrl(`users/${id}/profile_image.jpg`);

            if (data.publicUrl) {
                setProfileImage(data.publicUrl);
            }
        } catch (error) {
            console.error('Error fetching image:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectImage = async () => {
        if (!userId) {
            alert("Error: User ID is missing.");
            return;
        }

        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission to access the photo library is required.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.7,
            });

            if (!result.canceled) {
                uploadProfileImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error("Error launching image picker:", error);
        }
    };

    const uploadProfileImage = async (imageUri) => {
        setUploading(true);

        if (!userId) {
            alert("Error: User ID is missing.");
            setUploading(false);
            return;
        }

        const filePath = `users/${userId}/profile_image.jpg`;

        try {
            const file = {
                uri: imageUri,
                name: `profile_image_${userId}.jpg`,
                type: "image/jpeg",
            };

            const { data, error } = await supabase.storage
                .from("profile-pictures")
                .upload(filePath, file, {
                    contentType: "image/jpeg",
                    cacheControl: "3600",
                    upsert: true,
                });

            if (error) {
                alert(`Error uploading image: ${error.message}`);
                throw error;
            }

            const timestamp = new Date().getTime();
            const uploadedImageUrl = `https://feejgyyljwdewzeyuetb.supabase.co/storage/v1/object/public/profile-pictures/${filePath}?t=${timestamp}`;
            setProfileImage(uploadedImageUrl);

            const query = `
                mutation updateUserProfile($id: Int!, $profile_picture_url: String!) {
                    updateusersCollection(
                        filter: { id: { eq: $id } }
                        set: { profile_picture_url: $profile_picture_url }
                    ) {
                        affectedCount
                    }
                }
            `;

            const variables = { id: userId, profile_picture_url: uploadedImageUrl };
            const responseGraphQL = await executeGraphQL(query, variables);

            if (responseGraphQL.errors) {
                throw new Error("GraphQL update failed");
            }
        } catch (error) {
            alert("Failed to upload the image. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" />
            ) : (
                <TouchableOpacity onPress={selectImage}>
                    {profileImage ? (
                        <Image source={{ uri: profileImage }} style={styles.image} />
                    ) : (
                        <View style={styles.placeholder}>
                            <Text style={styles.placeholderText}>Select Image</Text>
                        </View>
                    )}
                </TouchableOpacity>
            )}
            {uploading && <Text style={styles.uploadingText}>Uploading...</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', marginVertical: 20 },
    image: { width: 150, height: 150, borderRadius: 75 },
    placeholder: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: { color: '#666' },
    uploadingText: { marginTop: 10, fontSize: 14, color: 'blue' },
});

export default ProfilePic;
