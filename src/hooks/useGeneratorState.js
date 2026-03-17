import { useState } from 'react'
import { decodeShareParams } from '../utils/upi'

export const DEFAULT_STATE = {
  upiId:        'merchant@okaxis',
  payee:        'Green Leaf Store',
  amount:       '',
  note:         'Thank you for shopping!',
  bizName:      'Green Leaf Store',
  tagline:      'Fresh · Local · Organic',
  logoDataUrl:  null,
  primaryColor: '#16a34a',
  bgColor:      '#f0fdf4',
  textColor:    '#14532d',
  qrColor:      '#14532d',
  frame:        'minimal',
  size:         'md',
}

export function useGeneratorState() {
  const [state, setState] = useState(() => {
    const fromUrl = decodeShareParams(window.location.search)
    return fromUrl ? { ...DEFAULT_STATE, ...fromUrl } : DEFAULT_STATE
  })

  const update = (key, value) => setState(prev => ({ ...prev, [key]: value }))
  const updateMany = (partial) => setState(prev => ({ ...prev, ...partial }))
  const reset = () => setState(DEFAULT_STATE)

  return { state, update, updateMany, reset }
}
