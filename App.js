import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { View, Image, StatusBar } from "react-native";
import HomeScreen from "./screens/HomeScreen";
import HourlyScreen from "./screens/HourlyScreen";
import { TemperatureProvider } from "./context/TemperatureContext";  // Import TemperatureProvider
import DailyScreen from "./screens/DailyScreen";

const Tab = createMaterialTopTabNavigator();

export default function AppNavigation() {
  return (
    <TemperatureProvider>
      <View style={{ flex: 1, position: "relative" }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <Image
          blurRadius={60}
          source={require("./assets/images/bg.png")}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, height: "100%", width: "100%" }}
        />
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              tabBarStyle: { backgroundColor: "transparent", position: "absolute", top: StatusBar.currentHeight, left: 0, right: 0, zIndex: 1, marginTop: -10},
              tabBarLabelStyle: { fontSize: 16, fontWeight: "bold", color: "white" },
              tabBarActiveTintColor: "blue",
              tabBarInactiveTintColor: "gray",
              tabBarIndicatorStyle: { backgroundColor: "blue" },
            }}
          >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Hourly" component={HourlyScreen} />
            <Tab.Screen name="Daily" component={DailyScreen} />


          </Tab.Navigator>
        </NavigationContainer>
      </View>
    </TemperatureProvider>
  );
}
