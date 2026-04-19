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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "@/context/app-context";
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

export default function SettingsScreen() {
  const {
    steps,
    addStep,
    removeStep,
    moveStepUp,
    moveStepDown,
    emailTemplates,
    updateEmailTemplate,
    businessName,
  } = useApp();
  const [newStepLabel, setNewStepLabel] = useState("");

  // Template editor modal state
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [showPreview, setShowPreview] = useState(false);

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

  // --- Template editor handlers ---

  const handleEditTemplate = (stepId: string) => {
    const template = emailTemplates.find((t) => t.stepId === stepId);
    setEditSubject(template?.subject ?? "");
    setEditBody(template?.body ?? "");
    setEditingStepId(stepId);
    setShowPreview(false);
  };

  const handleSaveTemplate = () => {
    if (!editingStepId) return;
    if (!editSubject.trim()) {
      Alert.alert("Error", "Subject cannot be empty");
      return;
    }
    if (!editBody.trim()) {
      Alert.alert("Error", "Body cannot be empty");
      return;
    }
    updateEmailTemplate(editingStepId, editSubject, editBody);
    setEditingStepId(null);
    setShowPreview(false);
    Alert.alert("Saved", "Email template has been saved.");
  };

  const handleCloseEditor = () => {
    const template = emailTemplates.find((t) => t.stepId === editingStepId);
    const hasChanges =
      template && (editSubject !== template.subject || editBody !== template.body);

    if (hasChanges) {
      Alert.alert("Discard Changes?", "You have unsaved changes.", [
        { text: "Keep Editing", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            setEditingStepId(null);
            setShowPreview(false);
          },
        },
      ]);
    } else {
      setEditingStepId(null);
      setShowPreview(false);
    }
  };

  const handleResetTemplate = () => {
    Alert.alert(
      "Reset Template",
      "This will reset the email template to the default. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            const step = steps.find((s) => s.id === editingStepId);
            if (!step) return;
            const defaults = getDefaultForStep(step.label);
            setEditSubject(defaults.subject);
            setEditBody(defaults.body);
          },
        },
      ]
    );
  };

  // Render preview with sample data
  const previewVariables = {
    customerName: "John Doe",
    stepName: steps.find((s) => s.id === editingStepId)?.label ?? "Step",
    businessName,
  };

  const editingStepLabel =
    steps.find((s) => s.id === editingStepId)?.label ?? "Step";

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-2 pb-4 border-b border-border">
        <Text className="text-2xl font-bold text-foreground">Settings</Text>
        <Text className="text-sm text-muted-foreground mt-1">
          Configure your workflow steps and email templates.
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        {/* ===== PROCESS STEPS SECTION ===== */}
        <Text className="text-lg font-bold text-foreground mb-1">Process Steps</Text>
        <Text className="text-sm text-muted-foreground mb-4">
          Configure the steps in your workflow. Customers will be notified when
          you select a step.
        </Text>

        {/* Add New Step */}
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

        {/* ===== EMAIL TEMPLATES SECTION ===== */}
        <View className="h-px bg-border mt-4 mb-6" />

        <Text className="text-lg font-bold text-foreground mb-1">
          Email Templates
        </Text>
        <Text className="text-sm text-muted-foreground mb-2">
          Customize the email sent to customers at each step. Use variables
          like {"{{customer_name}}"}, {"{{step_name}}"},{" "}
          {"{{business_name}}"}, and {"{{date}}"}.
        </Text>

        {/* Variable reference */}
        <View className="bg-secondary/50 rounded-lg p-3 mb-4">
          <Text className="text-xs font-medium text-muted-foreground mb-1">
            Available Variables:
          </Text>
          <Text className="text-xs text-muted-foreground">
            {"{{customer_name}}"} - Customer's name{"\n"}
            {"{{step_name}}"} - Current step label{"\n"}
            {"{{business_name}}"} - Your business name ({businessName}){"\n"}
            {"{{date}}"} - Today's date
          </Text>
        </View>

        {steps.map((step) => {
          const template = emailTemplates.find((t) => t.stepId === step.id);
          const hasTemplate = !!template;

          return (
            <TouchableOpacity
              key={step.id}
              className="flex-row items-center border border-border rounded-xl p-4 mb-3 bg-white"
              onPress={() => handleEditTemplate(step.id)}
              activeOpacity={0.7}
            >
              {/* Mail icon */}
              <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                <Mail size={18} color="hsl(221.2, 83.2%, 53.3%)" />
              </View>

              {/* Template info */}
              <View className="flex-1">
                <Text className="text-base font-medium text-foreground">
                  {step.label}
                </Text>
                <Text
                  className="text-sm text-muted-foreground mt-0.5"
                  numberOfLines={1}
                >
                  {hasTemplate
                    ? template.subject
                    : "No template set - tap to create"}
                </Text>
              </View>

              {/* Status indicator */}
              <View
                className={`w-2.5 h-2.5 rounded-full ${
                  hasTemplate ? "bg-green-500" : "bg-orange-400"
                }`}
              />
            </TouchableOpacity>
          );
        })}

        {steps.length === 0 && (
          <View className="items-center justify-center py-10">
            <Text className="text-muted-foreground">
              Add process steps above to configure email templates.
            </Text>
          </View>
        )}

        {/* Bottom padding */}
        <View className="h-8" />
      </ScrollView>

      {/* ===== TEMPLATE EDITOR MODAL ===== */}
      <Modal
        visible={editingStepId !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseEditor}
      >
        <SafeAreaView className="flex-1 bg-white">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
          >
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-6 pt-4 pb-3 border-b border-border">
              <TouchableOpacity onPress={handleCloseEditor}>
                <Text className="text-base text-muted-foreground">Cancel</Text>
              </TouchableOpacity>
              <Text
                className="text-base font-bold text-foreground"
                numberOfLines={1}
              >
                {editingStepLabel}
              </Text>
              <TouchableOpacity onPress={handleSaveTemplate}>
                <Text className="text-base font-semibold text-primary">
                  Save
                </Text>
              </TouchableOpacity>
            </View>

            {/* Toggle: Edit / Preview */}
            <View className="flex-row mx-6 mt-4 mb-3 bg-secondary rounded-lg p-1">
              <TouchableOpacity
                className={`flex-1 py-2 rounded-md items-center ${
                  !showPreview ? "bg-white shadow-sm" : ""
                }`}
                onPress={() => setShowPreview(false)}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-sm font-medium ${
                    !showPreview ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  Edit
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 rounded-md items-center flex-row justify-center gap-1.5 ${
                  showPreview ? "bg-white shadow-sm" : ""
                }`}
                onPress={() => setShowPreview(true)}
                activeOpacity={0.7}
              >
                <Eye
                  size={14}
                  color={
                    showPreview
                      ? "hsl(222.2, 47.4%, 11.2%)"
                      : "hsl(215.4, 16.3%, 46.9%)"
                  }
                />
                <Text
                  className={`text-sm font-medium ${
                    showPreview ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  Preview
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              className="flex-1 px-6"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {showPreview ? (
                /* ---- PREVIEW MODE ---- */
                <View className="mt-2">
                  <Text className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Preview (sample data)
                  </Text>
                  <View className="border border-border rounded-xl p-4 bg-secondary/30">
                    {/* Subject preview */}
                    <Text className="text-xs font-medium text-muted-foreground mb-1">
                      Subject
                    </Text>
                    <Text className="text-base font-semibold text-foreground mb-4">
                      {replaceTemplateVariables(editSubject, previewVariables)}
                    </Text>

                    {/* Divider */}
                    <View className="h-px bg-border mb-4" />

                    {/* Body preview */}
                    <Text className="text-xs font-medium text-muted-foreground mb-1">
                      Body
                    </Text>
                    <Text className="text-base text-foreground leading-6">
                      {replaceTemplateVariables(editBody, previewVariables)}
                    </Text>
                  </View>

                  <Text className="text-xs text-muted-foreground mt-3 text-center">
                    Preview uses sample customer "John Doe"
                  </Text>
                </View>
              ) : (
                /* ---- EDIT MODE ---- */
                <View className="mt-2">
                  {/* Subject */}
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Subject
                  </Text>
                  <TextInput
                    className="border border-border rounded-lg px-4 py-3 text-base text-foreground bg-white mb-4"
                    placeholder="Email subject line..."
                    placeholderTextColor="hsl(215.4, 16.3%, 46.9%)"
                    value={editSubject}
                    onChangeText={setEditSubject}
                    returnKeyType="next"
                  />

                  {/* Body */}
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Body
                  </Text>
                  <TextInput
                    className="border border-border rounded-lg px-4 py-3 text-base text-foreground bg-white mb-4"
                    placeholder="Email body content..."
                    placeholderTextColor="hsl(215.4, 16.3%, 46.9%)"
                    value={editBody}
                    onChangeText={setEditBody}
                    multiline
                    numberOfLines={12}
                    textAlignVertical="top"
                    style={{ minHeight: 240 }}
                  />

                  {/* Reset to default button */}
                  <TouchableOpacity
                    className="flex-row items-center justify-center gap-2 py-3 rounded-lg border border-border"
                    onPress={handleResetTemplate}
                    activeOpacity={0.7}
                  >
                    <RotateCcw size={14} color="hsl(215.4, 16.3%, 46.9%)" />
                    <Text className="text-sm text-muted-foreground font-medium">
                      Reset to Default
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Bottom padding */}
              <View className="h-8" />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// --- Default template content for reset ---

function getDefaultForStep(stepLabel: string): {
  subject: string;
  body: string;
} {
  const label = stepLabel.toLowerCase();

  if (label.includes("received")) {
    return {
      subject: "Order Received - Thank you, {{customer_name}}!",
      body: `Hi {{customer_name}},

Thank you for your order! We've received it and it's now in our queue.

We'll begin working on it shortly and keep you updated on the progress.

Estimated processing time: 3-5 business days.

If you have any questions in the meantime, feel free to reach out.

Best regards,
{{business_name}}`,
    };
  }

  if (label.includes("progress")) {
    return {
      subject: "Your order is now in progress",
      body: `Hi {{customer_name}},

Great news! Your order is now {{step_name}}. Our team is giving it their full attention.

We'll notify you as soon as it moves to the next stage.

Best regards,
{{business_name}}`,
    };
  }

  if (label.includes("ship")) {
    return {
      subject: "Your order has been shipped!",
      body: `Hi {{customer_name}},

Your order has been shipped and is on its way to you!

Please allow a few days for delivery. We'll let you know once it arrives.

Best regards,
{{business_name}}`,
    };
  }

  if (label.includes("deliver")) {
    return {
      subject: "Your order has been delivered!",
      body: `Hi {{customer_name}},

Your order has been successfully delivered! We hope everything meets your expectations.

If you have any questions or concerns about your order, please don't hesitate to contact us.

Thank you for choosing {{business_name}}!

Best regards,
{{business_name}}`,
    };
  }

  // Generic default for custom steps
  return {
    subject: "Update: {{step_name}}",
    body: `Hi {{customer_name}},

Your order has been updated to: {{step_name}}.

We'll keep you informed of any further changes.

Best regards,
{{business_name}}`,
  };
}
