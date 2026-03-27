import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  SafeAreaView,
} from "react-native";
import { useApp } from "@/context/app-context";
import { sendStepUpdate } from "@/lib/email";
import { Mail, UserPlus, ChevronDown, X, User } from "lucide-react-native";

export default function DashboardScreen() {
  const { customers, steps, logout, setCustomerStep, getEmailTemplate, businessName } = useApp();
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [pickerCustomerId, setPickerCustomerId] = useState<string | null>(null);

  const handleSendUpdate = async (
    customerId: string,
    customerName: string,
    customerEmail: string,
    stepId: string,
    stepLabel: string
  ) => {
    const template = getEmailTemplate(stepId);
    const subject = template?.subject ?? `Update: ${stepLabel}`;
    const body = template?.body ?? `Hi {{customer_name}},\n\nYour order status has been updated to: {{step_name}}.\n\nBest regards,\n{{business_name}}`;

    setSendingTo(customerId);
    const result = await sendStepUpdate({
      customerName,
      customerEmail,
      stepName: stepLabel,
      subject,
      body,
      businessName,
    });
    setSendingTo(null);
    setPickerCustomerId(null);
    setCustomerStep(customerId, stepId);

    Alert.alert(result.success ? "Success" : "Error", result.message);
  };

  const handleAddCustomer = () => {
    Alert.alert("Coming Soon", "Adding customers will be available in a future update.");
  };

  const currentPickerCustomer = customers.find((c) => c.id === pickerCustomerId);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-2 pb-4 border-b border-border">
        <View>
          <Text className="text-2xl font-bold text-foreground">Customers</Text>
          <Text className="text-sm text-muted-foreground mt-1">
            {customers.length} {customers.length === 1 ? "customer" : "customers"}
          </Text>
        </View>
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="bg-primary rounded-lg px-4 py-2.5 flex-row items-center gap-2"
            onPress={handleAddCustomer}
            activeOpacity={0.8}
          >
            <UserPlus size={16} color="white" />
            <Text className="text-primary-foreground font-medium text-sm">Add</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="border border-border rounded-lg px-4 py-2.5"
            onPress={logout}
            activeOpacity={0.8}
          >
            <Text className="text-muted-foreground font-medium text-sm">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Customer List */}
      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        {customers.map((customer) => (
          <View
            key={customer.id}
            className="border border-border rounded-xl p-5 mb-4 bg-white"
          >
            {/* Customer Info */}
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-11 h-11 bg-secondary rounded-full items-center justify-center">
                <User size={20} color="hsl(222.2, 47.4%, 11.2%)" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2 flex-wrap">
                  <Text className="text-base font-semibold text-foreground">
                    {customer.name}
                  </Text>
                  {customer.currentStepId && (() => {
                    const step = steps.find((s) => s.id === customer.currentStepId);
                    return step ? (
                      <View className="bg-primary/10 rounded-full px-2.5 py-0.5">
                        <Text className="text-xs font-medium text-primary">{step.label}</Text>
                      </View>
                    ) : null;
                  })()}
                </View>
                <Text className="text-sm text-muted-foreground">{customer.email}</Text>
              </View>
            </View>

            {/* Step Selector */}
            <Text className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Send Status Update
            </Text>
            <TouchableOpacity
              className="flex-row items-center justify-between border border-border rounded-lg px-4 py-3 bg-secondary/50"
              onPress={() => setPickerCustomerId(customer.id)}
              activeOpacity={0.7}
              disabled={sendingTo === customer.id}
            >
              {sendingTo === customer.id ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="hsl(221.2, 83.2%, 53.3%)" />
                  <Text className="text-sm text-muted-foreground">Sending...</Text>
                </View>
              ) : customer.currentStepId ? (
                <>
                  <View className="flex-row items-center gap-2">
                    <Mail size={16} color="hsl(221.2, 83.2%, 53.3%)" />
                    <Text className="text-sm text-primary font-medium">
                      {steps.find((s) => s.id === customer.currentStepId)?.label}
                    </Text>
                  </View>
                  <Text className="text-xs text-muted-foreground">Change step</Text>
                </>
              ) : (
                <>
                  <View className="flex-row items-center gap-2">
                    <Mail size={16} color="hsl(215.4, 16.3%, 46.9%)" />
                    <Text className="text-sm text-foreground">Choose a step to notify</Text>
                  </View>
                  <ChevronDown size={16} color="hsl(215.4, 16.3%, 46.9%)" />
                </>
              )}
            </TouchableOpacity>
          </View>
        ))}

        {customers.length === 0 && (
          <View className="items-center justify-center py-20">
            <User size={48} color="hsl(214.3, 31.8%, 91.4%)" />
            <Text className="text-lg text-muted-foreground mt-4">No customers yet</Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Tap &quot;Add&quot; to add your first customer
            </Text>
          </View>
        )}

        {/* Bottom padding */}
        <View className="h-8" />
      </ScrollView>

      {/* Step Picker Modal */}
      <Modal
        visible={pickerCustomerId !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setPickerCustomerId(null)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10 max-h-[70%]">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-bold text-foreground">Select Step</Text>
              <TouchableOpacity
                onPress={() => setPickerCustomerId(null)}
                className="w-8 h-8 items-center justify-center rounded-full bg-secondary"
              >
                <X size={16} color="hsl(222.2, 47.4%, 11.2%)" />
              </TouchableOpacity>
            </View>
            {currentPickerCustomer && (
              <Text className="text-sm text-muted-foreground mb-5">
                Sending update to {currentPickerCustomer.name} ({currentPickerCustomer.email})
              </Text>
            )}

            {/* Step List */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {steps.map((step, index) => (
                <TouchableOpacity
                  key={step.id}
                  className="flex-row items-center gap-4 py-4 border-b border-border"
                  onPress={() => {
                    if (currentPickerCustomer) {
                      handleSendUpdate(
                        currentPickerCustomer.id,
                        currentPickerCustomer.name,
                        currentPickerCustomer.email,
                        step.id,
                        step.label
                      );
                    }
                  }}
                  activeOpacity={0.6}
                >
                  <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                    <Text className="text-sm font-bold text-primary">{index + 1}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-medium text-foreground">{step.label}</Text>
                  </View>
                  <Mail size={18} color="hsl(221.2, 83.2%, 53.3%)" />
                </TouchableOpacity>
              ))}

              {steps.length === 0 && (
                <View className="items-center py-10">
                  <Text className="text-muted-foreground">
                    No steps configured. Add steps in Settings.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
