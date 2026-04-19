import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useConvex, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { sendStepUpdate } from "@/lib/email";
import { Mail, UserPlus, ChevronDown, X, User } from "lucide-react-native";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  product: string;
  issue: string;
  priority?: string;
  currentStepId?: string;
  estimatedDate?: number;
  notes?: string;
  createdAt: number;
}

interface ProcessStep {
  _id: string;
  label: string;
  order: number;
}

export default function DashboardScreen() {
  const convex = useConvex();

  const customers = useQuery(api.customers.getCustomers) || [];
  const steps = useQuery(api.steps.getSteps) || [];

  const addCustomerMutation = useMutation(api.customers.addCustomer);
  const updateCustomerStepMutation = useMutation(api.customers.updateCustomerStep);
  const deleteCustomerMutation = useMutation(api.customers.deleteCustomer);

  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [pickerCustomerId, setPickerCustomerId] = useState<string | null>(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedStep, setSelectedStep] = useState<{id: string; label: string} | null>(null);

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    product: "",
    issue: "",
    priority: "normal",
  });
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);

  const [dateInput, setDateInput] = useState("");

  const sortedSteps = [...steps].sort((a: ProcessStep, b: ProcessStep) => a.order - b.order);

  const handleAddCustomer = async () => {
    if (!newCustomer.name.trim() || !newCustomer.email.trim() || !newCustomer.product.trim() || !newCustomer.issue.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setIsAddingCustomer(true);
    try {
      await addCustomerMutation({
        name: newCustomer.name.trim(),
        email: newCustomer.email.trim(),
        phone: newCustomer.phone.trim() || undefined,
        product: newCustomer.product.trim(),
        issue: newCustomer.issue.trim(),
        priority: newCustomer.priority || undefined,
      });
      setShowAddCustomer(false);
      setNewCustomer({ name: "", email: "", phone: "", product: "", issue: "", priority: "normal" });
      Alert.alert("Success", "Customer added successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add customer");
    } finally {
      setIsAddingCustomer(false);
    }
  };

  const handleSelectStep = (customer: Customer, step: ProcessStep) => {
    const lastStep = sortedSteps[sortedSteps.length - 1];
    if (step._id === lastStep._id) {
      handleSendUpdate(customer, step._id, step.label, undefined);
    } else {
      setSelectedStep({ id: step._id, label: step.label });
      setPickerCustomerId(null);
      setShowDatePicker(true);
    }
  };

  const handleConfirmDate = async () => {
    const customer = customers.find((c: Customer) => c._id === pickerCustomerId);
    if (!customer || !selectedStep) return;

    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      Alert.alert("Invalid Date", "Please enter a valid date in YYYY-MM-DD format");
      return;
    }

    handleSendUpdate(customer, selectedStep.id, selectedStep.label, date.getTime());
  };

  const handleSendUpdate = async (
    customer: Customer,
    stepId: string,
    stepLabel: string,
    estimatedDate?: number
  ) => {
    setSendingTo(customer._id);

    try {
      const result = await sendStepUpdate({
        customerName: customer.name,
        customerEmail: customer.email,
        stepName: stepLabel,
        product: customer.product,
        issue: customer.issue,
        estimatedDate,
      });

      await updateCustomerStepMutation({
        customerId: customer._id as any,
        stepId,
        estimatedDate: estimatedDate || undefined,
      });

      Alert.alert(result.success ? "Success" : "Error", result.message);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send update");
    } finally {
      setSendingTo(null);
      setPickerCustomerId(null);
      setShowDatePicker(false);
      setSelectedStep(null);
      setDateInput("");
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    Alert.alert("Delete Customer", "Are you sure you want to delete this customer?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCustomerMutation({ customerId: customerId as any });
          } catch (error: any) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-6 pt-2 pb-4 border-b border-border">
        <View>
          <Text className="text-2xl font-bold text-foreground">Customers</Text>
          <Text className="text-sm text-muted-foreground mt-1">
            {customers.length} {customers.length === 1 ? "customer" : "customers"}
          </Text>
        </View>
        <TouchableOpacity
          className="bg-primary rounded-lg px-4 py-2.5 flex-row items-center gap-2"
          onPress={() => setShowAddCustomer(true)}
          activeOpacity={0.8}
        >
          <UserPlus size={16} color="white" />
          <Text className="text-primary-foreground font-medium text-sm">Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        {customers.map((customer: Customer) => (
          <View
            key={customer._id}
            className="border border-border rounded-xl p-5 mb-4 bg-white"
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-3">
                <View className="w-11 h-11 bg-secondary rounded-full items-center justify-center">
                  <User size={20} color="hsl(222.2, 47.4%, 11.2%)" />
                </View>
                <View>
                  <Text className="text-base font-semibold text-foreground">{customer.name}</Text>
                  <Text className="text-sm text-muted-foreground">{customer.email}</Text>
                  {customer.phone && <Text className="text-xs text-muted-foreground">{customer.phone}</Text>}
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDeleteCustomer(customer._id)}>
                <X size={18} color="hsl(214.3, 31.8%, 91.4%)" />
              </TouchableOpacity>
            </View>

            <View className="bg-secondary/50 rounded-lg p-3 mb-3">
              <Text className="text-xs font-medium text-muted-foreground uppercase">Product</Text>
              <Text className="text-sm text-foreground">{customer.product}</Text>
              <Text className="text-xs font-medium text-muted-foreground mt-2 uppercase">Issue</Text>
              <Text className="text-sm text-foreground">{customer.issue}</Text>
              {customer.priority && customer.priority !== "normal" && (
                <View className="mt-2">
                  <Text className="text-xs font-medium text-muted-foreground uppercase">Priority</Text>
                  <Text className="text-sm text-foreground capitalize">{customer.priority}</Text>
                </View>
              )}
              {customer.estimatedDate && (
                <View className="mt-2">
                  <Text className="text-xs font-medium text-muted-foreground uppercase">Est. Date</Text>
                  <Text className="text-sm text-foreground">
                    {new Date(customer.estimatedDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>

            {customer.currentStepId && (
              <View className="bg-primary/10 rounded-full px-3 py-1 self-start mb-3">
                <Text className="text-xs font-medium text-primary">
                  {sortedSteps.find((s: ProcessStep) => s._id === customer.currentStepId)?.label || "Unknown"}
                </Text>
              </View>
            )}

            <Text className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Send Status Update
            </Text>
            <TouchableOpacity
              className="flex-row items-center justify-between border border-border rounded-lg px-4 py-3 bg-secondary/50"
              onPress={() => {
                setPickerCustomerId(customer._id);
              }}
              activeOpacity={0.7}
              disabled={sendingTo === customer._id}
            >
              {sendingTo === customer._id ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="hsl(221.2, 83.2%, 53.3%)" />
                  <Text className="text-sm text-muted-foreground">Sending...</Text>
                </View>
              ) : customer.currentStepId ? (
                <>
                  <View className="flex-row items-center gap-2">
                    <Mail size={16} color="hsl(221.2, 83.2%, 53.3%)" />
                    <Text className="text-sm text-primary font-medium">
                      {sortedSteps.find((s: ProcessStep) => s._id === customer.currentStepId)?.label}
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
            <Text className="text-sm text-muted-foreground mt-1">Tap "Add" to add your first customer</Text>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>

      {/* Step Picker Modal */}
      <Modal visible={pickerCustomerId !== null} animationType="slide" transparent onRequestClose={() => setPickerCustomerId(null)}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10 max-h-[70%]">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-bold text-foreground">Select Step</Text>
              <TouchableOpacity onPress={() => setPickerCustomerId(null)} className="w-8 h-8 items-center justify-center rounded-full bg-secondary">
                <X size={16} color="hsl(222.2, 47.4%, 11.2%)" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {sortedSteps.map((step: ProcessStep, index: number) => {
                const customer = customers.find((c: Customer) => c._id === pickerCustomerId);
                return (
                  <TouchableOpacity
                    key={step._id}
                    className="flex-row items-center gap-4 py-4 border-b border-border"
                    onPress={() => {
                      if (customer) {
                        handleSelectStep(customer, step);
                      }
                    }}
                    activeOpacity={0.6}
                  >
                    <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                      <Text className="text-sm font-bold text-primary">{index + 1}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-medium text-foreground">{step.label}</Text>
                      {index < sortedSteps.length - 1 && <Text className="text-xs text-muted-foreground">Requires estimated date</Text>}
                    </View>
                    <Mail size={18} color="hsl(221.2, 83.2%, 53.3%)" />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} animationType="slide" transparent onRequestClose={() => setShowDatePicker(false)}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-foreground">Set Estimated Date</Text>
              <TouchableOpacity onPress={() => { setShowDatePicker(false); setDateInput(""); }} className="w-8 h-8 items-center justify-center rounded-full bg-secondary">
                <X size={16} color="hsl(222.2, 47.4%, 11.2%)" />
              </TouchableOpacity>
            </View>
            <Text className="text-sm text-muted-foreground mb-4">
              Enter estimated completion date for "{selectedStep?.label}"
            </Text>
            <TextInput
              className="border border-border rounded-lg px-4 py-3 text-base text-foreground bg-white"
              placeholder="YYYY-MM-DD"
              placeholderTextColor="hsl(215.4, 16.3%, 46.9%)"
              value={dateInput}
              onChangeText={setDateInput}
            />
            <TouchableOpacity className="bg-primary rounded-lg py-4 items-center mt-4" onPress={handleConfirmDate}>
              <Text className="text-primary-foreground font-semibold">Confirm Date</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Customer Modal */}
      <Modal visible={showAddCustomer} animationType="slide" transparent onRequestClose={() => setShowAddCustomer(false)}>
        <View className="flex-1 justify-end bg-black/40">
          <ScrollView className="bg-white rounded-t-3xl px-6 pt-6 pb-10 max-h-[90%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-foreground">Add Customer</Text>
              <TouchableOpacity onPress={() => setShowAddCustomer(false)} className="w-8 h-8 items-center justify-center rounded-full bg-secondary">
                <X size={16} color="hsl(222.2, 47.4%, 11.2%)" />
              </TouchableOpacity>
            </View>

            <View className="gap-4">
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Name *</Text>
                <TextInput
                  className="border border-border rounded-lg px-4 py-3 text-base text-foreground bg-white"
                  placeholder="Customer name"
                  placeholderTextColor="hsl(215.4, 16.3%, 46.9%)"
                  value={newCustomer.name}
                  onChangeText={(v) => setNewCustomer({ ...newCustomer, name: v })}
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Email *</Text>
                <TextInput
                  className="border border-border rounded-lg px-4 py-3 text-base text-foreground bg-white"
                  placeholder="customer@email.com"
                  placeholderTextColor="hsl(215.4, 16.3%, 46.9%)"
                  value={newCustomer.email}
                  onChangeText={(v) => setNewCustomer({ ...newCustomer, email: v })}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Phone</Text>
                <TextInput
                  className="border border-border rounded-lg px-4 py-3 text-base text-foreground bg-white"
                  placeholder="+1 234 567 8900"
                  placeholderTextColor="hsl(215.4, 16.3%, 46.9%)"
                  value={newCustomer.phone}
                  onChangeText={(v) => setNewCustomer({ ...newCustomer, phone: v })}
                  keyboardType="phone-pad"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Product *</Text>
                <TextInput
                  className="border border-border rounded-lg px-4 py-3 text-base text-foreground bg-white"
                  placeholder="What product is this for?"
                  placeholderTextColor="hsl(215.4, 16.3%, 46.9%)"
                  value={newCustomer.product}
                  onChangeText={(v) => setNewCustomer({ ...newCustomer, product: v })}
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Issue *</Text>
                <TextInput
                  className="border border-border rounded-lg px-4 py-3 text-base text-foreground bg-white"
                  placeholder="Describe the issue"
                  placeholderTextColor="hsl(215.4, 16.3%, 46.9%)"
                  value={newCustomer.issue}
                  onChangeText={(v) => setNewCustomer({ ...newCustomer, issue: v })}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Priority</Text>
                <View className="flex-row gap-2">
                  {(["normal", "high", "urgent"] as const).map((p) => (
                    <TouchableOpacity
                      key={p}
                      className={`flex-1 py-3 rounded-lg border ${newCustomer.priority === p ? "bg-primary border-primary" : "border-border"}`}
                      onPress={() => setNewCustomer({ ...newCustomer, priority: p })}
                    >
                      <Text className={`text-center text-sm font-medium ${newCustomer.priority === p ? "text-primary-foreground" : "text-foreground"}`}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                className="bg-primary rounded-lg py-4 items-center mt-4"
                onPress={handleAddCustomer}
                disabled={isAddingCustomer}
                activeOpacity={0.8}
              >
                {isAddingCustomer ? <ActivityIndicator color="white" /> : <Text className="text-primary-foreground font-semibold text-base">Add Customer</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}