import { NextRequest, NextResponse } from 'next/server';
import { setWebhook, setCommands, setMenuButton } from '@/lib/telegram';

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

    // 5. Set menu button
    await setMenuButton(`${appUrl}/ru/generate`, '✨ MindFrame');

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
