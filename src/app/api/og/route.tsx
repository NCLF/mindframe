import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Background orbs */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(139, 92, 246, 0.3)',
            filter: 'blur(80px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -100,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(59, 130, 246, 0.3)',
            filter: 'blur(80px)',
          }}
        />

        {/* Brain emoji */}
        <div
          style={{
            fontSize: 100,
            marginBottom: 20,
          }}
        >
          🧠
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 20,
            textAlign: 'center',
          }}
        >
          MindFrame
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 32,
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          Твой голос — самый мощный инструмент
        </div>

        {/* Features row */}
        <div
          style={{
            display: 'flex',
            gap: 40,
            marginTop: 50,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'rgba(139, 92, 246, 0.2)',
              padding: '16px 24px',
              borderRadius: 16,
            }}
          >
            <span style={{ fontSize: 28 }}>🎙</span>
            <span style={{ color: '#e2e8f0', fontSize: 24 }}>Клон голоса</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'rgba(59, 130, 246, 0.2)',
              padding: '16px 24px',
              borderRadius: 16,
            }}
          >
            <span style={{ fontSize: 28 }}>🤖</span>
            <span style={{ color: '#e2e8f0', fontSize: 24 }}>AI аффирмации</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'rgba(6, 182, 212, 0.2)',
              padding: '16px 24px',
              borderRadius: 16,
            }}
          >
            <span style={{ fontSize: 28 }}>🎧</span>
            <span style={{ color: '#e2e8f0', fontSize: 24 }}>40Hz ритмы</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
