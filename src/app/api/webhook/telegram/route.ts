import { NextRequest, NextResponse } from 'next/server';
import {
  sendMessage,
  sendWebAppButton,
  answerPreCheckoutQuery,
} from '@/lib/telegram';

// Bot messages in different languages
const MESSAGES = {
  ru: {
    welcome: `🧠 <b>Добро пожаловать в MindFrame!</b>

Я создаю персонализированные аффирмации с профессиональной озвучкой и бинауральными ритмами.

🎯 <b>Как это работает:</b>
1. Выбери свою цель (концентрация, спокойствие, энергия)
2. AI создаст персональную аффирмацию
3. Профессиональная озвучка + бинауральные ритмы
4. Слушай и трансформируй мышление!

Нажми кнопку ниже, чтобы начать 👇`,
    openApp: '✨ Открыть MindFrame',
    help: `🆘 <b>Помощь</b>

<b>Команды:</b>
/start - Начать
/help - Помощь
/settings - Настройки

<b>Вопросы?</b>
Пиши: @MindFrameSupport`,
  },
  en: {
    welcome: `🧠 <b>Welcome to MindFrame!</b>

I create personalized affirmations with professional voiceover and binaural beats.

🎯 <b>How it works:</b>
1. Choose your goal (focus, calm, energy)
2. AI creates a personal affirmation
3. Professional voiceover + binaural beats
4. Listen and transform your mindset!

Click the button below to start 👇`,
    openApp: '✨ Open MindFrame',
    help: `🆘 <b>Help</b>

<b>Commands:</b>
/start - Start
/help - Help
/settings - Settings

<b>Questions?</b>
Contact: @MindFrameSupport`,
  },
};

// Determine user language
function getUserLanguage(languageCode?: string): 'ru' | 'en' {
  if (languageCode?.startsWith('ru')) return 'ru';
  return 'en';
}

// Handle incoming webhook
export async function POST(request: NextRequest) {
  try {
    const update = await request.json();

    // Get app URL from environment
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mindframe.space';

    // Handle /start command
    if (update.message?.text?.startsWith('/start')) {
      const chatId = update.message.chat.id;
      const lang = getUserLanguage(update.message.from?.language_code);
      const messages = MESSAGES[lang];

      // Check for referral code
      const startParam = update.message.text.split(' ')[1];
      if (startParam) {
        // TODO: Save referral
        console.log(`Referral: ${startParam} -> user ${chatId}`);
      }

      // Send welcome message with Web App button
      await sendWebAppButton(
        chatId,
        messages.welcome,
        messages.openApp,
        `${appUrl}/generate`
      );

      return NextResponse.json({ ok: true });
    }

    // Handle /help command
    if (update.message?.text === '/help') {
      const chatId = update.message.chat.id;
      const lang = getUserLanguage(update.message.from?.language_code);

      await sendMessage(chatId, MESSAGES[lang].help);

      return NextResponse.json({ ok: true });
    }

    // Handle /settings command
    if (update.message?.text === '/settings') {
      const chatId = update.message.chat.id;
      const lang = getUserLanguage(update.message.from?.language_code);
      const messages = MESSAGES[lang];

      await sendWebAppButton(
        chatId,
        lang === 'ru' ? '⚙️ Открой настройки в приложении:' : '⚙️ Open settings in the app:',
        messages.openApp,
        `${appUrl}/settings`
      );

      return NextResponse.json({ ok: true });
    }

    // Handle pre-checkout query (Telegram Stars payment)
    if (update.pre_checkout_query) {
      const queryId = update.pre_checkout_query.id;

      // Always approve - actual validation happens later
      await answerPreCheckoutQuery(queryId, true);

      return NextResponse.json({ ok: true });
    }

    // Handle successful payment
    if (update.message?.successful_payment) {
      const chatId = update.message.chat.id;
      const payment = update.message.successful_payment;

      // Parse payload to get user and tier info
      const payload = JSON.parse(payment.invoice_payload);
      console.log('Payment received:', {
        userId: payload.userId,
        tier: payload.tier,
        amount: payment.total_amount,
        currency: payment.currency,
      });

      // TODO: Activate subscription in database

      const lang = getUserLanguage(update.message.from?.language_code);
      await sendMessage(
        chatId,
        lang === 'ru'
          ? '✅ Оплата прошла успешно! Твоя подписка активирована.'
          : '✅ Payment successful! Your subscription is now active.'
      );

      return NextResponse.json({ ok: true });
    }

    // Unknown update - just acknowledge
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ ok: false, error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'MindFrame Telegram Webhook',
  });
}
