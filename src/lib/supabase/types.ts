export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          telegram_id: number | null;
          display_name: string | null;
          subscription_tier: 'free' | 'basic' | 'pro';
          subscription_expires_at: string | null;
          voice_clone_id: string | null;
          referral_code: string | null;
          referred_by: string | null;
          generations_count: number;
          generations_limit: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          telegram_id?: number | null;
          display_name?: string | null;
          subscription_tier?: 'free' | 'basic' | 'pro';
          subscription_expires_at?: string | null;
          voice_clone_id?: string | null;
          referral_code?: string | null;
          referred_by?: string | null;
          generations_count?: number;
          generations_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          telegram_id?: number | null;
          display_name?: string | null;
          subscription_tier?: 'free' | 'basic' | 'pro';
          subscription_expires_at?: string | null;
          voice_clone_id?: string | null;
          referral_code?: string | null;
          referred_by?: string | null;
          generations_count?: number;
          generations_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      scenarios: {
        Row: {
          id: string;
          slug: string;
          name_ru: string;
          name_en: string;
          description_ru: string | null;
          description_en: string | null;
          system_prompt: string;
          voice_settings: Json;
          binaural_preset: 'alpha' | 'beta' | 'gamma' | 'theta' | 'delta';
          audio_background: string | null;
          is_premium: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_ru: string;
          name_en: string;
          description_ru?: string | null;
          description_en?: string | null;
          system_prompt: string;
          voice_settings?: Json;
          binaural_preset?: 'alpha' | 'beta' | 'gamma' | 'theta' | 'delta';
          audio_background?: string | null;
          is_premium?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name_ru?: string;
          name_en?: string;
          description_ru?: string | null;
          description_en?: string | null;
          system_prompt?: string;
          voice_settings?: Json;
          binaural_preset?: 'alpha' | 'beta' | 'gamma' | 'theta' | 'delta';
          audio_background?: string | null;
          is_premium?: boolean;
          sort_order?: number;
          created_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          slug: string;
          name_ru: string;
          name_en: string;
          category: 'goal' | 'emotion' | 'situation';
          prompt_snippet: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_ru: string;
          name_en: string;
          category?: 'goal' | 'emotion' | 'situation';
          prompt_snippet?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name_ru?: string;
          name_en?: string;
          category?: 'goal' | 'emotion' | 'situation';
          prompt_snippet?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      generations: {
        Row: {
          id: string;
          user_id: string;
          scenario_id: string | null;
          input_type: 'tags' | 'voice' | 'text';
          input_tags: string[] | null;
          input_text: string | null;
          input_audio_url: string | null;
          generated_text: string | null;
          voice_type: 'default' | 'cloned';
          voice_id: string | null;
          tts_audio_url: string | null;
          final_audio_url: string | null;
          audio_duration_seconds: number | null;
          binaural_frequency: string | null;
          processing_status: 'pending' | 'processing' | 'completed' | 'failed';
          error_message: string | null;
          llm_tokens_used: number | null;
          tts_characters_used: number | null;
          estimated_cost_usd: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          scenario_id?: string | null;
          input_type: 'tags' | 'voice' | 'text';
          input_tags?: string[] | null;
          input_text?: string | null;
          input_audio_url?: string | null;
          generated_text?: string | null;
          voice_type?: 'default' | 'cloned';
          voice_id?: string | null;
          tts_audio_url?: string | null;
          final_audio_url?: string | null;
          audio_duration_seconds?: number | null;
          binaural_frequency?: string | null;
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed';
          error_message?: string | null;
          llm_tokens_used?: number | null;
          tts_characters_used?: number | null;
          estimated_cost_usd?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          scenario_id?: string | null;
          input_type?: 'tags' | 'voice' | 'text';
          input_tags?: string[] | null;
          input_text?: string | null;
          input_audio_url?: string | null;
          generated_text?: string | null;
          voice_type?: 'default' | 'cloned';
          voice_id?: string | null;
          tts_audio_url?: string | null;
          final_audio_url?: string | null;
          audio_duration_seconds?: number | null;
          binaural_frequency?: string | null;
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed';
          error_message?: string | null;
          llm_tokens_used?: number | null;
          tts_characters_used?: number | null;
          estimated_cost_usd?: number | null;
          created_at?: string;
        };
      };
      library: {
        Row: {
          id: string;
          user_id: string;
          generation_id: string;
          title: string | null;
          is_favorite: boolean;
          play_count: number;
          last_played_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          generation_id: string;
          title?: string | null;
          is_favorite?: boolean;
          play_count?: number;
          last_played_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          generation_id?: string;
          title?: string | null;
          is_favorite?: boolean;
          play_count?: number;
          last_played_at?: string | null;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          provider: 'telegram_stars' | 'lemon_squeezy' | 'yookassa';
          provider_subscription_id: string | null;
          tier: 'basic' | 'pro';
          status: 'active' | 'cancelled' | 'past_due';
          current_period_start: string | null;
          current_period_end: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: 'telegram_stars' | 'lemon_squeezy' | 'yookassa';
          provider_subscription_id?: string | null;
          tier: 'basic' | 'pro';
          status?: 'active' | 'cancelled' | 'past_due';
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: 'telegram_stars' | 'lemon_squeezy' | 'yookassa';
          provider_subscription_id?: string | null;
          tier?: 'basic' | 'pro';
          status?: 'active' | 'cancelled' | 'past_due';
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
        };
      };
      referrals: {
        Row: {
          id: string;
          referrer_id: string;
          referred_id: string;
          status: 'pending' | 'converted' | 'paid';
          commission_amount: number | null;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          referrer_id: string;
          referred_id: string;
          status?: 'pending' | 'converted' | 'paid';
          commission_amount?: number | null;
          paid_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          referrer_id?: string;
          referred_id?: string;
          status?: 'pending' | 'converted' | 'paid';
          commission_amount?: number | null;
          paid_at?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      subscription_tier: 'free' | 'basic' | 'pro';
      processing_status: 'pending' | 'processing' | 'completed' | 'failed';
      binaural_preset: 'alpha' | 'beta' | 'gamma' | 'theta' | 'delta';
      input_type: 'tags' | 'voice' | 'text';
      voice_type: 'default' | 'cloned';
      tag_category: 'goal' | 'emotion' | 'situation';
      payment_provider: 'telegram_stars' | 'lemon_squeezy' | 'yookassa';
      subscription_status: 'active' | 'cancelled' | 'past_due';
      referral_status: 'pending' | 'converted' | 'paid';
    };
  };
};
