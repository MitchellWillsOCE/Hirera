'use client'

import React from 'react'
import { Cell, PieChart, Pie, ResponsiveContainer } from 'recharts'

interface RadialChartProps {
  value: number
  maxValue: number
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  showValue?: boolean
  centerContent?: React.ReactNode
  className?: string
}

export function RadialChart({
  value,
  maxValue,
  size = 120,
  strokeWidth = 8,
  color = '#3b82f6',
  backgroundColor = '#e5e7eb',
  showValue = true,
  centerContent,
  className = ''
}: RadialChartProps) {
  const percentage = Math.min((value / maxValue) * 100, 100)
  const radius = (size - strokeWidth) / 2
  const innerRadius = radius - strokeWidth / 2
  const outerRadius = radius + strokeWidth / 2

  const data = [
    { name: 'completed', value: percentage },
    { name: 'remaining', value: 100 - percentage }
  ]

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill={backgroundColor} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {centerContent || (showValue && (
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {percentage.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-600">
              {value}/{maxValue}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface MultiRadialChartProps {
  data: Array<{
    name: string
    value: number
    maxValue: number
    color: string
  }>
  size?: number
  className?: string
}

export function MultiRadialChart({ data, size = 160, className = '' }: MultiRadialChartProps) {
  const strokeWidth = 12
  const gap = 4

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {data.map((item, index) => {
            const percentage = Math.min((item.value / item.maxValue) * 100, 100)
            const radius = (size / 2) - (strokeWidth + gap) * index - strokeWidth / 2
            const innerRadius = radius - strokeWidth / 2
            const outerRadius = radius + strokeWidth / 2

            const chartData = [
              { name: 'completed', value: percentage },
              { name: 'remaining', value: 100 - percentage }
            ]

            return (
              <Pie
                key={index}
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                stroke="none"
              >
                <Cell fill={item.color} />
                <Cell fill="#f3f4f6" />
              </Pie>
            )
          })}
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center legend */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">Goals</div>
          <div className="text-xs text-gray-600">{data.length} active</div>
        </div>
      </div>
    </div>
  )
} 