import { send, EmailJSResponseStatus } from "@emailjs/react-native";

const SERVICE_ID = "service_064xew8";
const TEMPLATE_ID = "template_wsst13o";
const PUBLIC_KEY = "Pm-Y1bsSWG3BCOPbr";

interface SendUpdateParams {
  customerName: string;
  customerEmail: string;
  stepName: string;
}

function getEmailErrorMessage(error: unknown): string {
  if (error instanceof EmailJSResponseStatus) {
    return `EmailJS error (${error.status}): ${error.text}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (error !== null && typeof error === "object") {
    return JSON.stringify(error);
  }
  return "Unknown error";
}

export async function sendStepUpdate({
  customerName,
  customerEmail,
  stepName,
}: SendUpdateParams): Promise<{ success: boolean; message: string }> {
  try {
    await send(SERVICE_ID, TEMPLATE_ID, {
      to_name: customerName,
      to_email: customerEmail,
      step_name: stepName,
      from_name: "Pigeon",
    }, {
      publicKey: PUBLIC_KEY,
    });
    return {
      success: true,
      message: `Email sent to ${customerEmail} for step "${stepName}"`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to send email: ${getEmailErrorMessage(error)}`,
    };
  }
}
