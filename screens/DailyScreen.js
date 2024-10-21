import React, { useEffect, useState, useContext, useRef } from "react";
import { View, Text, Image, ScrollView, StatusBar, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TemperatureContext } from "../context/TemperatureContext"; 
import { fetchWeatherForecast } from "../api/weather"; 
import { getData } from "../utils/asyncStorage"; 

export default function DailyForecastScreen({ navigation }) {
  const { isCelsius } = useContext(TemperatureContext);
  const [loading, setLoading] = useState(true);
  const [dailyWeather, setDailyWeather] = useState([]);
  const [cityName, setCityName] = useState("");
  
  const previousCityRef = useRef("");

  const fetchWeatherData = async (city) => {
    setLoading(true);
    try {
      const data = await fetchWeatherForecast({ cityName: city, days: "8" });
      setDailyWeather(data?.forecast?.forecastday.slice(1) || []);
      setCityName(city);
    } catch (error) {
      console.log("Error fetching weather data: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const myCity = await getData("city");
      const cityToFetch = myCity || "lagos";

      if (previousCityRef.current !== cityToFetch) {
        previousCityRef.current = cityToFetch;
        fetchWeatherData(cityToFetch);
      } else {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const fetchData = async () => {
        const myCity = await getData("city");
        const cityToFetch = myCity || "lagos";

        if (previousCityRef.current !== cityToFetch) {
          previousCityRef.current = cityToFetch;
          fetchWeatherData(cityToFetch);
        }
      };

      fetchData();
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <Image
        blurRadius={10}
        source={require("../assets/images/mountain.jpg")}
        className="absolute h-full w-full"
      />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-xl font-bold text-white mt-4">Loading...</Text>
        </View>
      ) : (
        <SafeAreaView className="flex-1">
          <View className="mx-4 mt-5">
            <Text className="text-2xl font-bold text-white mt-10">
              Daily Forecast for {cityName}
            </Text>
          </View>
          <ScrollView>
            {dailyWeather.map((dayData, index) => {
              const date = new Date(dayData.date).toLocaleDateString();
              const event = dayData?.day?.alerts?.[0]?.event || "No alerts"; // Giả sử `alerts` chứa mảng cảnh báo
              return (
                <View
                  key={index}
                  className="mx-4 my-2 p-4 bg-gray-300 rounded-lg"
                >
                  <Text className="text-base text-black">{date}</Text>
                  <View className="flex-row items-center justify-between">
                    <Image
                      source={{ uri: `https:${dayData.day.condition.icon}` }}
                      className="h-10 w-10"
                    />
                    <Text className="text-base text-black">
                      {isCelsius ? `${dayData.day.avgtemp_c}°C` : `${dayData.day.avgtemp_f}°F`}
                    </Text>
                    <Text className="text-base text-black">{dayData.day.condition.text}</Text>
                  </View>
                  {/* Hiển thị cảnh báo trên một hàng riêng */}
                  <Text className="text-base text-red-500 mt-2">{event}</Text>
                </View>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      )}
    </View>
  );
}
