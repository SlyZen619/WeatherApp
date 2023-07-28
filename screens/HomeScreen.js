import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { MagnifyingGlassIcon, XMarkIcon } from "react-native-heroicons/outline";
import { CalendarDaysIcon, MapPinIcon } from "react-native-heroicons/solid";
import { debounce } from "lodash";
import { theme } from "../theme";
import { fetchLocations, fetchWeatherForecast } from "../api/weather";
import * as Progress from "react-native-progress";
import { StatusBar } from "expo-status-bar";
import { weatherImages } from "../constants";
import { getData, storeData } from "../utils/asyncStorage";

export default function HomeScreen() {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState({});

  const handleSearch = (search) => {
    if (search && search.length > 2)
      fetchLocations({ cityName: search }).then((data) => {
        setLocations(data);
      });
  };

  const handleLocation = (loc) => {
    setLoading(true);
    toggleSearch(false);
    setLocations([]);
    fetchWeatherForecast({
      cityName: loc.name,
      days: "7",
    }).then((data) => {
      setLoading(false);
      setWeather(data);
      storeData("city", loc.name);
    });
  };

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    let myCity = await getData("city");
    let cityName = "lagos";
    if (myCity) {
      cityName = myCity;
    }
    fetchWeatherForecast({
      cityName,
      days: "7",
    }).then((data) => {
      setWeather(data);
      setLoading(false);
    });
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const { location, current } = weather;

  return (
    <View className="relative flex-1">
      <StatusBar style="light" />
      <Image
        blurRadius={60}
        source={require("../assets/images/bg.png")}
        className="absolute h-full w-full"
      />
      {loading ? (
        <View className="flex-1 flex-row items-center justify-center">
          <Progress.CircleSnail thickness={10} size={140} color="#9A4F99" />
        </View>
      ) : (
        <SafeAreaView className="flex flex-1">
          {/* search section */}
          <View style={{ height: "7%" }} className="relative z-50 mx-4">
            <View
              className="flex-row items-center justify-end rounded-lg"
              style={{
                backgroundColor: showSearch
                  ? theme.bgWhite(0.2)
                  : "transparent",
              }}
            >
              {showSearch ? (
                <TextInput
                  onChangeText={handleTextDebounce}
                  placeholder="Search for any city"
                  placeholderTextColor={"lightgray"}
                  className="h-10 flex-1 pb-1 pl-6 text-base text-white"
                />
              ) : null}
              <TouchableOpacity
                onPress={() => toggleSearch(!showSearch)}
                className={`${
                  showSearch ? "rounded-lg" : "rounded-full"
                } m-1 p-3`}
                style={{ backgroundColor: theme.bgWhite(0.3) }}
              >
                {showSearch ? (
                  <XMarkIcon size="25" color="white" />
                ) : (
                  <MagnifyingGlassIcon size="25" color="white" />
                )}
              </TouchableOpacity>
            </View>
            {locations.length > 0 && showSearch ? (
              <View className="absolute top-16 w-full rounded-lg bg-gray-300 ">
                {locations.map((loc, index) => {
                  let showBorder = index + 1 != locations.length;
                  let borderClass = showBorder
                    ? " border-b-2 border-b-gray-400"
                    : "";
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleLocation(loc)}
                      className={
                        "mb-1 flex-row items-center border-0 p-3 px-4 " +
                        borderClass
                      }
                    >
                      <MapPinIcon size="20" color="gray" />
                      <Text className="ml-2 text-lg text-black">
                        {loc?.name}, {loc?.country}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>

          {/* forecast section */}
          <View className="mx-4 mb-2 flex flex-1 justify-around">
            {/* location */}
            <Text className="text-center text-2xl font-bold text-white">
              {location?.name}, {""}
              <Text className="text-lg font-semibold text-gray-300">
                {location?.country}
              </Text>
            </Text>
            {/* weather icon */}
            <View className="flex-row justify-center">
              <Image
                source={weatherImages[current?.condition?.text || "other"]}
                className="h-52 w-52"
              />
            </View>
            {/* degree celcius */}
            <View className="space-y-2">
              <Text className="ml-5 text-center text-6xl font-bold text-white">
                {current?.temp_c}&#176;
              </Text>
              <Text className="text-center text-xl tracking-widest text-white">
                {current?.condition?.text}
              </Text>
            </View>

            {/* other stats */}
            <View className="mx-4 flex-row justify-between">
              <View className="flex-row items-center space-x-2">
                <Image
                  source={require("../assets/icons/wind.png")}
                  className="h-6 w-6"
                />
                <Text className="text-base font-semibold text-white">
                  {current?.wind_kph}km
                </Text>
              </View>
              <View className="flex-row items-center space-x-2">
                <Image
                  source={require("../assets/icons/drop.png")}
                  className="h-6 w-6"
                />
                <Text className="text-base font-semibold text-white">
                  {current?.humidity}%
                </Text>
              </View>
              <View className="flex-row items-center space-x-2">
                <Image
                  source={require("../assets/icons/sun.png")}
                  className="h-6 w-6"
                />
                <Text className="text-base font-semibold text-white">
                  {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                </Text>
              </View>
            </View>
          </View>

          {/* forecast for next days */}
          <View className="mb-2 space-y-3">
            <View className="mx-5 flex-row items-center space-x-2">
              <CalendarDaysIcon size="22" color="white" />
              <Text className="text-base text-white">Daily forecast</Text>
            </View>
            <ScrollView
              horizontal
              contentContainerStyle={{ paddingHorizontal: 15 }}
              showsHorizontalScrollIndicator={false}
            >
              {weather?.forecast?.forecastday?.map((item, index) => {
                const date = new Date(item.date);
                const options = { weekday: "long" };
                let dayName = date.toLocaleDateString("en-US", options);
                dayName = dayName.split(",")[0];

                return (
                  <View
                    key={index}
                    className="mr-4 flex w-28 items-center justify-center space-y-1 rounded-lg py-3"
                    style={{ backgroundColor: theme.bgWhite(0.15) }}
                  >
                    <Image
                      source={
                        weatherImages[item?.day?.condition?.text || "other"]
                      }
                      className="h-11 w-14"
                    />
                    <Text className="text-white">{dayName}</Text>
                    <Text className="text-xl font-semibold text-white">
                      {item?.day?.avgtemp_c}&#176;
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}
