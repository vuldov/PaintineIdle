import { create } from 'zustand'

export interface Toast {
  id: number
  message: string
  emoji?: string
}

interface ToastStore {
  toasts: Toast[]
  addToast: (message: string, emoji?: string) => void
  removeToast: (id: number) => void
}

let nextId = 1

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (message, emoji) => {
    const id = nextId++
    set((state) => ({
      toasts: [...state.toasts, { id, message, emoji }],
    }))
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }))
    }, 5000)
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },
}))
