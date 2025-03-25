import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { executeGraphQL } from "../config/supabase";

const HomeScreen = ({ route }) => {
  const { userId } = route.params;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const query = `
      query getUser($uuid: uuid!) {
        usersCollection(filter: { uuid: { eq: $uuid } }) {
          edges {
            node {
              name
              birthday
            }
          }
        }
      }
    `;

    const variables = { uuid: userId };

    const response = await executeGraphQL(query, variables);
    console.log("GraphQL Response:", response);

    if (response?.usersCollection?.edges?.length > 0) {
      setUserData(response.usersCollection.edges[0].node);
    } else {
      console.error("User data not found.");
    }

    console.log("Route Params:", route.params);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {userData?.name}!</Text>
      <Text style={styles.subtitle}>
        Birthday: {userData?.birthday || "Not provided"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: { fontSize: 18, textAlign: "center", color: "gray" },
});

export default HomeScreen;
