import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Carousel from "react-native-reanimated-carousel";
import { Image } from "react-native";

const { width: screenWidth } = Dimensions.get("window");

const PostDetailScreen = ({ route, navigation }) => {
  const { post } = route.params;

  const images = Array.isArray(post.pictures)
    ? post.pictures
    : JSON.parse(post.pictures || "[]");

  const handleContactSeller = () => {
    alert(`Contacting the seller of ${post.title}...`);
  };

  const handleARVisualization = () => {
    alert(`Launching AR visualization for ${post.title}...`);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.title}>{post.title}</Text>

      {/* Carousel for Multiple Images */}
      {images.length > 0 ? (
        <Carousel
          loop
          width={screenWidth}
          height={250}
          autoPlay={true}
          data={images}
          scrollAnimationDuration={1000}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.image} />
          )}
        />
      ) : (
        <Text style={styles.noImageText}>No images available</Text>
      )}

      <Text style={styles.description}>{post.description}</Text>
      <Text style={styles.price}>${post.price}</Text>
      <Text style={styles.location}>Location: {post.location}</Text>
      <Text>Status: {post.status}</Text>
      <Text>Category: {post.category}</Text>
      <Text>Condition: {post.condition}</Text>

      <TouchableOpacity
        style={[styles.button, styles.arButton]}
        onPress={handleARVisualization}
      >
        <Text style={styles.buttonText}>Use AR Visualization</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.contactButton]}
        onPress={handleContactSeller}
      >
        <Text style={styles.buttonText}>Contact Seller</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 40,
  },
  image: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
    borderRadius: 10,
  },
  noImageText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
  },
  location: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    width: "80%",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  arButton: {
    backgroundColor: "#007AFF",
  },
  contactButton: {
    backgroundColor: "#28A745",
  },
  buttonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
});

export default PostDetailScreen;
