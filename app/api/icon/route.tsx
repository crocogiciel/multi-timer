import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export function GET(req: NextRequest) {
  const size = Math.min(512, Math.max(16, parseInt(req.nextUrl.searchParams.get('size') ?? '192')))
  const r = Math.floor(size * 0.22)
  const ring = Math.floor(size * 0.46)
  const stroke = Math.max(2, Math.floor(size * 0.04))
  const dot = Math.max(3, Math.floor(size * 0.06))

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: r,
        }}
      >
        {/* Clock ring */}
        <div
          style={{
            width: ring,
            height: ring,
            border: `${stroke}px solid #22d3ee`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Minute hand (pointing ~1 o'clock) */}
          <div
            style={{
              position: 'absolute',
              width: stroke,
              height: Math.floor(ring * 0.36),
              background: '#22d3ee',
              borderRadius: stroke,
              top: Math.floor(ring * 0.09),
              left: '50%',
              transformOrigin: 'bottom center',
              transform: `translateX(-50%) rotate(30deg)`,
            }}
          />
          {/* Hour hand (pointing ~10 o'clock) */}
          <div
            style={{
              position: 'absolute',
              width: stroke,
              height: Math.floor(ring * 0.26),
              background: '#22d3ee',
              borderRadius: stroke,
              top: Math.floor(ring * 0.24),
              left: '50%',
              transformOrigin: 'bottom center',
              transform: `translateX(-50%) rotate(-60deg)`,
            }}
          />
          {/* Center dot */}
          <div
            style={{
              width: dot,
              height: dot,
              background: '#22d3ee',
              borderRadius: '50%',
            }}
          />
        </div>
      </div>
    ),
    { width: size, height: size }
  )
}
