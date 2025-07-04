'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Zap, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'

export function JobInsights() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-2xl"
      >
        <Card className="text-center p-8 sm:p-12 shadow-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800/50">
          <CardContent>
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 1
              }}
              className="inline-block p-4 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full mb-6"
            >
              <Zap className="h-12 w-12 text-white" />
            </motion.div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-3 tracking-tight">
              Coming Soon!
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-4">
              We're building powerful AI-driven job market insights to supercharge your search.
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-500">
              <BarChart3 className="h-5 w-5" />
              <span className="font-medium">Under Construction</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 