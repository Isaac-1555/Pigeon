import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useApp } from "@/context/app-context";

export default function LoginScreen() {
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }
    login();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="flex-1 justify-center px-8">
        {/* Logo / Branding */}
        <View className="items-center mb-12">
          <View className="w-20 h-20 bg-primary rounded-2xl items-center justify-center mb-4">
            <Text className="text-white text-3xl font-bold">P</Text>
          </View>
          <Text className="text-3xl font-bold text-foreground">Pigeon</Text>
          <Text className="text-muted-foreground mt-2 text-base">
            Customer update notifications
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          <View>
            <Text className="text-sm font-medium text-foreground mb-2">
              Email
            </Text>
            <TextInput
              className="border border-border rounded-lg px-4 py-3 text-base text-foreground bg-white"
              placeholder="you@example.com"
              placeholderTextColor="hsl(215.4, 16.3%, 46.9%)"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-foreground mb-2">
              Password
            </Text>
            <TextInput
              className="border border-border rounded-lg px-4 py-3 text-base text-foreground bg-white"
              placeholder="Enter your password"
              placeholderTextColor="hsl(215.4, 16.3%, 46.9%)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <TouchableOpacity
            className="bg-primary rounded-lg py-4 items-center mt-4"
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text className="text-primary-foreground font-semibold text-base">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-center text-muted-foreground text-xs mt-8">
          Enter any credentials to continue
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
