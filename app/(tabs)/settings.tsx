import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from "react-native";
import { useApp } from "@/context/app-context";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from "lucide-react-native";

export default function SettingsScreen() {
  const { steps, addStep, removeStep, moveStepUp, moveStepDown } = useApp();
  const [newStepLabel, setNewStepLabel] = useState("");

  const handleAddStep = () => {
    const label = newStepLabel.trim();
    if (!label) {
      Alert.alert("Error", "Please enter a step name");
      return;
    }
    addStep(label);
    setNewStepLabel("");
  };

  const handleRemoveStep = (id: string, label: string) => {
    Alert.alert("Remove Step", `Are you sure you want to remove "${label}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeStep(id),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-2 pb-4 border-b border-border">
        <Text className="text-2xl font-bold text-foreground">Process Steps</Text>
        <Text className="text-sm text-muted-foreground mt-1">
          Configure the steps in your workflow. Customers will be notified when you
          select a step.
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        {/* Add New Step */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-foreground mb-2">Add New Step</Text>
          <View className="flex-row gap-3">
            <TextInput
              className="flex-1 border border-border rounded-lg px-4 py-3 text-base text-foreground bg-white"
              placeholder="e.g. Quality Check"
              placeholderTextColor="hsl(215.4, 16.3%, 46.9%)"
              value={newStepLabel}
              onChangeText={setNewStepLabel}
              onSubmitEditing={handleAddStep}
              returnKeyType="done"
            />
            <TouchableOpacity
              className="bg-primary rounded-lg px-4 items-center justify-center"
              onPress={handleAddStep}
              activeOpacity={0.8}
            >
              <Plus size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Divider */}
        <View className="h-px bg-border mb-4" />

        {/* Steps List */}
        <Text className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Current Steps ({steps.length})
        </Text>

        {steps.map((step, index) => (
          <View
            key={step.id}
            className="flex-row items-center border border-border rounded-xl p-4 mb-3 bg-white"
          >
            {/* Grip / Order indicator */}
            <View className="mr-3 items-center">
              <GripVertical size={18} color="hsl(214.3, 31.8%, 91.4%)" />
            </View>

            {/* Step Number */}
            <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3">
              <Text className="text-sm font-bold text-primary">{index + 1}</Text>
            </View>

            {/* Step Label */}
            <Text className="flex-1 text-base font-medium text-foreground">
              {step.label}
            </Text>

            {/* Reorder Buttons */}
            <View className="flex-row items-center gap-1 mr-2">
              <TouchableOpacity
                className="w-8 h-8 items-center justify-center rounded-lg bg-secondary"
                onPress={() => moveStepUp(step.id)}
                activeOpacity={0.7}
                disabled={index === 0}
              >
                <ChevronUp
                  size={16}
                  color={
                    index === 0
                      ? "hsl(214.3, 31.8%, 91.4%)"
                      : "hsl(222.2, 47.4%, 11.2%)"
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity
                className="w-8 h-8 items-center justify-center rounded-lg bg-secondary"
                onPress={() => moveStepDown(step.id)}
                activeOpacity={0.7}
                disabled={index === steps.length - 1}
              >
                <ChevronDown
                  size={16}
                  color={
                    index === steps.length - 1
                      ? "hsl(214.3, 31.8%, 91.4%)"
                      : "hsl(222.2, 47.4%, 11.2%)"
                  }
                />
              </TouchableOpacity>
            </View>

            {/* Delete Button */}
            <TouchableOpacity
              className="w-8 h-8 items-center justify-center rounded-lg"
              onPress={() => handleRemoveStep(step.id, step.label)}
              activeOpacity={0.7}
            >
              <Trash2 size={16} color="hsl(0, 84.2%, 60.2%)" />
            </TouchableOpacity>
          </View>
        ))}

        {steps.length === 0 && (
          <View className="items-center justify-center py-16">
            <Text className="text-lg text-muted-foreground">No steps yet</Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Add your first step above
            </Text>
          </View>
        )}

        {/* Bottom padding */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
