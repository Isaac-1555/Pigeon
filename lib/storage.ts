import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  EMAIL_TEMPLATES: "@pigeon/email_templates",
  BUSINESS_NAME: "@pigeon/business_name",
} as const;

export interface StoredEmailTemplate {
  stepId: string;
  subject: string;
  body: string;
}

// --- Email Templates ---

export async function saveEmailTemplates(
  templates: StoredEmailTemplate[]
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      KEYS.EMAIL_TEMPLATES,
      JSON.stringify(templates)
    );
  } catch (error) {
    console.error("Failed to save email templates:", error);
  }
}

export async function loadEmailTemplates(): Promise<StoredEmailTemplate[] | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.EMAIL_TEMPLATES);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Failed to load email templates:", error);
    return null;
  }
}

// --- Business Name ---

export async function saveBusinessName(name: string): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.BUSINESS_NAME, name);
  } catch (error) {
    console.error("Failed to save business name:", error);
  }
}

export async function loadBusinessName(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEYS.BUSINESS_NAME);
  } catch (error) {
    console.error("Failed to load business name:", error);
    return null;
  }
}
