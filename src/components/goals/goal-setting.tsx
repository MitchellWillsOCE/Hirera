'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Target, Plus, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

interface Goal {
  id: string
  type: string
  target: number
  achieved: number
  period: string
  startDate: Date
  endDate: Date
  isActive: boolean
}

interface GoalSettingProps {
  goals: Goal[]
  onCreateGoal: (goalData: any) => void
  onUpdateGoal: (goalId: string, achieved: number) => void
}

export function GoalSetting({ goals, onCreateGoal, onUpdateGoal }: GoalSettingProps) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    type: '',
    target: '',
    period: 'MONTHLY'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const now = new Date()
    let startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    let endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    if (formData.period === 'WEEKLY') {
      const dayOfWeek = now.getDay()
      startDate = new Date(now)
      startDate.setDate(now.getDate() - dayOfWeek)
      endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 6)
    } else if (formData.period === 'QUARTERLY') {
      const quarter = Math.floor(now.getMonth() / 3)
      startDate = new Date(now.getFullYear(), quarter * 3, 1)
      endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0)
    }

    onCreateGoal({
      ...formData,
      target: parseInt(formData.target),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    })

    setFormData({ type: '', target: '', period: 'MONTHLY' })
    setShowForm(false)
  }

  const getProgressPercentage = (goal: Goal) => {
    return Math.min((goal.achieved / goal.target) * 100, 100)
  }

  const getDaysRemaining = (endDate: Date) => {
    const now = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const getGoalTypeIcon = (type: string) => {
    switch (type) {
      case 'APPLICATIONS': return '📝'
      case 'INTERVIEWS': return '🎤'
      case 'OFFERS': return '🎉'
      case 'RESPONSES': return '📞'
      default: return '🎯'
    }
  }

  const getGoalTypeColor = (type: string) => {
    switch (type) {
      case 'APPLICATIONS': return 'from-blue-500 to-blue-600'
      case 'INTERVIEWS': return 'from-purple-500 to-purple-600'
      case 'OFFERS': return 'from-green-500 to-green-600'
      case 'RESPONSES': return 'from-orange-500 to-orange-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Target className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Goals & Progress</h2>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Set New Goal
        </Button>
      </div>

      {/* Goal Creation Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="text-lg">Set New Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="type">Goal Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select goal type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="APPLICATIONS">📝 Applications</SelectItem>
                        <SelectItem value="INTERVIEWS">🎤 Interviews</SelectItem>
                        <SelectItem value="OFFERS">🎉 Offers</SelectItem>
                        <SelectItem value="RESPONSES">📞 Responses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="target">Target Number</Label>
                    <Input
                      id="target"
                      type="number"
                      min="1"
                      value={formData.target}
                      onChange={(e) => setFormData({...formData, target: e.target.value})}
                      placeholder="e.g., 20"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="period">Time Period</Label>
                    <Select value={formData.period} onValueChange={(value) => setFormData({...formData, period: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={!formData.type || !formData.target}>
                    Create Goal
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Active Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.length === 0 ? (
          <Card className="md:col-span-2 lg:col-span-3 border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Goals Set</h3>
              <p className="text-gray-500 text-center mb-4">
                Set your first goal to start tracking your progress and stay motivated!
              </p>
              <Button onClick={() => setShowForm(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Set Your First Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          goals.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`bg-gradient-to-r ${getGoalTypeColor(goal.type)} w-10 h-10 rounded-full flex items-center justify-center`}>
                        <span className="text-lg">{getGoalTypeIcon(goal.type)}</span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {goal.type.charAt(0) + goal.type.slice(1).toLowerCase()}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {goal.period.toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                    {getProgressPercentage(goal) >= 100 && (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Progress</span>
                      <span className="text-gray-600">
                        {goal.achieved} / {goal.target}
                      </span>
                    </div>
                    <Progress value={getProgressPercentage(goal)} className="h-2" />
                    <div className="text-sm text-gray-600">
                      {getProgressPercentage(goal).toFixed(0)}% completed
                    </div>
                  </div>

                  {/* Time Remaining */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        {getDaysRemaining(goal.endDate)} days left
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 font-medium">
                        {Math.round((goal.achieved / Math.max(1, (new Date().getTime() - new Date(goal.startDate).getTime()) / (1000 * 60 * 60 * 24))) * 30)} per month
                      </span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateGoal(goal.id, goal.achieved + 1)}
                      disabled={getProgressPercentage(goal) >= 100}
                      className="flex-1"
                    >
                      +1
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateGoal(goal.id, Math.max(0, goal.achieved - 1))}
                      disabled={goal.achieved === 0}
                      className="flex-1"
                    >
                      -1
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
} 