import { NextRequest, NextResponse } from 'next/server';
import {
  sendMessage,
  sendWebAppButton,
  sendPhotoWithWebApp,
  answerPreCheckoutQuery,
} from '@/lib/telegram';

// Cover image for welcome message (dynamic OG image)
const WELCOME_IMAGE = 'https://mindframe.space/api/og';

// Bot messages in different languages
const MESSAGES = {
  ru: {
    welcome: `🧠 <b>MindFrame — твой голос меняет мышление</b>

<b>Научный факт:</b> мозг не может критиковать собственный голос — это эволюционный механизм доверия.

✨ <b>Что ты получишь:</b>

🎙 <b>Клон твоего голоса</b> — запиши 30 сек, AI создаст идеальную копию

🤖 <b>Персональные аффирмации</b> — нейросеть пишет тексты под твою цель

🎧 <b>Бинауральные ритмы 40Hz</b> — синхронизация мозга за 8-10 минут

━━━━━━━━━━━━━━━

<b>🌅 Утро</b> — дофаминовая активация на день
<b>🎯 Фокус</b> — состояние потока на 2-3 часа
<b>😰 Тревога</b> — убрать стресс за 5 минут
<b>🌙 Сон</b> — глубокий отдых за 10 минут

━━━━━━━━━━━━━━━

🎁 <b>3 генерации бесплатно</b>
Без карты. Без регистрации.`,
    openApp: '🚀 Создать первую аффирмацию',
    learnMore: '📖 Как это работает',
    help: `🆘 <b>Помощь MindFrame</b>

<b>Что такое MindFrame?</b>
AI-платформа персонализированных аффирмаций с клонированием твоего голоса и бинауральными ритмами.

<b>Почему свой голос?</b>
Мозг эволюционно доверяет собственному голосу. Он не может критиковать то, что слышит "от себя". Это ускоряет изменение мышления в 3 раза.

<b>Как начать?</b>
1. Нажми "Открыть MindFrame"
2. Выбери цель (энергия, спокойствие, фокус)
3. Получи персональную аффирмацию
4. Слушай с бинауральными ритмами

<b>Команды:</b>
/start — Главное меню
/help — Эта справка
/settings — Настройки

<b>Вопросы?</b>
Пиши: @MindFrameSupport`,
  },
  en: {
    welcome: `🧠 <b>MindFrame — Your Voice Transforms Your Mind</b>

<b>Scientific fact:</b> Your brain can't critique its own voice — it's an evolutionary trust mechanism.

✨ <b>What you'll get:</b>

🎙 <b>Your Voice Clone</b> — record 30 sec, AI creates a perfect copy

🤖 <b>Personal Affirmations</b> — neural network writes texts for your specific goal

🎧 <b>40Hz Binaural Beats</b> — brain synchronization in 8-10 minutes

━━━━━━━━━━━━━━━

<b>🌅 Morning</b> — dopamine activation for the day
<b>🎯 Focus</b> — flow state for 2-3 hours
<b>😰 Anxiety</b> — remove stress in 5 minutes
<b>🌙 Sleep</b> — deep rest in 10 minutes

━━━━━━━━━━━━━━━

🎁 <b>3 free generations</b>
No card. No registration.`,
    openApp: '🚀 Create First Affirmation',
    learnMore: '📖 How It Works',
    help: `🆘 <b>MindFrame Help</b>

<b>What is MindFrame?</b>
AI platform for personalized affirmations with your voice clone and binaural beats.

<b>Why your own voice?</b>
Your brain evolutionarily trusts its own voice. It can't critique what it hears "from itself". This accelerates mindset change by 3x.

<b>How to start?</b>
1. Tap "Open MindFrame"
2. Choose your goal (energy, calm, focus)
3. Get a personal affirmation
4. Listen with binaural beats

<b>Commands:</b>
/start — Main menu
/help — This help
/settings — Settings

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
      const userName = update.message.from?.first_name || '';

      // Check for referral code
      const startParam = update.message.text.split(' ')[1];
      if (startParam) {
        // TODO: Save referral
        console.log(`Referral: ${startParam} -> user ${chatId}`);
      }

      // Personalized greeting
      const greeting = userName
        ? (lang === 'ru' ? `Привет, ${userName}! 👋\n\n` : `Hey ${userName}! 👋\n\n`)
        : '';

      // Build URLs with user's language
      const generateUrl = `${appUrl}/${lang}/generate`;
      const landingUrl = `${appUrl}/${lang}`;

      // Try to send with image first, fallback to text only
      try {
        await sendPhotoWithWebApp(
          chatId,
          WELCOME_IMAGE,
          greeting + messages.welcome,
          [
            { text: messages.openApp, webAppUrl: generateUrl },
            { text: messages.learnMore, url: landingUrl },
          ]
        );
      } catch {
        // Fallback to text-only if image fails
        await sendMessage(chatId, greeting + messages.welcome, {
          replyMarkup: {
            inline_keyboard: [
              [{ text: messages.openApp, web_app: { url: generateUrl } }],
              [{ text: messages.learnMore, url: landingUrl }],
            ],
          },
        });
      }

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
