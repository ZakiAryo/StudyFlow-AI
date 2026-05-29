type WhatsAppMode = "template" | "text";

type SendWhatsAppReminderInput = {
  to: string;
  body: string;
  templateParameters?: string[];
};

type WhatsAppMessageResponse = {
  mode: WhatsAppMode;
  providerMessageId: string | null;
  raw: unknown;
};

type WhatsAppEnv = {
  accessToken: string;
  phoneNumberId: string;
  graphApiVersion: string;
  templateName: string | null;
  templateLanguage: string;
};

export class WhatsAppConfigError extends Error {
  code = "MISSING_WHATSAPP_ENV";
}

export class WhatsAppApiError extends Error {
  code = "WHATSAPP_API_ERROR";

  constructor(
    message: string,
    readonly status: number,
    readonly responseBody: string,
  ) {
    super(message);
  }
}

function getWhatsAppEnv(): WhatsAppEnv {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const graphApiVersion = process.env.WHATSAPP_GRAPH_API_VERSION ?? "v23.0";
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME?.trim() || null;
  const templateLanguage =
    process.env.WHATSAPP_TEMPLATE_LANGUAGE?.trim() || "id";

  if (!accessToken || !phoneNumberId) {
    throw new WhatsAppConfigError(
      "WhatsApp belum dikonfigurasi. Isi WHATSAPP_ACCESS_TOKEN dan WHATSAPP_PHONE_NUMBER_ID di environment server.",
    );
  }

  return {
    accessToken,
    phoneNumberId,
    graphApiVersion,
    templateName,
    templateLanguage,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeWhatsAppNumber(value: string) {
  return value.replace(/[^\d]/g, "");
}

function getProviderMessageId(response: unknown) {
  if (!isRecord(response) || !Array.isArray(response.messages)) {
    return null;
  }

  const [message] = response.messages;

  if (!isRecord(message) || typeof message.id !== "string") {
    return null;
  }

  return message.id;
}

function buildTemplatePayload({
  to,
  body,
  templateParameters,
  templateName,
  templateLanguage,
}: SendWhatsAppReminderInput & {
  templateName: string;
  templateLanguage: string;
}) {
  const parameters =
    templateParameters && templateParameters.length > 0
      ? templateParameters
      : [body];

  return {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: templateLanguage,
      },
      components: [
        {
          type: "body",
          parameters: parameters.map((text) => ({
            type: "text",
            text,
          })),
        },
      ],
    },
  };
}

function buildTextPayload({ to, body }: SendWhatsAppReminderInput) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: {
      preview_url: false,
      body,
    },
  };
}

export async function sendWhatsAppReminder({
  to,
  body,
  templateParameters,
}: SendWhatsAppReminderInput): Promise<WhatsAppMessageResponse> {
  const env = getWhatsAppEnv();
  const recipient = normalizeWhatsAppNumber(to);

  if (!recipient) {
    throw new Error("Nomor WhatsApp tujuan tidak valid.");
  }

  const mode: WhatsAppMode = env.templateName ? "template" : "text";
  const payload = env.templateName
    ? buildTemplatePayload({
        to: recipient,
        body,
        templateParameters,
        templateName: env.templateName,
        templateLanguage: env.templateLanguage,
      })
    : buildTextPayload({ to: recipient, body });

  const response = await fetch(
    `https://graph.facebook.com/${env.graphApiVersion}/${env.phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const responseText = await response.text();
  let responseJson: unknown = null;

  try {
    responseJson = responseText ? JSON.parse(responseText) : null;
  } catch {
    responseJson = responseText;
  }

  if (!response.ok) {
    throw new WhatsAppApiError(
      "Gagal mengirim pesan WhatsApp.",
      response.status,
      responseText,
    );
  }

  return {
    mode,
    providerMessageId: getProviderMessageId(responseJson),
    raw: responseJson,
  };
}
