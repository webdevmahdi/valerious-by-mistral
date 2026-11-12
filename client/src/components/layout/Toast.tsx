import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch'
import { clearToast } from '../../store/slices/uiSlice'

export function Toast() {
  const toast = useAppSelector((s) => s.ui.toast)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => dispatch(clearToast()), 3200)
    return () => clearTimeout(t)
  }, [toast, dispatch])

  if (!toast) return null

  return (
    <div className="fade-in fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 border border-line bg-ink px-5 py-3 text-sm text-bone" role="status">
      {toast}
    </div>
  )
}
