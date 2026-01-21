// Telegram Bot API helpers
// Docs: https://core.telegram.org/bots/api

const TELEGRAM_API = 'https://api.telegram.org/bot';

/**
 * Get bot token from environment
 */
function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set');
  }
  return token;
}

/**
 * Make a request to Telegram Bot API
 */
async function telegramRequest<T>(method: string, body?: object): Promise<T> {
  const token = getBotToken();
  const url = `${TELEGRAM_API}${token}/${method}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Telegram API error: ${data.description}`);
  }

  return data.result;
}

/**
 * Send a text message
 */
export async function sendMessage(
  chatId: number | string,
  text: string,
  options?: {
    parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
    replyMarkup?: object;
    disableWebPagePreview?: boolean;
  }
) {
  return telegramRequest('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: options?.parseMode || 'HTML',
    reply_markup: options?.replyMarkup,
    disable_web_page_preview: options?.disableWebPagePreview,
  });
}

/**
 * Send Web App button
 */
export async function sendWebAppButton(
  chatId: number | string,
  text: string,
  buttonText: string,
  webAppUrl: string
) {
  return sendMessage(chatId, text, {
    replyMarkup: {
      inline_keyboard: [
        [
          {
            text: buttonText,
            web_app: { url: webAppUrl },
          },
        ],
      ],
    },
  });
}

/**
 * Send photo with caption and optional buttons
 */
export async function sendPhoto(
  chatId: number | string,
  photoUrl: string,
  caption: string,
  options?: {
    parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
    replyMarkup?: object;
  }
) {
  return telegramRequest('sendPhoto', {
    chat_id: chatId,
    photo: photoUrl,
    caption,
    parse_mode: options?.parseMode || 'HTML',
    reply_markup: options?.replyMarkup,
  });
}

/**
 * Send photo with Web App button
 */
export async function sendPhotoWithWebApp(
  chatId: number | string,
  photoUrl: string,
  caption: string,
  buttons: Array<{ text: string; webAppUrl?: string; url?: string }>
) {
  const inlineKeyboard = buttons.map(btn => [{
    text: btn.text,
    ...(btn.webAppUrl ? { web_app: { url: btn.webAppUrl } } : { url: btn.url }),
  }]);

  return sendPhoto(chatId, photoUrl, caption, {
    replyMarkup: {
      inline_keyboard: inlineKeyboard,
    },
  });
}

/**
 * Set bot commands
 */
export async function setCommands(
  commands: Array<{ command: string; description: string }>,
  languageCode?: string
) {
  return telegramRequest('setMyCommands', {
    commands,
    language_code: languageCode,
  });
}

/**
 * Set Web App menu button (global default for all users)
 */
export async function setMenuButton(webAppUrl: string, text: string = 'Open App') {
  return telegramRequest('setChatMenuButton', {
    menu_button: {
      type: 'web_app',
      text,
      web_app: { url: webAppUrl },
    },
  });
}

/**
 * Set bot description (shown on bot profile)
 */
export async function setBotDescription(description: string, languageCode?: string) {
  return telegramRequest('setMyDescription', {
    description,
    language_code: languageCode,
  });
}

/**
 * Set bot short description (shown in chat list and share)
 */
export async function setBotShortDescription(shortDescription: string, languageCode?: string) {
  return telegramRequest('setMyShortDescription', {
    short_description: shortDescription,
    language_code: languageCode,
  });
}

/**
 * Get webhook info
 */
export async function getWebhookInfo() {
  return telegramRequest('getWebhookInfo');
}

/**
 * Set webhook URL
 */
export async function setWebhook(url: string, options?: { secretToken?: string }) {
  return telegramRequest('setWebhook', {
    url,
    secret_token: options?.secretToken,
    allowed_updates: ['message', 'callback_query', 'pre_checkout_query', 'successful_payment'],
  });
}

/**
 * Delete webhook
 */
export async function deleteWebhook() {
  return telegramRequest('deleteWebhook');
}

/**
 * Create invoice link for Telegram Stars payment
 */
export async function createInvoiceLink(
  title: string,
  description: string,
  payload: string,
  prices: Array<{ label: string; amount: number }>
) {
  return telegramRequest<string>('createInvoiceLink', {
    title,
    description,
    payload,
    provider_token: '', // Empty for Telegram Stars
    currency: 'XTR', // Telegram Stars currency
    prices,
  });
}

/**
 * Answer pre-checkout query
 */
export async function answerPreCheckoutQuery(
  preCheckoutQueryId: string,
  ok: boolean,
  errorMessage?: string
) {
  return telegramRequest('answerPreCheckoutQuery', {
    pre_checkout_query_id: preCheckoutQueryId,
    ok,
    error_message: errorMessage,
  });
}

/**
 * Verify Telegram Web App init data
 */
export function verifyWebAppData(initData: string): boolean {
  const crypto = require('crypto');
  const token = getBotToken();

  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');

  // Sort parameters alphabetically
  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // Create secret key
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(token)
    .digest();

  // Calculate hash
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return calculatedHash === hash;
}

/**
 * Parse Telegram Web App init data
 */
export function parseWebAppData(initData: string) {
  const urlParams = new URLSearchParams(initData);

  const userString = urlParams.get('user');
  const user = userString ? JSON.parse(userString) : null;

  return {
    user,
    authDate: urlParams.get('auth_date'),
    hash: urlParams.get('hash'),
    queryId: urlParams.get('query_id'),
    startParam: urlParams.get('start_param'),
  };
}
