import React, { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { executeGraphQL } from "../../../config/supabase";
import { createPost, uploadImages, updatePostImages, fetchLatestPostId, getUserIdFromUUID } from "../../../api/posts/create";

import styles from "./CreatePostStyles";
import { categories, conditions } from "../../../constants/postOptions";

const CreatePostScreen = ({ route }) => {
  const navigation = useNavigation();
  const { userId: userUuid } = route.params || {};
  const [imageUris, setImageUris] = useState([]);
const [loadingPost, setLoadingPost] = useState(false);
const [uploadingImages, setUploadingImages] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    ar_obj_id: null,
    pictures: [],
    status: "available",
    category: categories[0],
    condition: conditions[0], 
  });

  const selectImages = async () => {
    console.log("Image picker button clicked!");
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access photos is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUris([...imageUris, ...result.assets.map((asset) => asset.uri)]);
      console.log("Images Selected:", result.assets.map((asset) => asset.uri));
    }
  };

const handleSubmit = async () => {
    console.log("Starting post creation process...");
    
    if (!form.title || !form.description || !form.price || !form.location) {
        Toast.show({ type: "error", text1: "Missing Fields", text2: "Please fill in all required fields." });
        console.warn("Some required fields are missing. Aborting...");
        return;
    }

    try {
        setLoadingPost(true);
        setUploadingImages(true);

        console.log(`Fetching User ID for UUID: ${userUuid}...`);
        const userId = await getUserIdFromUUID(userUuid);

        if (!userId) {
            console.error("Failed to retrieve user ID. Aborting post creation.");
            Toast.show({ type: "error", text1: "Error", text2: "Failed to retrieve user ID." });
            return;
        }
        console.log(`User ID retrieved: ${userId}`);

        console.log("Creating post in GraphQL (without pictures)...");
        const newPostId = await createPost({
            user_id: userId,
            title: form.title,
            description: form.description,
            price: parseInt(form.price),
            location: form.location,
            pictures: [],
            category: form.category,
            condition: form.condition,
            status: "available",
            ar_obj_id: form.ar_obj_id || null,
        });

        if (!newPostId) {
            console.error("Post creation failed! No post ID returned.");
            Toast.show({ type: "error", text1: "Error", text2: "Post creation failed!" });
            return;
        }

        console.log(`Post created successfully with ID: ${newPostId}`);


        if (imageUris.length > 0) {
            console.log("Uploading images...");
            const uploadedImageUrls = await uploadImages(imageUris, userId, newPostId);
            
            if (!uploadedImageUrls.length) {
                console.warn("No images uploaded successfully.");
            } else {
                console.log("Uploaded Images:", uploadedImageUrls);
            }

            console.log("Updating post with uploaded image URLs...");
            const updateSuccess = await updatePostImages(newPostId, uploadedImageUrls);

            if (updateSuccess) {
                console.log("Post updated successfully with image URLs!");
            } else {
                console.error("Failed to update post with images.");
            }
        } else {
            console.warn("No images selected. Skipping upload.");
        }

        Toast.show({ type: "success", text1: "Success!", text2: "Post created successfully!" });
        navigation.navigate("PostsMain", { newPostCreated: true });

    } catch (error) {
        console.error("Error during post creation process:", error);
        Toast.show({ type: "error", text1: "Error", text2: "Failed to create post." });
    } finally {
        setLoadingPost(false);
        setUploadingImages(false);
    }
};

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <TextInput style={styles.input} placeholder="Title" onChangeText={(text) => setForm({ ...form, title: text })} />
        <TextInput style={styles.input} placeholder="Description" onChangeText={(text) => setForm({ ...form, description: text })} />
        <TextInput style={styles.input} placeholder="Price" keyboardType="numeric" onChangeText={(text) => setForm({ ...form, price: text })} />
        <TextInput style={styles.input} placeholder="Location" onChangeText={(text) => setForm({ ...form, location: text })} />

        <Text style={styles.label}>Category</Text>
        <Picker selectedValue={form.category} onValueChange={(value) => setForm({ ...form, category: value })} style={styles.picker}>
          {categories.map((category) => (
            <Picker.Item key={category} label={category} value={category} />
          ))}
        </Picker>

        <Text style={styles.label}>Condition</Text>
        <Picker selectedValue={form.condition} onValueChange={(value) => setForm({ ...form, condition: value })} style={styles.picker}>
          {conditions.map((condition) => (
            <Picker.Item key={condition} label={condition} value={condition} />
          ))}
        </Picker>

        <TouchableOpacity style={styles.imagePicker} onPress={selectImages}>
          <Text style={styles.imagePickerText}>Select Images</Text>
        </TouchableOpacity>

        {imageUris.length > 0 && (
          <View style={styles.imagePreviewContainer}>
            {imageUris.map((uri, index) => (
              <Image key={index} source={{ uri }} style={styles.imagePreview} />
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.createButton} onPress={handleSubmit}>
          <Text style={styles.createButtonText}>Create Post</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreatePostScreen;
