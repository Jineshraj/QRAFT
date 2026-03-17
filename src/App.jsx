import React, { useState, useRef, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useGeneratorState } from './hooks/useGeneratorState'
import { buildUPIString, encodeShareParams, formatINR } from './utils/upi'
import { downloadPNG, downloadJPG, printLabel } from './utils/export'
import QRLabel from './components/QRLabel'

/* ─── Colour presets ─── */
const PRESETS = [
  { name: 'Forest',  primary: '#16a34a', bg: '#f0fdf4', text: '#14532d', qr: '#14532d' },
  { name: 'Ocean',   primary: '#0ea5e9', bg: '#f0f9ff', text: '#0c4a6e', qr: '#0c4a6e' },
  { name: 'Grape',   primary: '#7c3aed', bg: '#faf5ff', text: '#3b0764', qr: '#3b0764' },
  { name: 'Flame',   primary: '#ea580c', bg: '#fff7ed', text: '#7c2d12', qr: '#7c2d12' },
  { name: 'Rose',    primary: '#e11d48', bg: '#fff1f2', text: '#881337', qr: '#881337' },
  { name: 'Slate',   primary: '#475569', bg: '#f8fafc', text: '#0f172a', qr: '#0f172a' },
  { name: 'Gold',    primary: '#d97706', bg: '#fffbeb', text: '#78350f', qr: '#78350f' },
  { name: 'Teal',    primary: '#0d9488', bg: '#f0fdfa', text: '#134e4a', qr: '#134e4a' },
]

const FRAMES = [
  { id: 'minimal',  label: 'Clean',    desc: 'Floating card' },
  { id: 'bordered', label: 'Bold',     desc: 'Thick border' },
  { id: 'badge',    label: 'Banner',   desc: 'Header strip' },
  { id: 'receipt',  label: 'Receipt',  desc: 'Dashed edge' },
]

const SIZES = [
  { id: 'sm', label: 'S', w: '270', h: '~340' },
  { id: 'md', label: 'M', w: '330', h: '~410' },
  { id: 'lg', label: 'L', w: '400', h: '~500' },
  { id: 'sq', label: '▣', w: '360', h: '360' },
]

const STEPS = [
  { id: 'upi',     icon: '⬡', label: 'Payment' },
  { id: 'brand',   icon: '◈', label: 'Branding' },
  { id: 'design',  icon: '◉', label: 'Design' },
]

export default function App() {
  const { state, update, updateMany, reset } = useGeneratorState()
  const [step, setStep] = useState(0)
  const [exporting, setExporting] = useState(false)
  const [shareMsg, setShareMsg] = useState('')
  const [previewBig, setPreviewBig] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isNarrow, setIsNarrow] = useState(false)
  const logoRef = useRef()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 980px)')
    const mqN = window.matchMedia('(max-width: 640px)')
    const updateMq = () => {
      setIsMobile(mq.matches)
      setIsNarrow(mqN.matches)
    }
    updateMq()
    if (mq.addEventListener) {
      mq.addEventListener('change', updateMq)
      mqN.addEventListener('change', updateMq)
      return () => {
        mq.removeEventListener('change', updateMq)
        mqN.removeEventListener('change', updateMq)
      }
    }
    mq.addListener(updateMq)
    mqN.addListener(updateMq)
    return () => {
      mq.removeListener(updateMq)
      mqN.removeListener(updateMq)
    }
  }, [])

  function handleLogo(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => update('logoDataUrl', ev.target.result)
    reader.readAsDataURL(file)
  }

  async function handleExport(fn) {
    setExporting(true)
    try { await fn() } finally { setExporting(false) }
  }

  function handleShare() {
    const params = encodeShareParams(state)
    const url = `${window.location.origin}${window.location.pathname}?${params}`
    navigator.clipboard.writeText(url)
      .then(() => { setShareMsg('Copied!'); setTimeout(() => setShareMsg(''), 2200) })
      .catch(() => { setShareMsg('Failed'); setTimeout(() => setShareMsg(''), 2000) })
  }

  const upiStr = buildUPIString(state)
  const isUPIValid = state.upiId.includes('@') && state.payee.length > 0
  const rootStyle = isMobile ? { ...s.root, height: 'auto', minHeight: '100dvh', overflow: 'auto' } : s.root
  const topbarStyle = isMobile
    ? { ...s.topbar, height: 'auto', padding: '12px 14px', flexDirection: 'column', alignItems: 'stretch', rowGap: 10 }
    : s.topbar
  const brandStyle = isMobile ? { ...s.brand, order: 1, width: '100%', justifyContent: 'space-between' } : s.brand
  const stepsStyle = isMobile
    ? { ...s.steps, order: 2, width: '100%', justifyContent: 'flex-start', overflowX: 'auto', paddingBottom: 4, flex: 'none' }
    : s.steps
  const resetStyle = isMobile ? { ...s.resetBtn, alignSelf: 'center' } : s.resetBtn
  const layoutStyle = isMobile ? { ...s.layout, gridTemplateColumns: '1fr', gridTemplateRows: 'auto auto', overflow: 'visible' } : s.layout
  const formColStyle = isMobile ? { ...s.formCol, borderRight: 'none', borderBottom: '1px solid var(--border)' } : s.formCol
  const formScrollStyle = isMobile ? { ...s.formScroll, overflowY: 'visible' } : s.formScroll
  const stepPanelStyle = isNarrow ? { ...s.stepPanel, padding: '20px 16px 32px' } : s.stepPanel
  const stepTitleStyle = isNarrow ? { ...s.stepTitle, fontSize: 20 } : s.stepTitle
  const previewInnerStyle = isNarrow ? { ...s.previewInner, padding: 16 } : s.previewInner
  const previewCanvasStyle = {
    ...s.previewCanvas,
    ...(previewBig ? s.previewCanvasBig : {}),
    ...(isMobile ? { padding: previewBig ? 22 : 16 } : {}),
  }
  const exportRowStyle = isNarrow ? { ...s.exportRow, flexWrap: 'wrap' } : s.exportRow
  const expBtnStyle = isNarrow ? { ...s.expBtn, flex: '1 1 calc(50% - 8px)', justifyContent: 'center' } : s.expBtn
  const expPrimaryStyle = isNarrow ? { ...s.expPrimary, flex: '1 1 calc(50% - 8px)', justifyContent: 'center' } : s.expPrimary
  const stepBtnStyle = isNarrow ? { ...s.stepBtn, padding: '6px 12px', fontSize: 12, minWidth: 88 } : s.stepBtn

  return (
    <div style={rootStyle}>
      {/* ── Top bar ── */}
      <header style={topbarStyle}>
        <div style={brandStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={s.brandIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="9" height="9" rx="2" fill="white" opacity="0.9"/>
                <rect x="13" y="2" width="9" height="9" rx="2" fill="white" opacity="0.6"/>
                <rect x="2" y="13" width="9" height="9" rx="2" fill="white" opacity="0.6"/>
                <rect x="15" y="15" width="5" height="5" rx="1.5" fill="white" opacity="0.9"/>
              </svg>
            </div>
            <span style={s.brandName}>QRAFT</span>
            <span style={s.brandPill}>v2</span>
          </div>
          <button style={resetStyle} onClick={reset}>Reset</button>
        </div>

        {/* Step pills */}
        <div style={stepsStyle}>
          {STEPS.map((st, i) => {
            const isActive = i === step
            const isVisited = i < step
            const statusStyle = isActive ? s.stepActive : isVisited ? s.stepDone : {}
            return (
              <button
                key={st.id}
                style={{...stepBtnStyle, ...statusStyle}}
                onClick={() => setStep(i)}
              >
                <span style={{ fontSize: 11 }}>{st.icon}</span>
                {st.label}
              </button>
            )
          })}
        </div>

        
      </header>

      {/* ── Main layout ── */}
      <div style={layoutStyle}>

        {/* ── Left: Form panel ── */}
        <div style={formColStyle}>
          <div style={formScrollStyle}>

            {/* STEP 0 — Payment */}
            {step === 0 && (
              <div style={stepPanelStyle}>
                <div style={s.stepHeader}>
                  <h2 style={stepTitleStyle}>Payment Details</h2>
                  <p style={s.stepSub}>Your UPI info that gets encoded into the QR</p>
                </div>

                <Field label="UPI ID" hint="e.g. name@okicici" required>
                  <Input
                    value={state.upiId}
                    onChange={v => update('upiId', v)}
                    placeholder="yourname@upi"
                    mono
                    valid={state.upiId.includes('@')}
                  />
                </Field>

                <Field label="Payee Name" required>
                  <Input value={state.payee} onChange={v => update('payee', v)} placeholder="Your name or business"/>
                </Field>

                <Field label="Fixed Amount" hint="Leave blank to let payer enter amount">
                  <div style={{ position: 'relative' }}>
                    <span style={s.rupeePrefix}>₹</span>
                    <Input value={state.amount} onChange={v => update('amount', v)} placeholder="0.00" type="number" style={{ paddingLeft: 32 }}/>
                  </div>
                </Field>

                <Field label="Payment Note" hint="Shown to payer on UPI app">
                  <Input value={state.note} onChange={v => update('note', v)} placeholder="e.g. Thanks for your order!"/>
                </Field>

                {/* UPI preview pill */}
                {isUPIValid && (
                  <div style={s.upiPill}>
                    <span style={s.upiPillDot}/>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', wordBreak: 'break-all' }}>
                      {upiStr.slice(0, 72)}{upiStr.length > 72 ? '…' : ''}
                    </span>
                  </div>
                )}

                <NavButtons step={step} setStep={setStep} canNext={isUPIValid}/>
              </div>
            )}

            {/* STEP 1 — Branding */}
            {step === 1 && (
              <div style={stepPanelStyle}>
                <div style={s.stepHeader}>
                  <h2 style={stepTitleStyle}>Branding</h2>
                  <p style={s.stepSub}>Add your business identity to the label</p>
                </div>

                <Field label="Business Name">
                  <Input value={state.bizName} onChange={v => update('bizName', v)} placeholder="Your shop or brand"/>
                </Field>

                <Field label="Tagline" hint="Short · punchy · optional">
                  <Input value={state.tagline} onChange={v => update('tagline', v)} placeholder="Fresh · Local · Trusted"/>
                </Field>

                <Field label="Logo">
                  <div style={s.logoArea}>
                    {state.logoDataUrl
                      ? (
                        <div style={s.logoPreviewWrap}>
                          <img src={state.logoDataUrl} style={s.logoImg} alt="logo"/>
                          <div style={s.logoMeta}>
                            <span style={{ color: 'var(--text)', fontSize: 13 }}>Logo uploaded</span>
                            <button style={s.removeBtn} onClick={() => update('logoDataUrl', null)}>Remove</button>
                          </div>
                        </div>
                      ) : (
                        <button style={s.uploadZone} onClick={() => logoRef.current.click()}>
                          <span style={{ fontSize: 28, opacity: 0.4 }}>⊕</span>
                          <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Click to upload PNG / JPG</span>
                          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Best: square, transparent bg</span>
                        </button>
                      )
                    }
                    <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogo}/>
                  </div>
                </Field>

                <NavButtons step={step} setStep={setStep} canNext={true}/>
              </div>
            )}

            {/* STEP 2 — Design */}
            {step === 2 && (
              <div style={stepPanelStyle}>
                <div style={s.stepHeader}>
                  <h2 style={stepTitleStyle}>Design</h2>
                  <p style={s.stepSub}>Colours, frame style and label size</p>
                </div>

                {/* Colour presets */}
                <Field label="Colour Theme">
                  <div style={s.presetsGrid}>
                    {PRESETS.map(p => (
                      <button
                        key={p.name}
                        style={{...s.presetDot, background: p.primary, ...(state.primaryColor === p.primary ? s.presetActive : {})}}
                        onClick={() => updateMany({ primaryColor: p.primary, bgColor: p.bg, textColor: p.text, qrColor: p.qr })}
                        title={p.name}
                      />
                    ))}
                  </div>
                </Field>

                {/* Manual colour pickers */}
                <Field label="Custom Colours">
                  <div style={s.colorRow}>
                    {[
                      { key: 'primaryColor', label: 'Accent' },
                      { key: 'bgColor',      label: 'Background' },
                      { key: 'textColor',    label: 'Text' },
                      { key: 'qrColor',      label: 'QR' },
                    ].map(({ key, label }) => (
                      <label key={key} style={s.colorPill} title={label}>
                        <input type="color" value={state[key]} onChange={e => update(key, e.target.value)} style={s.colorInput}/>
                        <span style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{label}</span>
                      </label>
                    ))}
                  </div>
                </Field>

                {/* Frame */}
                <Field label="Frame Style">
                  <div style={s.framesGrid}>
                    {FRAMES.map(f => (
                      <button
                        key={f.id}
                        style={{...s.frameBtn, ...(state.frame === f.id ? s.frameBtnActive : {})}}
                        onClick={() => update('frame', f.id)}
                      >
                        <FrameIcon id={f.id} color={state.frame === f.id ? 'var(--accent)' : 'var(--text-3)'}/>
                        <span style={{ fontSize: 12, fontWeight: 500, color: state.frame === f.id ? 'var(--accent)' : 'var(--text)' }}>{f.label}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{f.desc}</span>
                      </button>
                    ))}
                  </div>
                </Field>

                {/* Size */}
                <Field label="Label Size">
                  <div style={s.sizeRow}>
                    {SIZES.map(sz => (
                      <button
                        key={sz.id}
                        style={{...s.sizeBtn, ...(state.size === sz.id ? s.sizeBtnActive : {})}}
                        onClick={() => update('size', sz.id)}
                      >
                        <span style={{ fontSize: 16, fontWeight: 700 }}>{sz.label}</span>
                        <span style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>{sz.w}px</span>
                      </button>
                    ))}
                  </div>
                </Field>

                <NavButtons step={step} setStep={setStep} canNext={true} last/>
              </div>
            )}

          </div>
        </div>

        {/* ── Right: Preview ── */}
        <div style={s.previewCol}>
          <div style={previewInnerStyle}>

            <div style={s.previewTopRow}>
              <span style={s.previewLabel}>
                <span style={s.liveDot}/>
                Live preview
              </span>
              <button style={s.expandBtn} onClick={() => setPreviewBig(b => !b)}>
                {previewBig ? '⊟ Fit' : '⊞ Expand'}
              </button>
            </div>

            <div style={previewCanvasStyle}>
              <QRLabel state={state}/>
            </div>

            {/* Export row */}
            <div style={exportRowStyle}>
              <button style={{...expBtnStyle, ...expPrimaryStyle}} onClick={() => handleExport(downloadPNG)} disabled={exporting}>
                {exporting ? <Spinner/> : <DownIcon/>}
                PNG
              </button>
              <button style={expBtnStyle} onClick={() => handleExport(downloadJPG)} disabled={exporting}>
                <DownIcon/> JPG
              </button>
              <button style={expBtnStyle} onClick={printLabel}>
                <PrintIcon/> Print
              </button>
              <button style={expBtnStyle} onClick={handleShare}>
                <ShareIcon/>
                {shareMsg || 'Share'}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

/* ─── Sub-components ─── */

function Field({ label, hint, required, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 7 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </label>
        {required && <span style={{ fontSize: 10, color: 'var(--accent)', opacity: 0.7 }}>required</span>}
        {hint && <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 'auto' }}>{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, mono, valid, type = 'text', style: extra = {} }) {
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          height: 42,
          background: 'var(--bg-3)',
          border: `1px solid ${valid === true ? 'rgba(110,231,183,0.35)' : valid === false ? 'rgba(239,68,68,0.35)' : 'var(--border-mid)'}`,
          borderRadius: 10,
          color: 'var(--text)',
          fontSize: 14,
          padding: '0 42px 0 14px',
          outline: 'none',
          fontFamily: mono ? 'var(--mono)' : 'var(--font)',
          transition: 'border-color 0.2s',
          ...extra,
        }}
        onFocus={e => e.target.style.borderColor = 'var(--border-hi)'}
        onBlur={e => e.target.style.borderColor = valid === true ? 'rgba(110,231,183,0.35)' : 'var(--border-mid)'}
      />
      {valid === true && (
        <span style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)', fontSize: 14 }}>✓</span>
      )}
    </div>
  )
}

function NavButtons({ step, setStep, canNext, last }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
      {step > 0 && (
        <button style={s.navBack} onClick={() => setStep(s => s - 1)}>← Back</button>
      )}
      {!last && (
        <button
          style={{ ...s.navNext, ...(canNext ? {} : s.navDisabled) }}
          onClick={() => canNext && setStep(s => s + 1)}
          disabled={!canNext}
        >
          Continue →
        </button>
      )}
      {last && (
        <div style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--accent)' }}>✓</span> All set — export from the preview panel
        </div>
      )}
    </div>
  )
}

function FrameIcon({ id, color }) {
  const c = color || 'currentColor'
  if (id === 'minimal') return <svg width="28" height="22" viewBox="0 0 28 22"><rect x="1" y="1" width="26" height="20" rx="4" fill="none" stroke={c} strokeWidth="1.5"/></svg>
  if (id === 'bordered') return <svg width="28" height="22" viewBox="0 0 28 22"><rect x="1" y="1" width="26" height="20" rx="4" fill="none" stroke={c} strokeWidth="3.5"/></svg>
  if (id === 'badge') return <svg width="28" height="22" viewBox="0 0 28 22"><rect x="1" y="1" width="26" height="20" rx="4" fill="none" stroke={c} strokeWidth="1.5"/><rect x="1" y="1" width="26" height="8" rx="4" fill={c} opacity="0.3"/></svg>
  if (id === 'receipt') return <svg width="28" height="22" viewBox="0 0 28 22"><rect x="1" y="1" width="26" height="20" rx="3" fill="none" stroke={c} strokeWidth="1.5" strokeDasharray="4 2.5"/></svg>
  return null
}

function Spinner() {
  return <div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>
}
function DownIcon()  { return <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 16l-5-5h3V4h4v7h3l-5 5zm-7 4v-2h14v2H5z"/></svg> }
function PrintIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg> }
function ShareIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg> }

/* ─── Styles object ─── */
const s = {
  root: { display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg)' },

  topbar: {
    height: 64,
    background: 'linear-gradient(180deg, rgba(26,26,30,0.96), rgba(20,20,24,0.96))',
    borderBottom: '1px solid rgba(110,231,183,0.18)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
    position: 'sticky', top: 0, zIndex: 50,
    display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, flexShrink: 0,
    backdropFilter: 'blur(8px)',
  },
  brand: { display: 'flex', alignItems: 'center', gap: 9, marginRight: 8 },
  brandIcon: {
    width: 30, height: 30, borderRadius: 8,
    background: 'linear-gradient(135deg, #16a34a, #0ea5e9)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    boxShadow: '0 6px 18px rgba(14,165,233,0.25)',
  },
  brandName: { fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' },
  brandPill: {
    fontSize: 10, fontWeight: 600, background: 'var(--accent-dim)', color: 'var(--accent)',
    padding: '2px 7px', borderRadius: 20, border: '1px solid rgba(110,231,183,0.2)',
  },

  steps: { display: 'flex', gap: 4, flex: 1, justifyContent: 'center' },
  stepBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 16px', borderRadius: 20, border: '1px solid var(--border)',
    background: 'transparent', color: 'var(--text-3)', fontSize: 13, fontWeight: 500,
    cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font)',
  },
  stepActive: { background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(110,231,183,0.3)' },
  stepDone:   { color: 'var(--text-2)', border: '1px solid var(--border-mid)' },
  checkmark:  { fontSize: 11, color: 'var(--accent)' },
  resetBtn: {
    marginLeft: 'auto', fontSize: 12, color: 'var(--text-2)', background: 'var(--bg-3)',
    border: '1px solid var(--border-mid)', borderRadius: 10, padding: '6px 14px', cursor: 'pointer',
    fontFamily: 'var(--font)', transition: 'all 0.15s',
  },

  layout: { display: 'grid', gridTemplateColumns: '420px 1fr', flex: 1, overflow: 'hidden' },

  formCol: { borderRight: '1px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  formScroll: { flex: 1, overflowY: 'auto', padding: '0' },

  stepPanel: { padding: '28px 28px 40px', animation: 'fadeUp 0.25s ease' },
  stepHeader: { marginBottom: 28 },
  stepTitle: { fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 5 },
  stepSub: { fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5 },

  rupeePrefix: {
    position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
    fontSize: 15, color: 'var(--text-2)', pointerEvents: 'none', zIndex: 1,
  },

  upiPill: {
    display: 'flex', alignItems: 'flex-start', gap: 8,
    background: 'var(--bg-3)', border: '1px solid rgba(110,231,183,0.15)',
    borderRadius: 10, padding: '10px 14px', marginTop: 4,
  },
  upiPillDot: {
    width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)',
    flexShrink: 0, marginTop: 3, animation: 'pulse-ring 2s infinite',
  },

  logoArea: { marginTop: 2 },
  uploadZone: {
    width: '100%', padding: '24px 16px', background: 'var(--bg-3)',
    border: '1.5px dashed var(--border-mid)', borderRadius: 12,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    cursor: 'pointer', transition: 'border-color 0.2s', fontFamily: 'var(--font)',
  },
  logoPreviewWrap: { display: 'flex', alignItems: 'center', gap: 14, background: 'var(--bg-3)', borderRadius: 12, padding: '12px 16px' },
  logoImg: { width: 52, height: 52, borderRadius: 10, objectFit: 'contain', background: 'white', padding: 3 },
  logoMeta: { display: 'flex', flexDirection: 'column', gap: 6 },
  removeBtn: {
    fontSize: 11, color: '#f87171', background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '3px 10px',
    cursor: 'pointer', fontFamily: 'var(--font)',
  },

  presetsGrid: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  presetDot: {
    width: 28, height: 28, borderRadius: '50%', cursor: 'pointer',
    border: '2px solid transparent', transition: 'transform 0.15s, border-color 0.15s',
  },
  presetActive: { border: '2px solid white', transform: 'scale(1.18)' },

  colorRow: { display: 'flex', gap: 8 },
  colorPill: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 10,
    padding: '8px 10px', cursor: 'pointer', flex: 1,
  },
  colorInput: { width: 30, height: 30, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 0, background: 'transparent' },

  framesGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 },
  frameBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
    padding: '12px 6px 10px', background: 'var(--bg-3)',
    border: '1.5px solid var(--border)', borderRadius: 12, cursor: 'pointer',
    transition: 'all 0.15s', fontFamily: 'var(--font)',
  },
  frameBtnActive: { border: '1.5px solid rgba(110,231,183,0.4)', background: 'var(--accent-dim)' },

  sizeRow: { display: 'flex', gap: 8 },
  sizeBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
    padding: '10px 0', flex: 1, background: 'var(--bg-3)',
    border: '1.5px solid var(--border)', borderRadius: 10, cursor: 'pointer',
    transition: 'all 0.15s', fontFamily: 'var(--font)', color: 'var(--text)',
  },
  sizeBtnActive: { border: '1.5px solid rgba(110,231,183,0.4)', background: 'var(--accent-dim)' },

  navBack: {
    height: 40, padding: '0 18px', background: 'var(--bg-3)',
    border: '1px solid var(--border-mid)', borderRadius: 10,
    color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font)',
  },
  navNext: {
    height: 40, padding: '0 22px', background: 'var(--accent)',
    border: 'none', borderRadius: 10, color: '#052e16',
    fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
    transition: 'opacity 0.15s',
  },
  navDisabled: { opacity: 0.35, cursor: 'not-allowed' },

  previewCol: { background: 'var(--bg)', display: 'flex', alignItems: 'stretch', overflow: 'hidden' },
  previewInner: { flex: 1, display: 'flex', flexDirection: 'column', padding: 24, gap: 16, overflow: 'hidden' },

  previewTopRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  previewLabel: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase' },
  liveDot: { width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse-ring 2s infinite' },
  expandBtn: {
    fontSize: 12, color: 'var(--text-3)', background: 'var(--bg-3)',
    border: '1px solid var(--border)', borderRadius: 8, padding: '4px 12px',
    cursor: 'pointer', fontFamily: 'var(--font)', transition: 'color 0.15s',
  },

  previewCanvas: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-2)', borderRadius: 16, border: '1px solid var(--border)',
    overflow: 'auto', padding: 24,
    backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)`,
    backgroundSize: '24px 24px',
  },
  previewCanvasBig: { padding: 40 },

  exportRow: {
    display: 'flex', gap: 8,
  },
  expBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    height: 38, padding: '0 16px',
    background: 'var(--bg-3)', border: '1px solid var(--border-mid)',
    borderRadius: 10, color: 'var(--text-2)', fontSize: 12.5, fontWeight: 500,
    cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font)', flexShrink: 0,
  },
  expPrimary: {
    background: 'var(--accent)', border: 'none', color: '#052e16', fontWeight: 700,
  },
}
