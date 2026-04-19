import { send, EmailJSResponseStatus } from "@emailjs/react-native";

const SERVICE_ID = "service_064xew8";
const TEMPLATE_ID = "template_wsst13o";
const PUBLIC_KEY = "Pm-Y1bsSWG3BCOPbr";

interface SendUpdateParams {
  customerName: string;
  customerEmail: string;
  stepName: string;
  product?: string;
  issue?: string;
  estimatedDate?: number;
  subject?: string;
  body?: string;
  businessName?: string;
}

export function replaceTemplateVariables(
  text: string,
  variables: {
    customerName: string;
    stepName: string;
    businessName: string;
    product?: string;
    issue?: string;
    estimatedDate?: number;
  }
): string {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let dateStr = "";
  if (variables.estimatedDate) {
    dateStr = new Date(variables.estimatedDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return text
    .replace(/\{\{customer_name\}\}/g, variables.customerName)
    .replace(/\{\{step_name\}\}/g, variables.stepName)
    .replace(/\{\{business_name\}\}/g, variables.businessName || "Your Business")
    .replace(/\{\{date\}\}/g, today)
    .replace(/\{\{estimated_date\}\}/g, dateStr)
    .replace(/\{\{product\}\}/g, variables.product || "")
    .replace(/\{\{issue\}\}/g, variables.issue || "");
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
  product,
  issue,
  estimatedDate,
  subject,
  body,
  businessName,
}: SendUpdateParams): Promise<{ success: boolean; message: string }> {
  const variables = { customerName, stepName, businessName: businessName || "Your Business", product, issue, estimatedDate };
  const renderedSubject = subject
    ? replaceTemplateVariables(subject, variables)
    : `Update: ${stepName}`;
  const renderedBody = body
    ? replaceTemplateVariables(body, variables)
    : buildDefaultEmail(variables);

  try {
    await send(SERVICE_ID, TEMPLATE_ID, {
      to_name: customerName,
      to_email: customerEmail,
      step_name: stepName,
      from_name: businessName || "Your Business",
      subject: renderedSubject,
      message: renderedBody,
      product: product || "",
      issue: issue || "",
      estimated_date: estimatedDate ? new Date(estimatedDate).toLocaleDateString() : "",
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

function buildDefaultEmail(vars: {
  customerName: string;
  stepName: string;
  businessName: string;
  product?: string;
  issue?: string;
  estimatedDate?: number;
}): string {
  let email = `Hi ${vars.customerName},

Your order status has been updated to: ${vars.stepName}.`;

  if (vars.product || vars.issue) {
    email += `\n\nProduct: ${vars.product || "N/A"}\nIssue: ${vars.issue || "N/A"}`;
  }

  if (vars.estimatedDate) {
    const dateStr = new Date(vars.estimatedDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    email += `\n\nEstimated completion: ${dateStr}`;
  }

  email += `\n\nBest regards,\n${vars.businessName}`;

  return email;
}