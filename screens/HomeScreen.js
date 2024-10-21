import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useCallback, useEffect, useState, useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { MagnifyingGlassIcon, XMarkIcon } from "react-native-heroicons/outline";
import { CalendarDaysIcon, MapPinIcon } from "react-native-heroicons/solid";
import { debounce } from "lodash";
import { theme } from "../theme";
import { fetchLocations, fetchWeatherForecast } from "../api/weather";
import * as Progress from "react-native-progress";
import { StatusBar } from "expo-status-bar";
import { getData, storeData } from "../utils/asyncStorage";
import { TemperatureContext } from "../context/TemperatureContext";

export default function HomeScreen() {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState({});
  const [showSunrise, setShowSunrise] = useState(true);
  const [showMenu, setShowMenu] = useState(false); // Hiển thị menu cài đặt
  const [isSearchActive, setIsSearchActive] = useState(false);
  const { isCelsius, toggleTemperatureUnit } = useContext(TemperatureContext);
  const { setCityName } = useContext(TemperatureContext); // Lấy hàm setCityName từ context
  
  // Hàm tìm kiếm thành phố
  const handleSearch = (search) => {
    if (search && search.length > 2) {
        setIsSearchActive(true);  // Kích hoạt chế độ tìm kiếm
        fetchLocations({ cityName: search }).then((data) => {
            setLocations(data);
        });
    }
};

  const handleLocation = (loc) => {
    setLoading(true);
    toggleSearch(false);
    setIsSearchActive(false);
    setLocations([]);
    fetchWeatherForecast({
        cityName: loc.name,
        days: "7",
    }).then((data) => {
        setLoading(false);
        setWeather(data);
        storeData("city", loc.name);
        setCityName(loc.name); // Cập nhật tên thành phố trong context
    });
  };

  


  // Tải dữ liệu thời tiết mặc định khi khởi động
  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    let myCity = await getData("city");
    let cityName = "Tan Phuoc Khanh"; // Thành phố mặc định
    if (myCity) {
      cityName = myCity;
    }
    fetchWeatherForecast({
      cityName,
      days: "8",
    }).then((data) => {
      setWeather(data);
      setLoading(false);
    });
  };

  // Chuyển đổi giữa sunrise và sunset
  useEffect(() => {
    const interval = setInterval(() => {
      setShowSunrise((prev) => !prev); // Thay đổi giữa sunrise và sunset
    }, 10000); // 10000 ms = 10 giây

    // Cleanup interval khi component bị unmount
    return () => clearInterval(interval);
  }, []);


  // Tối ưu hóa hàm tìm kiếm bằng cách sử dụng debounce
  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const { location, current } = weather;

  return (
    <View className="relative flex-1">
      <StatusBar style="light" />
      <Image
        blurRadius={10}
        source={require("../assets/images/mountain.jpg")}
        className="absolute h-full w-full"
      />
      <View className="absolute top-10 left-4 z-50" style={{ top: 115 }}>
        {/* Kiểm tra nếu không phải trong chế độ tìm kiếm thì mới hiển thị nút cài đặt */}
        {!showSearch && (
          <>
            <TouchableOpacity
              onPress={() => setShowMenu(!showMenu)} // Hiển thị menu khi ấn nút
              className="p-2 rounded-full"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
            >
              <Image source={require("../assets/icons/settings.png")} className="h-6 w-6" />
            </TouchableOpacity>

            {/* Menu hiện ra khi ấn nút cài đặt */}
            {showMenu && (
              <View className="absolute top-12 left-0 z-50 bg-white p-4 rounded-md shadow-md"
                style={{
                  padding: 10, // Thêm khoảng cách nội dung
                  width: 180,  // Điều chỉnh chiều rộng phù hợp hơn
                }}
              >
                <TouchableOpacity onPress={toggleTemperatureUnit}>
                  <Text className="text-base text-black">
                    {isCelsius ? "Switch to °F" : "Switch to °C"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Progress.Bar indeterminate size={250} color="#0bb3b2" />
          <Text className='text-xl font-bold text-white mt-4 text-center'>Fetching data...</Text>
        </View>
      ) : (
        <SafeAreaView className="flex flex-1">
          {/* Section tìm kiếm */}
          <View style={{ height: "7%" }} className="relative z-50 mx-4 mt-9">
            <View
              className="flex-row items-center justify-end rounded-full mt-5"
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
                  showSearch ? "rounded-full" : "rounded-full"
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
                  let showBorder = index + 1 !== locations.length;
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

          {/* Chỉ hiển thị Weather Details và Daily Forecast nếu không trong chế độ tìm kiếm */}
          {!showSearch && (
            <>
              {/* Section dự báo thời tiết */}
              <View className="mx-4 mb-12 flex flex-1 justify-around">
                {/* Địa điểm */}
                <Text className="text-center text-2xl font-bold text-white">
                  {location?.name}, {""}
                  <Text className="text-lg font-semibold text-gray-300">
                    {location?.country}
                  </Text>
                </Text>
                <Text className="text-center text-lg text-white font-semibold">
                  {weather?.location?.localtime} | {weather?.location?.tz_id}
                </Text>
                {/* Biểu tượng thời tiết */}
                <View className="flex-row justify-center">
                  <Image
                    source={{ uri: `https:${current?.condition?.icon}` }} // Sử dụng URL biểu tượng từ API
                    className="h-52 w-52"
                  />
                </View>
                {/* Độ nhiệt độ */}
                <View className="space-y-2 mb-10">
                  <Text className="ml-5 text-center text-6xl font-bold text-white">
                    {isCelsius ? `${current?.temp_c}°` : `${current?.temp_f}°`}
                  </Text>
                  <Text className="text-center text-xl tracking-widest text-white">
                    {current?.condition?.text}
                  </Text>
                  <Text className="text-center text-lg text-gray-300 mt-2 font-semibold">
                    Feels like: {isCelsius ? `${current?.feelslike_c}°` : `${current?.feelslike_f}°`}
                  </Text>
                </View>
                {/* Các thông số khác */}
                <View className="mx-4 flex-row justify-between">
                  <View className="flex-row items-center space-x-2">
                    <Image source={require("../assets/icons/wind.png")} className="h-6 w-6" />
                    <Text className="text-base font-semibold text-white">
                      {current?.wind_kph}km/h
                    </Text>
                  </View>

                  <View className="flex-row items-center space-x-2">
                    <Image source={require("../assets/icons/drop.png")} className="h-6 w-6" />
                    <Text className="text-base font-semibold text-white">
                      {current?.humidity}%
                    </Text>
                  </View>

                  {/* Section Sunrise/Sunset */}
                  <View className="flex-row items-center space-x-2">
                    <Image
                      source={
                        showSunrise
                          ? require("../assets/icons/sunrise.png") // Biểu tượng sunrise
                          : require("../assets/icons/sunset.png")  // Biểu tượng sunset
                      }
                      className="h-6 w-6"
                    />
                    <Text className="text-base font-semibold text-white">
                      {showSunrise
                        ? weather?.forecast?.forecastday[0]?.astro?.sunrise // Hiển thị sunrise nếu showSunrise là true
                        : weather?.forecast?.forecastday[0]?.astro?.sunset  // Hiển thị sunset nếu showSunrise là false
                      }
                    </Text>
                  </View>
                </View>
                <View className="mx-4 flex-row justify-between">
                  <View className="flex-row items-center space-x-2">
                    <Image
                      source={require("../assets/icons/uv.png")}  // Icon for UV index
                      className="h-6 w-6"
                    />
                    <Text className="text-base font-semibold text-white">
                      UV {current?.uv}
                    </Text>
                  </View>
                  <View className="flex-row items-center space-x-2">
                    <Image
                      source={require("../assets/icons/cloud.png")}  // Icon for cloud coverage
                      className="h-6 w-6"
                    />
                    <Text className="text-base font-semibold text-white">
                      {current?.cloud}%
                    </Text>
                  </View>
                  <View className="flex-row items-center space-x-2">
                    <Image
                      source={require("../assets/icons/visibility.png")}  // Icon for visibility
                      className="h-6 w-6"
                    />
                    <Text className="text-base font-semibold text-white">
                      {current?.vis_km}km
                    </Text>
                  </View>
                </View>
              </View>

              {/* Dự báo cho những ngày tiếp theo */}
              <View className="mb-2 space-y-3">
                <View className="mx-5 flex-row items-center space-x-2">
                <Text className="text-base font-extrabold text-white">
                    Air Quality Index: 
                    <Text style={{
                      color: weather?.current?.air_quality?.["us-epa-index"] === 1 ? "green" :
                            weather?.current?.air_quality?.["us-epa-index"] === 2 ? "yellow" :
                            weather?.current?.air_quality?.["us-epa-index"] === 3 ? "orange" :
                            weather?.current?.air_quality?.["us-epa-index"] === 4 ? "red" :
                            weather?.current?.air_quality?.["us-epa-index"] === 5 ? "purple" :
                            weather?.current?.air_quality?.["us-epa-index"] === 6 ? "maroon" : "gray"
                    }}>
                      {weather?.current?.air_quality?.["us-epa-index"] === 1 ? " Good" :
                      weather?.current?.air_quality?.["us-epa-index"] === 2 ? " Moderate" :
                      weather?.current?.air_quality?.["us-epa-index"] === 3 ? " Unhealthy for Sensitive Groups" :
                      weather?.current?.air_quality?.["us-epa-index"] === 4 ? " Unhealthy" :
                      weather?.current?.air_quality?.["us-epa-index"] === 5 ? " Very Unhealthy" :
                      weather?.current?.air_quality?.["us-epa-index"] === 6 ? " Hazardous" : " Unknown"}
                    </Text>
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  contentContainerStyle={{ paddingHorizontal: 15 }}
                  showsHorizontalScrollIndicator={false}
                >
                  <View
                    className="mr-4 flex w-28 items-center justify-center space-y-1 rounded-lg py-3"
                    style={{ backgroundColor: theme.bgWhite(0.15) }}
                  >
                    <Text className="text-white font-bold">CO</Text>
                    <Text className="text-white">{weather?.current?.air_quality?.co} μg/m³</Text>
                  </View>
                  <View
                    className="mr-4 flex w-28 items-center justify-center space-y-1 rounded-lg py-3"
                    style={{ backgroundColor: theme.bgWhite(0.15) }}
                  >
                    <Text className="text-white font-bold">NO₂</Text>
                    <Text className="text-white">{weather?.current?.air_quality?.no2} μg/m³</Text>
                  </View>
                  <View
                    className="mr-4 flex w-28 items-center justify-center space-y-1 rounded-lg py-3"
                    style={{ backgroundColor: theme.bgWhite(0.15) }}
                  >
                    <Text className="text-white font-bold">O₃</Text>
                    <Text className="text-white">{weather?.current?.air_quality?.o3} μg/m³</Text>
                  </View>
                  <View
                    className="mr-4 flex w-28 items-center justify-center space-y-1 rounded-lg py-3"
                    style={{ backgroundColor: theme.bgWhite(0.15) }}
                  >
                    <Text className="text-white font-bold">SO₂</Text>
                    <Text className="text-white">{weather?.current?.air_quality?.so2} μg/m³</Text>
                  </View>
                  <View
                    className="mr-4 flex w-28 items-center justify-center space-y-1 rounded-lg py-3"
                    style={{ backgroundColor: theme.bgWhite(0.15) }}
                  >
                    <Text className="text-white font-bold">PM2.5</Text>
                    <Text className="text-white">{weather?.current?.air_quality?.pm2_5} μg/m³</Text>
                  </View>
                  <View
                    className="mr-4 flex w-28 items-center justify-center space-y-1 rounded-lg py-3"
                    style={{ backgroundColor: theme.bgWhite(0.15) }}
                  >
                    <Text className="text-white font-bold">PM10</Text>
                    <Text className="text-white">{weather?.current?.air_quality?.pm10} μg/m³</Text>
                  </View>
                </ScrollView>
              </View>
            </>
          )}
        </SafeAreaView>
      )}
    </View>
  );
}
