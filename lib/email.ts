import { send, EmailJSResponseStatus } from "@emailjs/react-native";

const SERVICE_ID = "service_064xew8";
const TEMPLATE_ID = "template_wsst13o";
const PUBLIC_KEY = "Pm-Y1bsSWG3BCOPbr";

interface SendUpdateParams {
  customerName: string;
  customerEmail: string;
  stepName: string;
  subject: string;
  body: string;
  businessName: string;
}

/**
 * Replace template variables in a string.
 * Supported: {{customer_name}}, {{step_name}}, {{business_name}}, {{date}}
 */
export function replaceTemplateVariables(
  text: string,
  variables: {
    customerName: string;
    stepName: string;
    businessName: string;
  }
): string {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return text
    .replace(/\{\{customer_name\}\}/g, variables.customerName)
    .replace(/\{\{step_name\}\}/g, variables.stepName)
    .replace(/\{\{business_name\}\}/g, variables.businessName)
    .replace(/\{\{date\}\}/g, today);
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
  subject,
  body,
  businessName,
}: SendUpdateParams): Promise<{ success: boolean; message: string }> {
  const variables = { customerName, stepName, businessName };
  const renderedSubject = replaceTemplateVariables(subject, variables);
  const renderedBody = replaceTemplateVariables(body, variables);

  try {
    await send(SERVICE_ID, TEMPLATE_ID, {
      to_name: customerName,
      to_email: customerEmail,
      step_name: stepName,
      from_name: businessName,
      subject: renderedSubject,
      message: renderedBody,
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
