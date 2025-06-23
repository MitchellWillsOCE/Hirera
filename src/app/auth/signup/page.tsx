'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Loader2, Mail, Lock, User, Briefcase, CheckCircle, AlertCircle, Eye, EyeOff, Globe } from 'lucide-react'
import { motion } from 'framer-motion'
import { countries } from '@/lib/countries'

interface PasswordStrength {
  score: number
  label: string
  color: string
}

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, label: 'Very Weak', color: 'bg-red-500' })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  const validatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0
    
    if (password.length >= 8) score += 1
    if (password.match(/[a-z]/)) score += 1
    if (password.match(/[A-Z]/)) score += 1
    if (password.match(/[0-9]/)) score += 1
    if (password.match(/[^a-zA-Z0-9]/)) score += 1

    const strengthMap = {
      0: { score: 0, label: 'Very Weak', color: 'bg-red-500' },
      1: { score: 20, label: 'Weak', color: 'bg-red-400' },
      2: { score: 40, label: 'Fair', color: 'bg-yellow-500' },
      3: { score: 60, label: 'Good', color: 'bg-blue-500' },
      4: { score: 80, label: 'Strong', color: 'bg-green-500' },
      5: { score: 100, label: 'Very Strong', color: 'bg-green-600' }
    }

    return strengthMap[Math.min(score, 5) as keyof typeof strengthMap]
  }

  const validateField = (name: string, value: string) => {
    const errors: Record<string, string> = {}

    switch (name) {
      case 'firstName':
      case 'lastName':
        if (value.length < 2) {
          errors[name] = 'Must be at least 2 characters'
        } else if (!/^[a-zA-Z\s-']+$/.test(value)) {
          errors[name] = 'Only letters, spaces, hyphens, and apostrophes allowed'
        }
        break
      case 'username':
        if (value.length < 3) {
          errors[name] = 'Must be at least 3 characters'
        } else if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
          errors[name] = 'Only letters, numbers, underscores, and hyphens allowed'
        }
        break
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors[name] = 'Please enter a valid email address'
        }
        break
      case 'password':
        if (value.length < 6) {
          errors[name] = 'Password must be at least 6 characters'
        }
        break
      case 'confirmPassword':
        if (value !== formData.password) {
          errors[name] = 'Passwords do not match'
        }
        break
      case 'country':
        if (!value) {
          errors[name] = 'Please select your country'
        }
        break
    }

    setValidationErrors(prev => ({
      ...prev,
      [name]: errors[name] || ''
    }))

    return !errors[name]
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Real-time validation
    validateField(name, value)

    // Update password strength for password field
    if (name === 'password') {
      setPasswordStrength(validatePasswordStrength(value))
    }

    // Validate confirm password when password changes
    if (name === 'password' && formData.confirmPassword) {
      validateField('confirmPassword', formData.confirmPassword)
    }
    if (name === 'confirmPassword') {
      validateField('confirmPassword', value)
    }
  }

  const handleCountryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      country: value
    }))
    validateField('country', value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    // Validate all fields
    const fieldsToValidate = ['firstName', 'lastName', 'username', 'email', 'password', 'confirmPassword', 'country']
    let isValid = true

    fieldsToValidate.forEach(field => {
      if (!validateField(field, formData[field as keyof typeof formData])) {
        isValid = false
      }
    })

    if (!isValid) {
      setError('Please fix the validation errors above')
      setLoading(false)
      return
    }

    // Additional validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (passwordStrength.score < 40) {
      setError('Please choose a stronger password')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          username: formData.username.trim().toLowerCase(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          country: formData.country,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
      } else {
        setSuccess('Account created successfully! Redirecting to sign in...')
        setTimeout(() => {
          router.push('/auth/signin?message=Registration successful! Please sign in with your new account.')
        }, 2000)
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-3 sm:p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-6 sm:mb-8">
          <motion.div 
            className="flex items-center justify-center mb-3 sm:mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Briefcase className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
            </div>
          </motion.div>
          <motion.h1 
            className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            💼 JobTracker Pro
          </motion.h1>
          <motion.p 
            className="text-gray-600 mt-2 text-sm sm:text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Create your account
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Get Started
              </CardTitle>
              <CardDescription className="text-sm">
                Create your account to start tracking your job applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert className="bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700">
                        {error}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700">
                        {success}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`pl-10 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
                          validationErrors.firstName ? 'border-red-300 focus:ring-red-500/20' : ''
                        }`}
                        disabled={loading}
                        required
                      />
                    </div>
                    {validationErrors.firstName && (
                      <p className="text-xs text-red-600">{validationErrors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`pl-10 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
                          validationErrors.lastName ? 'border-red-300 focus:ring-red-500/20' : ''
                        }`}
                        disabled={loading}
                        required
                      />
                    </div>
                    {validationErrors.lastName && (
                      <p className="text-xs text-red-600">{validationErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="johndoe"
                      value={formData.username}
                      onChange={handleChange}
                      className={`pl-10 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
                        validationErrors.username ? 'border-red-300 focus:ring-red-500/20' : ''
                      }`}
                      disabled={loading}
                      required
                    />
                  </div>
                  {validationErrors.username && (
                    <p className="text-xs text-red-600">{validationErrors.username}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={`pl-10 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
                        validationErrors.email ? 'border-red-300 focus:ring-red-500/20' : ''
                      }`}
                      disabled={loading}
                      required
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="text-xs text-red-600">{validationErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                    <Select value={formData.country} onValueChange={handleCountryChange} disabled={loading}>
                      <SelectTrigger className={`pl-10 h-12 text-base transition-all duration-200 ${
                        validationErrors.country ? 'border-red-300' : ''
                      }`}>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            <div className="flex items-center space-x-2">
                              <span>{country.flag}</span>
                              <span>{country.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {validationErrors.country && (
                    <p className="text-xs text-red-600">{validationErrors.country}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`pl-10 pr-10 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
                        validationErrors.password ? 'border-red-300 focus:ring-red-500/20' : ''
                      }`}
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Password strength:</span>
                        <span className={`font-medium ${
                          passwordStrength.score >= 80 ? 'text-green-600' :
                          passwordStrength.score >= 60 ? 'text-blue-600' :
                          passwordStrength.score >= 40 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <Progress value={passwordStrength.score} className="h-2" />
                    </div>
                  )}
                  {validationErrors.password && (
                    <p className="text-xs text-red-600">{validationErrors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`pl-10 pr-10 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
                        validationErrors.confirmPassword ? 'border-red-300 focus:ring-red-500/20' : ''
                      }`}
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={loading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="text-xs text-red-600">{validationErrors.confirmPassword}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors">
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          className="mt-6 sm:mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
} 