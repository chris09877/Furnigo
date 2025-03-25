
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer, CommonActions } from "@react-navigation/native";
import { supabase } from "../config/supabase";
import LoginScreen from "../screens/auth/LoginScreen";
import SignUpScreen from "../screens/auth/SignUpScreen";
import ProfileScreen from "../screens/ProfileScreen";
import PostsScreen from "../screens/posts/PostsScreen";
import PostDetailScreen from "../screens/posts/PostDetailScreen";
import CreatePostScreen from "../screens/posts/create/CreatePostScreen";
import HomeScreen from "../screens/HomeScreen";
import { Ionicons } from "react-native-vector-icons";
import UpdateProfileScreen from '../screens/UpdateProfileScreen';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
// const AppStack = createStackNavigator();

// 🔹 Posts Stack (Handles both PostsScreen & CreatePostScreen)
const PostsStack = ({ route }) => {
  const userId = route.params?.userId;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="PostsMain"
        component={PostsScreen}
        initialParams={{ userId }}
      />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        initialParams={{ userId }}
      />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
    </Stack.Navigator>
  );
};


const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
  </Stack.Navigator>
);


const MainTabs = ({ route }) => {
  const userId = route.params?.userId || null;

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        initialParams={{ userId }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Posts"
        component={PostsStack}
        initialParams={{ userId }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        initialParams={{ userId }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};


const RootStack = () => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("CHECK SESSION:", session);
      setSession(session);
      setLoading(false);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth Event:", event, session);
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session && session.user ? (

        <>
          <Stack.Screen name="MainTabs" component={MainTabs} initialParams={{ userId: session.user.id }} />
          {/* <Stack.Screen name="App" component={AppStackScreen}/> */}
          <Stack.Screen name="Update Profile" component={UpdateProfileScreen} initialParams={{ userId: session.user.id }}/>

        </>


      ) : (
        <>
          <Stack.Screen name="AuthStack" component={AuthStack} />

          </>
      )}
    </Stack.Navigator>
  );
};

// 🔹 Navigation Container
const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Root" component={RootStack} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;