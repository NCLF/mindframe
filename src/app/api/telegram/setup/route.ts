import { NextRequest, NextResponse } from 'next/server';
import { setWebhook, setCommands, setMenuButton, setBotDescription, setBotShortDescription } from '@/lib/telegram';

// Setup endpoint for configuring the Telegram bot
// Call this once after deployment: GET /api/telegram/setup?secret=YOUR_SECRET
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  // Simple protection - require a secret
  const expectedSecret = process.env.TELEGRAM_SETUP_SECRET || 'mindframe-setup-2024';
  if (secret !== expectedSecret) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mindframe.space';
  const webhookUrl = `${appUrl}/api/webhook/telegram`;

  try {
    // 1. Set webhook
    await setWebhook(webhookUrl);
    console.log('Webhook set to:', webhookUrl);

    // 2. Set commands for Russian
    await setCommands(
      [
        { command: 'start', description: 'Главное меню' },
        { command: 'help', description: 'Помощь' },
        { command: 'settings', description: 'Настройки' },
      ],
      'ru'
    );

    // 3. Set commands for English
    await setCommands(
      [
        { command: 'start', description: 'Main menu' },
        { command: 'help', description: 'Help' },
        { command: 'settings', description: 'Settings' },
      ],
      'en'
    );

    // 4. Set default commands (for other languages)
    await setCommands([
      { command: 'start', description: 'Start' },
      { command: 'help', description: 'Help' },
      { command: 'settings', description: 'Settings' },
    ]);

    // 5. Set menu button (opens web app directly)
    await setMenuButton(`${appUrl}/ru/generate`, '🧠 Открыть');

    // 6. Set bot descriptions (shown before START)
    await setBotDescription(
      '🧠 Mental Utility для управления состоянием мозга\n\n' +
      '✨ AI создаёт персональные нейро-сессии\n' +
      '🎙 Озвучка идеализированной версией твоего голоса\n' +
      '🎧 Бинауральные ритмы для синхронизации полушарий\n\n' +
      '🎁 3 сессии бесплатно. Без регистрации.',
      'ru'
    );

    await setBotDescription(
      '🧠 Mental Utility for brain state management\n\n' +
      '✨ AI creates personalized neuro-sessions\n' +
      '🎙 Voiced by idealized version of your voice\n' +
      '🎧 Binaural beats for hemisphere synchronization\n\n' +
      '🎁 3 sessions free. No registration.',
      'en'
    );

    // 7. Set short descriptions (shown in share/search)
    await setBotShortDescription(
      '🧠 Нейро-сессии с твоим голосом. Настрой мозг как профессионал.',
      'ru'
    );

    await setBotShortDescription(
      '🧠 Neuro-sessions with your voice. Tune your brain like a pro.',
      'en'
    );

    return NextResponse.json({
      success: true,
      message: 'Bot configured successfully',
      webhook: webhookUrl,
      appUrl,
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Setup failed',
      },
      { status: 500 }
    );
  }
}
// Trigger redeploy 1768921789
