import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useConvex } from "convex/react";
import { api } from "../convex/_generated/api";
import { useRouter } from "expo-router";

export default function OnboardingScreen() {
  const convex = useConvex();
  const router = useRouter();
  const [name, setName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    if (!name.trim() || !senderEmail.trim() || !businessName.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await convex.mutation(api.owners.createOwner, {
        name: name.trim(),
        senderEmail: senderEmail.trim(),
        businessName: businessName.trim(),
      });
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Setup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="flex-1 justify-center px-8">
        <View className="items-center mb-12">
          <Text className="text-3xl font-bold text-foreground">Setup Your Business</Text>
          <Text className="text-muted-foreground mt-2 text-base text-center">
            Configure how you'd like to appear to customers
          </Text>
        </View>

        <View className="gap-4">
          <View>
            <Text className="text-sm font-medium text-foreground mb-2">
              Your Name
            </Text>
            <TextInput
              className="border border-border rounded-lg px-4 py-3 text-base text-foreground bg-white"
              placeholder="John Smith"
              placeholderTextColor="hsl(215.4, 16.3%, 46.9%)"
              value={name}
              onChangeText={setName}
              autoComplete="name"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-foreground mb-2">
              Business Name
            </Text>
            <TextInput
              className="border border-border rounded-lg px-4 py-3 text-base text-foreground bg-white"
              placeholder="Acme Repair"
              placeholderTextColor="hsl(215.4, 16.3%, 46.9%)"
              value={businessName}
              onChangeText={setBusinessName}
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-foreground mb-2">
              Sender Email
            </Text>
            <TextInput
              className="border border-border rounded-lg px-4 py-3 text-base text-foreground bg-white"
              placeholder="you@yourbusiness.com"
              placeholderTextColor="hsl(215.4, 16.3%, 46.9%)"
              value={senderEmail}
              onChangeText={setSenderEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <Text className="text-xs text-muted-foreground mt-1">
              Emails will be sent from this address
            </Text>
          </View>

          <TouchableOpacity
            className="bg-primary rounded-lg py-4 items-center mt-4"
            onPress={handleComplete}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-primary-foreground font-semibold text-base">
                Complete Setup
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}