'use client'

import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

interface AnimatedModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export function AnimatedModal({ open, onClose, children }: AnimatedModalProps) {
  const prefersReducedMotion = useReducedMotion()
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) {
      const el = document.createElement('div')
      el.setAttribute('id', 'portal-root')
      document.body.appendChild(el)
      containerRef.current = el
    }
    return () => {
      const el = containerRef.current
      if (el && el.parentNode) {
        el.parentNode.removeChild(el)
      }
      containerRef.current = null
    }
  }, [])

  if (!containerRef.current) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.0 : 0.18 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.96 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.98 }}
            transition={
              prefersReducedMotion
                ? { duration: 0.12 }
                : { type: 'spring', stiffness: 360, damping: 30, mass: 0.9 }
            }
            className="relative w-[95vw] sm:max-w-[720px] max-h-[90vh] overflow-y-auto bg-background border rounded-xl shadow-xl p-3 sm:p-6 will-change-transform"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    containerRef.current
  )
}

export default AnimatedModal


