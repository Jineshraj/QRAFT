import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { buildUPIString, hexToRgb, formatINR } from '../utils/upi'

const SIZES = {
  sm: { width: 270, qr: 130, font: 13 },
  md: { width: 330, qr: 162, font: 15 },
  lg: { width: 400, qr: 200, font: 17 },
  sq: { width: 360, qr: 172, font: 15 },
}

export default function QRLabel({ state }) {
  const { upiId, payee, amount, note, bizName, tagline, logoDataUrl,
          primaryColor, bgColor, textColor, qrColor, frame, size } = state

  const sz = SIZES[size] || SIZES.md
  const upiStr = buildUPIString({ upiId, payee, amount, note })
  const rgb = hexToRgb(primaryColor)
  const textRgb = hexToRgb(textColor)

  const containerStyle = {
    width: sz.width,
    background: bgColor,
    fontFamily: "'Outfit', sans-serif",
    overflow: 'hidden',
    ...(frame === 'minimal' && {
      borderRadius: 20,
      boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
    }),
    ...(frame === 'bordered' && {
      borderRadius: 20,
      border: `5px solid ${primaryColor}`,
      boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
    }),
    ...(frame === 'badge' && {
      borderRadius: 20,
      overflow: 'hidden',
      boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
    }),
    ...(frame === 'receipt' && {
      borderRadius: 10,
      border: `2px dashed ${primaryColor}`,
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    }),
  }

  const innerPad = frame === 'badge' ? '14px 24px 24px' : '24px'

  return (
    <div id="label-inner" style={containerStyle}>

      {frame === 'badge' && (
        <div style={{
          background: primaryColor,
          padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          {logoDataUrl && (
            <img src={logoDataUrl} alt="logo" style={{
              width: 42, height: 42, borderRadius: 8,
              objectFit: 'contain', background: 'rgba(255,255,255,0.95)', padding: 3,
            }}/>
          )}
          <div>
            <div style={{ color: 'white', fontSize: sz.font + 2, fontWeight: 700, letterSpacing: '-0.01em' }}>{bizName}</div>
            {tagline && <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: sz.font - 2, marginTop: 2 }}>{tagline}</div>}
          </div>
        </div>
      )}

      <div style={{ padding: innerPad, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>

        {frame !== 'badge' && (bizName || logoDataUrl) && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%' }}>
            {logoDataUrl && (
              <img src={logoDataUrl} alt="logo" style={{
                width: 60, height: 60, borderRadius: 12,
                objectFit: 'contain', border: `1.5px solid rgba(${rgb},0.2)`,
                background: 'white', padding: 4,
              }}/>
            )}
            {bizName && (
              <div style={{ fontSize: sz.font + 4, fontWeight: 700, color: textColor, textAlign: 'center', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                {bizName}
              </div>
            )}
            {tagline && (
              <div style={{ fontSize: sz.font - 2, color: primaryColor, textAlign: 'center', letterSpacing: '0.05em', fontWeight: 500 }}>
                {tagline}
              </div>
            )}
          </div>
        )}

        {frame !== 'badge' && (bizName || logoDataUrl) && (
          <div style={{ width: '100%', height: '1px', background: `rgba(${rgb},0.15)` }}/>
        )}

        {/* QR */}
        <div style={{
          padding: 14, background: 'white', borderRadius: 14,
          border: `1.5px solid rgba(${rgb},0.18)`,
          boxShadow: `0 4px 20px rgba(${rgb},0.12)`,
          lineHeight: 0,
        }}>
          <QRCodeSVG
            value={upiStr || 'upi://pay?pa=pay@upi'}
            size={sz.qr}
            fgColor={qrColor}
            bgColor="#ffffff"
            level="M"
          />
        </div>

        {/* Info */}
        <div style={{ textAlign: 'center', width: '100%' }}>
          <div style={{ fontSize: sz.font + 3, fontWeight: 700, color: textColor, letterSpacing: '-0.01em' }}>
            {payee || 'Merchant'}
          </div>
          <div style={{ fontSize: sz.font - 2, color: primaryColor, marginTop: 3, fontFamily: 'monospace', fontWeight: 500 }}>
            {upiId || 'upi@bank'}
          </div>

          {amount && parseFloat(amount) > 0 && (
            <div style={{ marginTop: 10 }}>
              <span style={{
                display: 'inline-block',
                background: primaryColor,
                color: 'white',
                fontSize: sz.font + 4,
                fontWeight: 700,
                padding: '5px 20px',
                borderRadius: 30,
                letterSpacing: '-0.01em',
              }}>
                ₹{formatINR(amount)}
              </span>
            </div>
          )}

          {note && (
            <div style={{
              fontSize: sz.font - 3,
              color: `rgba(${textRgb},0.5)`,
              marginTop: 7,
            }}>
              {note}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          borderTop: `1px solid rgba(${rgb},0.12)`,
          paddingTop: 12, width: '100%', justifyContent: 'center',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill={primaryColor} opacity="0.7">
            <path d="M3 11h8V3H3zm2-6h4v4H5zM3 21h8v-8H3zm2-6h4v4H5zM13 3v8h8V3zm6 6h-4V5h4zM13 13h2v2h-2zm2 2h2v2h-2zm2-2h2v2h-2zm-4 4h2v2h-2zm2 2h2v2h-2zm2-2h2v2h-2zm-4 4h2v2h-2zm4 0h2v2h-2z"/>
          </svg>
          <span style={{
            fontSize: 9.5, letterSpacing: '0.1em',
            color: `rgba(${textRgb},0.4)`, fontWeight: 600,
          }}>
            SCAN & PAY · UPI
          </span>
        </div>

      </div>
    </div>
  )
}
