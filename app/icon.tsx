import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
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
          borderRadius: 7,
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            border: '2px solid #22d3ee',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: 2,
              height: 6,
              background: '#22d3ee',
              borderRadius: 1,
              top: 1,
              left: '50%',
              transformOrigin: 'bottom center',
              transform: 'translateX(-50%) rotate(30deg)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 2,
              height: 4,
              background: '#22d3ee',
              borderRadius: 1,
              top: 3,
              left: '50%',
              transformOrigin: 'bottom center',
              transform: 'translateX(-50%) rotate(-60deg)',
            }}
          />
          <div style={{ width: 2, height: 2, background: '#22d3ee', borderRadius: '50%' }} />
        </div>
      </div>
    ),
    { ...size }
  )
}
