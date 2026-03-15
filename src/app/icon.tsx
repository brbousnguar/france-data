import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#0055A4',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '4px 4px 3px',
          gap: 3,
        }}
      >
        {/* Bar chart bars — heights represent rising data */}
        <div style={{ width: 5, height: 8,  background: '#FFFFFF', borderRadius: 1 }} />
        <div style={{ width: 5, height: 13, background: '#FFFFFF', borderRadius: 1 }} />
        <div style={{ width: 5, height: 10, background: '#FFFFFF', borderRadius: 1 }} />
        <div style={{ width: 5, height: 17, background: '#EF4135', borderRadius: 1 }} />
      </div>
    ),
    { ...size }
  )
}
