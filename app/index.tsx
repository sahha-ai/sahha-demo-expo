import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  SafeAreaView,
} from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Sahha, {
  SahhaEnvironment,
  SahhaSensor,
  SahhaSensorStatus,
} from "sahha-react-native";

export default function App() {
  const [appId, setAppId] = useState<string>(""); // This value is in your Sahha dashboard
  const [appSecret, setAppSecret] = useState<string>(""); // This value is in your Sahha dashboard
  const [userId, setUserId] = useState<string>(""); // This value you must create (UUID)
  const [authStatus, setAuthStatus] = useState<boolean>(false);
  const [sensorStatus, setSensorStatus] = useState<SahhaSensorStatus>(
    SahhaSensorStatus.pending
  );

  var isDisabled =
    sensorStatus === SahhaSensorStatus.unavailable ||
    sensorStatus === SahhaSensorStatus.enabled;

  useEffect(() => {
    console.log("App Loaded");
    loadData();
    const settings = {
      environment: SahhaEnvironment.sandbox, // Required -  .sandbox for testing
    };
    Sahha.configure(settings, (error: string, success: boolean) => {
      console.log(`Sahha Configured: ${success}`);
      if (error) {
        console.error(`Error: ${error}`);
      } else {
        getAuthStatus();
        getSensorStatus();
      }
    });
  }, []);

  const loadData = async () => {
    try {
      const _appId = await AsyncStorage.getItem("appId");
      if (_appId !== null) {
        setAppId(_appId);
      }
      const _appSecret = await AsyncStorage.getItem("appSecret");
      if (_appSecret !== null) {
        setAppSecret(_appSecret);
      }
      const _userId = await AsyncStorage.getItem("userId");
      if (_userId !== null) {
        setUserId(_userId);
      }
    } catch (e) {
      // error reading value
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem("appId", appId);
      await AsyncStorage.setItem("appSecret", appSecret);
      await AsyncStorage.setItem("userId", userId);
    } catch (e) {
      // saving error
    }
  };

  const getAuthStatus = () => {
    console.log("Check Auth Status");
    Sahha.isAuthenticated((error: string, success: boolean) => {
      if (error) {
        console.error(`Error: ${error}`);
      } else if (success != null) {
        console.log(`Auth Status: ` + success);
        setAuthStatus(success);
      }
    });
  };

  const authenticate = () => {
    console.log("Authenticate");
    saveData();
    Sahha.authenticate(
      appId,
      appSecret,
      userId,
      (error: string, success: boolean) => {
        if (error) {
          console.error(`Error: ${error}`);
        } else if (success != null) {
          console.log(`Auth Status: ` + success);
          setAuthStatus(success);
        }
      }
    );
  };

  const getSensorStatus = () => {
    console.log("Sheck Sensor Status");
    Sahha.getSensorStatus(
      [SahhaSensor.steps, SahhaSensor.sleep, SahhaSensor.device_lock],
      (error: string, value: SahhaSensorStatus) => {
        if (error) {
          console.error(`Error: ${error}`);
        } else if (value != null) {
          console.log(`Sensor Status: ` + SahhaSensorStatus[value]);
          setSensorStatus(value);
          if (value == SahhaSensorStatus.pending) {
            console.log("Pending");
            // Show your custom UI asking your user to setup Sleep in the Health App
          }
        }
      }
    );
  };

  const enableSensors = () => {
    console.log("Enable Sensors");
    Sahha.enableSensors(
      [SahhaSensor.steps, SahhaSensor.sleep, SahhaSensor.device_lock],
      (error: string, value: SahhaSensorStatus) => {
        if (error) {
          console.error(`Error: ${error}`);
        } else if (value != null) {
          console.log(`Sensor Status: ` + SahhaSensorStatus[value]);
          setSensorStatus(value);
          if (value == SahhaSensorStatus.pending) {
            console.log("pending");
            // Show your custom UI asking your user to setup Sleep in the Health App
          }
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.textSection}>
        <Text>App Id:</Text>
        <TextInput
          editable
          numberOfLines={1}
          maxLength={64}
          onChangeText={(text) => setAppId(text)}
          value={appId}
          style={styles.textInput}
          returnKeyType="done"
        />
        <Text>App Secret:</Text>
        <TextInput
          editable
          numberOfLines={1}
          maxLength={64}
          onChangeText={(text) => setAppSecret(text)}
          value={appSecret}
          style={styles.textInput}
          returnKeyType="done"
        />
        <Text>User Id:</Text>
        <TextInput
          editable
          numberOfLines={1}
          maxLength={64}
          onChangeText={(text) => setUserId(text)}
          value={userId}
          style={styles.textInput}
          returnKeyType="done"
        />
        <Text style={styles.text}>AUTHENTICATED : {String(authStatus)}</Text>
        <Button title="Authenticate" onPress={authenticate} />
      </View>
      <View style={styles.textSection}>
        <Text style={styles.text}>
          SENSOR STATUS : {SahhaSensorStatus[sensorStatus]}
        </Text>
        <Button title="Check Sensors" onPress={getSensorStatus} />
        <Button
          title="Enable Sensors"
          disabled={isDisabled}
          onPress={enableSensors}
        />
        <Button
          title={"Open App Settings"}
          onPress={() => {
            Sahha.openAppSettings();
          }}
        />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  textSection: {
    backgroundColor: "#fff",
    alignItems: "center",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 10,
    margin: 10,
    width: 300,
  },
  text: {
    margin: 10,
  },
});
