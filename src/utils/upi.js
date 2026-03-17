export function buildUPIString({ upiId, payee, amount, note }) {
  let str = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payee)}`
  if (amount && parseFloat(amount) > 0) str += `&am=${parseFloat(amount).toFixed(2)}`
  if (note) str += `&tn=${encodeURIComponent(note)}`
  str += '&cu=INR'
  return str
}

export function encodeShareParams(state) {
  const p = new URLSearchParams({
    pa: state.upiId, pn: state.payee, am: state.amount, tn: state.note,
    bn: state.bizName, tg: state.tagline,
    c1: state.primaryColor.replace('#',''),
    c2: state.bgColor.replace('#',''),
    c3: state.textColor.replace('#',''),
    c4: state.qrColor.replace('#',''),
    fr: state.frame, sz: state.size,
  })
  return p.toString()
}

export function decodeShareParams(search) {
  const p = new URLSearchParams(search)
  if (!p.get('pa')) return null
  return {
    upiId:        p.get('pa') || '',
    payee:        p.get('pn') || '',
    amount:       p.get('am') || '',
    note:         p.get('tn') || '',
    bizName:      p.get('bn') || '',
    tagline:      p.get('tg') || '',
    primaryColor: '#' + (p.get('c1') || '6ee7b7'),
    bgColor:      '#' + (p.get('c2') || 'f0fdf4'),
    textColor:    '#' + (p.get('c3') || '14532d'),
    qrColor:      '#' + (p.get('c4') || '14532d'),
    frame:        p.get('fr') || 'minimal',
    size:         p.get('sz') || 'md',
  }
}

export function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `${r},${g},${b}`
}

export function formatINR(amount) {
  return parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}
