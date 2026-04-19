import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useConvex, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { replaceTemplateVariables } from "@/lib/email";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Mail,
  Eye,
  X,
  RotateCcw,
} from "lucide-react-native";

interface ProcessStep {
  _id: string;
  label: string;
  order: number;
}

export default function SettingsScreen() {
  const convex = useConvex();
  const steps = useQuery(api.steps.getSteps) || [];
  const addStepMutation = useMutation(api.steps.addStep);
  const deleteStepMutation = useMutation(api.steps.deleteStep);

  const [newStepLabel, setNewStepLabel] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddStep = async () => {
    const label = newStepLabel.trim();
    if (!label) {
      Alert.alert("Error", "Please enter a step name");
      return;
    }

    setIsAdding(true);
    try {
      await addStepMutation({ label });
      setNewStepLabel("");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add step");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveStep = async (stepId: string, label: string) => {
    Alert.alert("Remove Step", `Are you sure you want to remove "${label}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteStepMutation({ stepId: stepId as any });
          } catch (error: any) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  const sortedSteps = [...steps].sort((a: ProcessStep, b: ProcessStep) => a.order - b.order);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-2 pb-4 border-b border-border">
        <Text className="text-2xl font-bold text-foreground">Settings</Text>
        <Text className="text-sm text-muted-foreground mt-1">
          Configure your workflow steps and email templates.
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        <Text className="text-lg font-bold text-foreground mb-1">Process Steps</Text>
        <Text className="text-sm text-muted-foreground mb-4">
          Configure the steps in your workflow.
        </Text>

        <View className="mb-6">
          <Text className="text-sm font-medium text-foreground mb-2">
            Add New Step
          </Text>
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
              disabled={isAdding}
              activeOpacity={0.8}
            >
              {isAdding ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Plus size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View className="h-px bg-border mb-4" />

        <Text className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Current Steps ({sortedSteps.length})
        </Text>

        {sortedSteps.map((step: ProcessStep, index: number) => (
          <View
            key={step._id}
            className="flex-row items-center border border-border rounded-xl p-4 mb-3 bg-white"
          >
            <View className="mr-3 items-center">
              <GripVertical size={18} color="hsl(214.3, 31.8%, 91.4%)" />
            </View>

            <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3">
              <Text className="text-sm font-bold text-primary">{index + 1}</Text>
            </View>

            <Text className="flex-1 text-base font-medium text-foreground">
              {step.label}
            </Text>

            <TouchableOpacity
              className="w-8 h-8 items-center justify-center rounded-lg"
              onPress={() => handleRemoveStep(step._id, step.label)}
              activeOpacity={0.7}
            >
              <Trash2 size={16} color="hsl(0, 84.2%, 60.2%)" />
            </TouchableOpacity>
          </View>
        ))}

        {sortedSteps.length === 0 && (
          <View className="items-center justify-center py-16">
            <Text className="text-lg text-muted-foreground">No steps yet</Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Add your first step above
            </Text>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}