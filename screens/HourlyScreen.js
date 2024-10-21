import React, { useEffect, useState, useContext, useRef } from "react";
import { View, Text, Image, ScrollView, StatusBar, ActivityIndicator, Modal, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TemperatureContext } from "../context/TemperatureContext"; 
import { fetchWeatherForecast } from "../api/weather"; 
import { getData } from "../utils/asyncStorage"; 

export default function HourlyForecastScreen({ navigation }) {
  const { isCelsius } = useContext(TemperatureContext);
  const [loading, setLoading] = useState(true);
  const [hourlyWeather, setHourlyWeather] = useState([]);
  const [cityName, setCityName] = useState("");
  const [selectedHourData, setSelectedHourData] = useState(null); // Dữ liệu chi tiết giờ được chọn
  const [isModalVisible, setModalVisible] = useState(false); // Trạng thái hiển thị modal
  
  const previousCityRef = useRef("");

  const fetchWeatherData = async (city) => {
    setLoading(true); 
    try {
      const data = await fetchWeatherForecast({ cityName: city, days: "1" });
      setHourlyWeather(data?.forecast?.forecastday[0]?.hour || []);
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

  const handlePressHour = (hourData) => {
    setSelectedHourData(hourData); // Lưu dữ liệu của mốc giờ được chọn
    setModalVisible(true); // Hiển thị modal
  };

  const closeModal = () => {
    setModalVisible(false); // Đóng modal
    setSelectedHourData(null); // Xóa dữ liệu chi tiết
  };

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
              Hourly Forecast for {cityName}
            </Text>
          </View>
          <ScrollView>
            {hourlyWeather.map((hourData, index) => {
              const hour = new Date(hourData.time).getHours();
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handlePressHour(hourData)} // Khi nhấn vào giờ, mở modal
                  className="flex-row items-center justify-between mx-4 my-2 p-4 bg-gray-300 rounded-lg"
                >
                  <Text className="text-base text-black">{`${hour}:00`}</Text>
                  <Image
                    source={{ uri: `https:${hourData.condition.icon}` }}
                    className="h-10 w-10"
                  />
                  <Text className="text-base text-black">
                    {isCelsius ? `${hourData.temp_c}°C` : `${hourData.temp_f}°F`}
                  </Text>
                  <Text className="text-base text-black">{hourData.condition.text}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Modal hiển thị chi tiết */}
          {selectedHourData && (
            <Modal
            visible={isModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={closeModal}
          >
            <View className="flex-1 justify-center items-center">
              <View className="bg-[#f5f5f5] p-6 rounded-3xl w-4/5">
                <Text className="text-lg font-bold text-black mb-4">{`Details for ${new Date(selectedHourData.time).getHours()}:00`}</Text>
                
                {/* Weather icon, temperature, condition, and feels like */}
                <View className="flex-row items-center mb-4">
                  {/* Weather Icon */}
                  <Image
                    source={{ uri: `https:${selectedHourData.condition.icon}` }}
                    className="w-16 h-16"
                  />
          
                  {/* Temperature and Weather Condition */}
                  <View className="ml-4">
                    <Text className="text-3xl font-bold text-black">
                      {isCelsius ? `${selectedHourData.temp_c}°C` : `${selectedHourData.temp_f}°F`}
                    </Text>
                    <Text className="text-base text-black">
                      {selectedHourData.condition.text}
                    </Text>
                    <Text className="text-base text-gray-500">
                      Feels like: {isCelsius ? `${selectedHourData.feelslike_c}°C` : `${selectedHourData.feelslike_f}°F`}
                    </Text>
                  </View>
                </View>
          
                {/* Divider */}
                <View className="border-t border-gray-300 my-2" />
          
                {/* Wind Speed */}
                <Text className="text-base text-black">Wind Speed: {selectedHourData.wind_kph} km/h</Text>
          
                {/* Divider */}
                <View className="border-t border-gray-300 my-2" />
          
                {/* Humidity */}
                <Text className="text-base text-black">Humidity: {selectedHourData.humidity}%</Text>
          
                {/* Divider */}
                <View className="border-t border-gray-300 my-2" />
          
                {/* UV Index */}
                <Text className="text-base text-black">UV Index: {selectedHourData.uv}</Text>
          
                {/* Divider */}
                <View className="border-t border-gray-300 my-2" />
          
                {/* Cloud Coverage */}
                <Text className="text-base text-black">Cloud Coverage: {selectedHourData.cloud}%</Text>
          
                {/* Divider */}
                <View className="border-t border-gray-300 my-2" />
          
                {/* Visibility */}
                <Text className="text-base text-black">Visibility: {selectedHourData.vis_km} km</Text>
          
                {/* Divider */}
                <View className="border-t border-gray-300 my-2" />
          
                {/* Air Quality */}
                <Text className="text-base text-black">
                  Air Quality: 
                  <Text style={{
                    color: selectedHourData?.air_quality?.["us-epa-index"] === 1 ? "green" :
                          selectedHourData?.air_quality?.["us-epa-index"] === 2 ? "yellow" :
                          selectedHourData?.air_quality?.["us-epa-index"] === 3 ? "orange" :
                          selectedHourData?.air_quality?.["us-epa-index"] === 4 ? "red" :
                          selectedHourData?.air_quality?.["us-epa-index"] === 5 ? "purple" :
                          selectedHourData?.air_quality?.["us-epa-index"] === 6 ? "maroon" : "gray"
                  }}>
                    {selectedHourData?.air_quality?.["us-epa-index"] === 1 ? " Good" :
                    selectedHourData?.air_quality?.["us-epa-index"] === 2 ? " Moderate" :
                    selectedHourData?.air_quality?.["us-epa-index"] === 3 ? " Unhealthy for Sensitive Groups" :
                    selectedHourData?.air_quality?.["us-epa-index"] === 4 ? " Unhealthy" :
                    selectedHourData?.air_quality?.["us-epa-index"] === 5 ? " Very Unhealthy" :
                    selectedHourData?.air_quality?.["us-epa-index"] === 6 ? " Hazardous" : " Unknown"}
                  </Text>
                </Text>
          
                {/* Close Button */}
                <TouchableOpacity
                  onPress={closeModal}
                  className="mt-6 bg-blue-500 p-2 rounded-lg"
                >
                  <Text className="text-center text-white">Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          
          )}
        </SafeAreaView>
      )}
    </View>
  );
}
