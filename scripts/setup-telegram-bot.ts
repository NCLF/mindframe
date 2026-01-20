/**
 * Setup Telegram Bot
 *
 * Run this script after deploying to set up webhook and commands:
 * npx tsx scripts/setup-telegram-bot.ts
 *
 * Required environment variables:
 * - TELEGRAM_BOT_TOKEN
 * - NEXT_PUBLIC_APP_URL (e.g., https://mindframe.space)
 */

const TELEGRAM_API = 'https://api.telegram.org/bot';

async function telegramRequest(token: string, method: string, body?: object) {
  const response = await fetch(`${TELEGRAM_API}${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Telegram API error: ${data.description}`);
  }

  return data.result;
}

async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!token) {
    console.error('❌ TELEGRAM_BOT_TOKEN is not set');
    process.exit(1);
  }

  if (!appUrl) {
    console.error('❌ NEXT_PUBLIC_APP_URL is not set');
    process.exit(1);
  }

  console.log('🤖 Setting up MindFrame Telegram Bot...\n');

  // 1. Get bot info
  console.log('📋 Getting bot info...');
  const botInfo = await telegramRequest(token, 'getMe');
  console.log(`   Bot: @${botInfo.username} (${botInfo.first_name})`);
  console.log(`   ID: ${botInfo.id}\n`);

  // 2. Set webhook
  console.log('🔗 Setting webhook...');
  const webhookUrl = `${appUrl}/api/webhook/telegram`;
  await telegramRequest(token, 'setWebhook', {
    url: webhookUrl,
    allowed_updates: ['message', 'callback_query', 'pre_checkout_query', 'successful_payment'],
  });
  console.log(`   Webhook: ${webhookUrl}\n`);

  // 3. Set commands (Russian)
  console.log('📝 Setting commands (RU)...');
  await telegramRequest(token, 'setMyCommands', {
    commands: [
      { command: 'start', description: 'Начать' },
      { command: 'help', description: 'Помощь' },
      { command: 'settings', description: 'Настройки' },
    ],
    language_code: 'ru',
  });
  console.log('   ✓ Russian commands set\n');

  // 4. Set commands (English)
  console.log('📝 Setting commands (EN)...');
  await telegramRequest(token, 'setMyCommands', {
    commands: [
      { command: 'start', description: 'Start' },
      { command: 'help', description: 'Help' },
      { command: 'settings', description: 'Settings' },
    ],
    language_code: 'en',
  });
  console.log('   ✓ English commands set\n');

  // 5. Set menu button (Web App)
  console.log('🔘 Setting menu button...');
  await telegramRequest(token, 'setChatMenuButton', {
    menu_button: {
      type: 'web_app',
      text: '✨ Open',
      web_app: { url: `${appUrl}/generate` },
    },
  });
  console.log('   ✓ Menu button set\n');

  // 6. Verify webhook
  console.log('✅ Verifying webhook...');
  const webhookInfo = await telegramRequest(token, 'getWebhookInfo');
  console.log(`   URL: ${webhookInfo.url}`);
  console.log(`   Pending updates: ${webhookInfo.pending_update_count}`);
  console.log(`   Last error: ${webhookInfo.last_error_message || 'None'}\n`);

  console.log('🎉 Bot setup complete!');
  console.log(`\nOpen https://t.me/${botInfo.username} to test the bot.`);
}

main().catch(console.error);
