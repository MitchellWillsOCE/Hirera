'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Target, Plus, CheckCircle, Clock, TrendingUp, Award, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { RadialChart, MultiRadialChart } from '@/components/ui/radial-chart'

interface Goal {
  id: string
  userId: string
  type: string
  target: number
  achieved: number
  period: string
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface GoalSettingProps {
  goals: Goal[]
  onCreateGoal: (goalData: any) => void
  onUpdateGoal: (goalId: string, achieved: number) => void
}

export function GoalSetting({ goals, onCreateGoal, onUpdateGoal }: GoalSettingProps) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    type: '',
    target: '',
    period: 'MONTHLY'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await onCreateGoal({
        ...formData,
        target: parseInt(formData.target),
        description: `${formData.type} goal for ${formData.period.toLowerCase()} period`
      })

      setFormData({ type: '', target: '', period: 'MONTHLY' })
      setShowForm(false)
    } catch (err) {
      setError('Failed to create goal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getProgressPercentage = (goal: Goal) => {
    return Math.min((goal.achieved / goal.target) * 100, 100)
  }

  const getDaysRemaining = (goal: Goal) => {
    const now = new Date()
    const created = new Date(goal.createdAt)
    
    // Calculate end date based on period and creation date
    let endDate = new Date(created)
    
    if (goal.period === 'WEEKLY') {
      endDate.setDate(created.getDate() + 7)
    } else if (goal.period === 'MONTHLY') {
      endDate.setMonth(created.getMonth() + 1)
    } else if (goal.period === 'QUARTERLY') {
      endDate.setMonth(created.getMonth() + 3)
    } else if (goal.period === 'YEARLY') {
      endDate.setFullYear(created.getFullYear() + 1)
    }
    
    const diffTime = endDate.getTime() - now.getTime()
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
      case 'APPLICATIONS': return '#3b82f6' // blue
      case 'INTERVIEWS': return '#8b5cf6' // purple
      case 'OFFERS': return '#10b981' // green
      case 'RESPONSES': return '#f59e0b' // orange
      default: return '#6b7280' // gray
    }
  }

  const getGoalTypeGradient = (type: string) => {
    switch (type) {
      case 'APPLICATIONS': return 'from-blue-500 to-blue-600'
      case 'INTERVIEWS': return 'from-purple-500 to-purple-600'
      case 'OFFERS': return 'from-green-500 to-green-600'
      case 'RESPONSES': return 'from-orange-500 to-orange-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const activeGoals = goals.filter(goal => goal.isActive)
  const completedGoals = goals.filter(goal => getProgressPercentage(goal) >= 100)
  
  const overviewData = activeGoals.map(goal => ({
    name: goal.type,
    value: goal.achieved,
    maxValue: goal.target,
    color: getGoalTypeColor(goal.type)
  }))

  const totalProgress = activeGoals.length > 0 
    ? Math.round(activeGoals.reduce((sum, goal) => sum + getProgressPercentage(goal), 0) / activeGoals.length)
    : 0

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

      {/* Overview Section */}
      {activeGoals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Award className="h-5 w-5 text-purple-600" />
                Goals Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Overall Progress */}
                <div className="flex flex-col items-center space-y-4">
                  <RadialChart
                    value={totalProgress}
                    maxValue={100}
                    size={140}
                    strokeWidth={12}
                    color="#8b5cf6"
                    centerContent={
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {totalProgress}%
                        </div>
                        <div className="text-sm text-gray-600">Overall</div>
                      </div>
                    }
                  />
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900">Average Progress</h3>
                    <p className="text-sm text-gray-600">Across all active goals</p>
                  </div>
                </div>

                {/* Multi-Goal Progress */}
                <div className="flex flex-col items-center space-y-4">
                  <MultiRadialChart data={overviewData.slice(0, 3)} size={140} />
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900">Active Goals</h3>
                    <p className="text-sm text-gray-600">{activeGoals.length} goals in progress</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-4">
                  <div className="text-center p-4 bg-white/70 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{completedGoals.length}</div>
                    <div className="text-sm text-gray-600">Completed Goals</div>
                  </div>
                  <div className="text-center p-4 bg-white/70 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{activeGoals.length}</div>
                    <div className="text-sm text-gray-600">Active Goals</div>
                  </div>
                  <div className="text-center p-4 bg-white/70 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {activeGoals.reduce((sum, goal) => sum + getDaysRemaining(goal), 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Days Left</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

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
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
                
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
                  <Button type="submit" disabled={!formData.type || !formData.target || loading}>
                    {loading ? 'Creating...' : 'Create Goal'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={loading}>
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
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`bg-gradient-to-r ${getGoalTypeGradient(goal.type)} w-10 h-10 rounded-full flex items-center justify-center`}>
                        <span className="text-lg">{getGoalTypeIcon(goal.type)}</span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {goal.type.charAt(0) + goal.type.slice(1).toLowerCase()}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {goal.period.toLowerCase()}
                          </Badge>
                          {getProgressPercentage(goal) >= 100 && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {getProgressPercentage(goal) >= 100 && (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Radial Progress Chart */}
                  <div className="flex justify-center">
                    <RadialChart
                      value={goal.achieved}
                      maxValue={goal.target}
                      size={120}
                      strokeWidth={10}
                      color={getGoalTypeColor(goal.type)}
                      centerContent={
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">
                            {goal.achieved}
                          </div>
                          <div className="text-xs text-gray-600">
                            of {goal.target}
                          </div>
                        </div>
                      }
                    />
                  </div>

                  {/* Details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">
                          {getDaysRemaining(goal)} days left
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-green-600 font-medium">
                          {getProgressPercentage(goal).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Rate */}
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">
                        Rate: <span className="font-medium text-gray-900">
                          {Math.round((goal.achieved / Math.max(1, (new Date().getTime() - new Date(goal.createdAt).getTime()) / (1000 * 60 * 60 * 24))) * 30)} per month
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateGoal(goal.id, goal.achieved + 1)}
                      disabled={getProgressPercentage(goal) >= 100}
                      className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                    >
                      +1
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateGoal(goal.id, Math.max(0, goal.achieved - 1))}
                      disabled={goal.achieved === 0}
                      className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
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