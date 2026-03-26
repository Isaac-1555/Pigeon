import { Tabs } from "expo-router";
import { Home, Settings } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "hsl(221.2, 83.2%, 53.3%)",
        tabBarInactiveTintColor: "hsl(215.4, 16.3%, 46.9%)",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopColor: "hsl(214.3, 31.8%, 91.4%)",
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        headerStyle: {
          backgroundColor: "white",
        },
        headerTitleStyle: {
          fontWeight: "600",
          color: "hsl(222.2, 84%, 4.9%)",
        },
        headerShadowVisible: false,
        headerTitleAlign: "left",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
