import React, { useCallback, useState, useEffect, useRef } from "react";
import {
  View,
  Button,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getPosts } from "../../api/posts/get";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import ConfettiCannon from "react-native-confetti-cannon";

const PostsScreen = ({ route }) => {
  const navigation = useNavigation();
  const userId = route.params?.userId;
  console.log("Received userId in PostsScreen:", userId);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      const fetchPosts = async () => {
        try {
          setLoading(true);
          const fetchedPosts = await getPosts();

          const updatedPosts = fetchedPosts.map((post) => ({
            ...post,
            imageUrl:
              Array.isArray(post.pictures) && post.pictures.length > 0
                ? post.pictures[0]
                : null,
          }));

          setPosts(updatedPosts);
        } catch (error) {
          console.error("Error fetching posts:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchPosts();

      // Show confetti animation if a new post was created
      if (route.params?.newPostCreated) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);

        navigation.setParams({ newPostCreated: false });
      }
    }, [route.params?.newPostCreated])
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Posts</Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Create New Post"
          onPress={() => navigation.navigate("CreatePost")}
        />
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.postItem}
            onPress={() => navigation.navigate("PostDetail", { post: item })}
          >
            {/* Display Image */}
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
            ) : (
              <View style={styles.noImageContainer}>
                <Text style={styles.noImageText}>No Image</Text>
              </View>
            )}

            <View style={styles.postContent}>
              <Text style={styles.postTitle}>{item.title}</Text>

              <View style={styles.postRow}>
                <MaterialIcons name="euro-symbol" size={18} color="#007AFF" />
                <Text style={styles.postPrice}>{item.price}</Text>
              </View>

              <View style={styles.postRow}>
                <MaterialIcons name="location-on" size={18} color="#555" />
                <Text style={styles.postText}>{item.location}</Text>
              </View>

              {item.status !== "available" && (
                <View style={styles.soldContainer}>
                  <MaterialIcons name="block" size={20} color="red" />
                  <Text style={styles.soldText}>Sold</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      />

      {showConfetti && <ConfettiCannon count={200} origin={{ x: 200, y: 0 }} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  buttonContainer: {
    marginBottom: 20,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  postItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
  postImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
  },
  noImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  noImageText: {
    color: "#666",
    fontSize: 14,
  },
  postContent: {
    flex: 1,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  postRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  postText: {
    fontSize: 16,
    marginLeft: 8,
  },
  postPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
    marginLeft: 8,
  },
  soldContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  soldText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "red",
    marginLeft: 5,
  },
});

export default PostsScreen;
