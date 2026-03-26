import { useToastStore } from '@/store/toastStore'

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto animate-slide-in bg-amber-900 text-amber-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 w-full sm:min-w-[280px] sm:max-w-[400px] cursor-pointer"
          onClick={() => removeToast(toast.id)}
        >
          {toast.emoji && <span className="text-2xl shrink-0">{toast.emoji}</span>}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      ))}
    </div>
  )
}
