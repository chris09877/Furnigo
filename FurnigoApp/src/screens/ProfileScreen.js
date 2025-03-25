import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { supabase, executeGraphQL } from '../config/supabase';
import ProfilePic from '../components/ProfilePic';
import {useNavigation} from '@react-navigation/native';
import { Directions } from 'react-native-gesture-handler';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';  
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';


const ProfileScreen = ({ route }) => {
  const { userId } = route.params;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);


  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();  
    }, [])
  );

const handleRefresh = async () => {
    console.log("Refreshing profile...");
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
};

  const fetchUserData = async () => {
    const query = `
      query getUser($uuid: uuid!) {
        usersCollection(filter: { uuid: { eq: $uuid } }) {
          edges {
            node {
              name
              email
              birthday
              profile_picture_url 
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

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "AuthStack" }],
      })
    );


  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

return (
<ScrollView
    contentContainerStyle={{ flexGrow: 1 }}
    refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
    }
>
  <View style={styles.container}>
    <View style={styles.profileSection}>
      <ProfilePic url={userData?.profile_image_url} userUuid={userId} />
      <Text style={styles.name}>{userData?.name}</Text>
      <Text style={styles.email}>{userData?.email}</Text>
    </View>

    <View style={styles.settingsGrid}>
       <View style={styles.gridRow}>
         <Text style={styles.settingText} onPress={() => navigation.navigate('Update Profile', { userId })}>Edit Profile</Text>
         <AntDesign name="right" style={styles.icon} onPress={() => navigation.navigate('Update Profile', { userId })}/>
       </View>
      <View style={styles.gridRow}>
        <Text style={styles.settingText}>Language</Text>
        <AntDesign name="right" style={styles.icon} />
      </View>
      <View style={styles.gridRow}>
        <Text style={styles.settingText}>Light Mode</Text>
        <AntDesign name="right" style={styles.icon} />
      </View>
      <View style={styles.gridRow}>
        <Text style={styles.settingText}>Notifications</Text>
        <AntDesign name="right" style={styles.icon} />
      </View>
      <View style={styles.gridRow}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutContainer}>
          <Text style={styles.settingText}>Logout</Text>
          <FontAwesome6 name="arrow-right-from-bracket" style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  </View>
</ScrollView>
);
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  settingsGrid: {
    flex: 1,
    justifyContent: 'center', 
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    
    paddingVertical: 10,
  },
  settingText: {
    fontSize: 16,
  },
  icon: {
    fontSize: 20,
    color: '#666',
  },
  logoutContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
  },
});


export default ProfileScreen;
