'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { debounce } from 'lodash'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CountryInput } from '@/components/ui/country-input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import { 
  Loader2, 
  Mail, 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Globe,
  ArrowLeft,
  User,
  Briefcase,
  Check,
  X
} from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

interface AvailabilityStatus {
  loading: boolean;
  available: boolean;
  checked: boolean;
  message: string;
}

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: ''
  });
  const [confirmationCode, setConfirmationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, label: 'Very Weak', color: 'bg-red-500' });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [usernameAvailability, setUsernameAvailability] = useState<AvailabilityStatus>({ loading: false, available: false, checked: false, message: '' });
  const [emailAvailability, setEmailAvailability] = useState<AvailabilityStatus>({ loading: false, available: false, checked: false, message: '' });
  const router = useRouter();
  const { signUp, confirmSignUp } = useAuth();

  const checkAvailability = useCallback(
    debounce(async (field: 'username' | 'email', value: string) => {
      const setAvailability = field === 'username' ? setUsernameAvailability : setEmailAvailability;
      if (!value || (validationErrors[field] && validationErrors[field] !== '')) {
        setAvailability({ loading: false, available: false, checked: false, message: '' });
        return;
      }

      setAvailability({ loading: true, available: false, checked: false, message: 'Checking...' });

      try {
        const response = await fetch('/api/auth/check-availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field, value }),
        });
        const data = await response.json();
        setAvailability({
          loading: false,
          available: data.available,
          checked: true,
          message: data.available ? `${field.charAt(0).toUpperCase() + field.slice(1)} is available!` : `${field.charAt(0).toUpperCase() + field.slice(1)} is already taken.`,
        });
      } catch (error) {
        setAvailability({ loading: false, available: false, checked: true, message: `Could not verify ${field}.` });
      }
    }, 500),
    [validationErrors]
  );

  const validatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const strengthMap = {
      0: { score: 0, label: 'Very Weak', color: 'bg-red-500' },
      1: { score: 20, label: 'Weak', color: 'bg-red-400' },
      2: { score: 40, label: 'Fair', color: 'bg-yellow-500' },
      3: { score: 60, label: 'Good', color: 'bg-blue-500' },
      4: { score: 80, label: 'Strong', color: 'bg-green-500' },
      5: { score: 100, label: 'Very Strong', color: 'bg-green-600' }
    };
    return strengthMap[Math.min(score, 5) as keyof typeof strengthMap];
  };

  const validateField = (name: string, value: string) => {
    const errors: Record<string, string> = {};
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (value.length < 2) errors[name] = 'Must be at least 2 characters';
        else if (!/^[a-zA-Z\s-']+$/.test(value)) errors[name] = 'Only letters, spaces, hyphens, and apostrophes allowed';
        break;
      case 'username':
        if (value.length < 3) errors[name] = 'Username must be at least 3 characters';
        else if (!/^[a-zA-Z0-9_]+$/.test(value)) errors[name] = 'Username can only contain letters, numbers, and underscores';
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors[name] = 'Please enter a valid email address';
        break;
      case 'password':
        if (value.length < 8) errors[name] = 'Password must be at least 8 characters';
        break;
      case 'confirmPassword':
        if (value !== formData.password) errors[name] = 'Passwords do not match';
        break;
      case 'country':
        if (!value) errors[name] = 'Please select your country';
        break;
    }
    setValidationErrors(prev => ({ ...prev, [name]: errors[name] || '' }));
    return !errors[name];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    const isValid = validateField(name, value);
    
    if (name === 'username' || name === 'email') {
      if (isValid) {
        checkAvailability(name, value);
      } else {
        const setAvailability = name === 'username' ? setUsernameAvailability : setEmailAvailability;
        setAvailability({ loading: false, available: false, checked: false, message: '' });
      }
    }
    
    if (name === 'password') setPasswordStrength(validatePasswordStrength(value));
    if (name === 'confirmPassword' || name === 'password') validateField('confirmPassword', name === 'confirmPassword' ? value : formData.confirmPassword);
  };
  
  const handleCountryChange = (value: string) => {
    setFormData(prev => ({ ...prev, country: value }));
    validateField('country', value);
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const fieldsToValidate = ['firstName', 'lastName', 'username', 'email', 'password', 'confirmPassword', 'country'];
    let isValid = true;
    fieldsToValidate.forEach(field => {
      if (!validateField(field, formData[field as keyof typeof formData])) isValid = false;
    });

    if (!isValid) {
      setError('Please fix the validation errors above.');
      setLoading(false);
      return;
    }
    if (passwordStrength.score < 60) {
      setError('Please choose a stronger password.');
      setLoading(false);
      return;
    }

    try {
      const result = await signUp(
        formData.email.trim().toLowerCase(),
        formData.password,
        formData.firstName.trim(),
        formData.lastName.trim(),
        formData.country,
        formData.username.trim()
      );
      
      if (result.success) {
        setSuccess(`Sign up successful! Please check your email for a confirmation code. Your username is: ${formData.username}`);
        setStep(2);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!confirmationCode) {
      setError('Please enter your confirmation code.');
      setLoading(false);
      return;
    }

    try {
      const result = await confirmSignUp(formData.email, confirmationCode, formData.username);
      
      if (result.success) {
        setSuccess('Account confirmed successfully! Redirecting to sign in...');
        setTimeout(() => router.push('/auth/signin'), 2000);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Confirmation failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepOne = () => (
    <form onSubmit={handleSignUpSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              id="firstName" 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleChange}
              className="pl-10 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-500"
              placeholder="Enter your first name"
              required 
            />
          </div>
          {validationErrors.firstName && <p className="text-red-500 text-xs">{validationErrors.firstName}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              id="lastName" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleChange}
              className="pl-10 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-500"
              placeholder="Enter your last name"
              required 
            />
          </div>
          {validationErrors.lastName && <p className="text-red-500 text-xs">{validationErrors.lastName}</p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="username" className="text-sm font-medium">Username</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            id="username" 
            name="username" 
            value={formData.username} 
            onChange={handleChange}
            className="pl-10 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-500"
            placeholder="Choose a username"
            required 
          />
        </div>
        {validationErrors.username && <p className="text-red-500 text-xs mt-1">{validationErrors.username}</p>}
        {usernameAvailability.checked && (
          <div className={`text-xs mt-1 flex items-center ${usernameAvailability.available ? 'text-green-600' : 'text-red-600'}`}>
            {usernameAvailability.loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : (usernameAvailability.available ? <Check className="h-4 w-4 mr-2" /> : <X className="h-4 w-4 mr-2" />)}
            {usernameAvailability.message}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            id="email" 
            name="email" 
            type="email" 
            value={formData.email} 
            onChange={handleChange}
            className="pl-10 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-500"
            placeholder="Enter your email"
            required 
          />
        </div>
        {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}
        {emailAvailability.checked && (
          <div className={`text-xs mt-1 flex items-center ${emailAvailability.available ? 'text-green-600' : 'text-red-600'}`}>
            {emailAvailability.loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : (emailAvailability.available ? <Check className="h-4 w-4 mr-2" /> : <X className="h-4 w-4 mr-2" />)}
            {emailAvailability.message}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            id="password" 
            name="password" 
            type={showPassword ? 'text' : 'password'} 
            value={formData.password} 
            onChange={handleChange}
            className="pl-10 pr-10 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-500"
            placeholder="Create a password"
            required 
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)} 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <Progress value={passwordStrength.score} className="h-2" />
        <p className="text-xs" style={{ color: passwordStrength.color.replace('bg-', '') }}>{passwordStrength.label}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            id="confirmPassword" 
            name="confirmPassword" 
            type={showConfirmPassword ? 'text' : 'password'} 
            value={formData.confirmPassword} 
            onChange={handleChange}
            className="pl-10 pr-10 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-500"
            placeholder="Confirm your password"
            required 
          />
          <button 
            type="button" 
            onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {validationErrors.confirmPassword && <p className="text-red-500 text-xs">{validationErrors.confirmPassword}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="country" className="text-sm font-medium">Country</Label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
          <CountryInput value={formData.country} onValueChange={handleCountryChange} />
        </div>
        {validationErrors.country && <p className="text-red-500 text-xs">{validationErrors.country}</p>}
      </div>

      <Button 
        type="submit" 
        className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200" 
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
            Creating Account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>
    </form>
  );

  const renderStepTwo = () => (
    <form onSubmit={handleConfirmationSubmit} className="space-y-4">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          A confirmation code has been sent to <strong>{formData.email}</strong>
        </p>
        
        <Alert className="bg-blue-50 border-blue-200">
          <User className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            <strong>Your username:</strong> <code className="bg-blue-100 px-1 py-0.5 rounded font-mono text-sm">{formData.username}</code>
            <br />
            <span className="text-xs">You can use this username or your email to sign in!</span>
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <Label htmlFor="confirmationCode" className="text-sm font-medium">Confirmation Code</Label>
          <Input 
            id="confirmationCode" 
            value={confirmationCode} 
            onChange={(e) => setConfirmationCode(e.target.value)} 
            placeholder="Enter 6-digit code from email"
            className="h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-500"
            maxLength={6}
            required 
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200" 
        disabled={loading || !confirmationCode}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
            Confirming...
          </>
        ) : (
          'Confirm Account'
        )}
      </Button>
      
      <p className="text-xs text-gray-500 text-center">
        Didn't receive the code? Check your spam folder or try signing up again.
      </p>
    </form>
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-3 sm:p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Back Arrow Button */}
      <div className="absolute top-4 left-4 z-20">
        <Link href="/">
          <Button variant="ghost" size="sm" className="bg-white/80 backdrop-blur-sm hover:bg-white/90 shadow-md">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-4">
            <Briefcase className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Hirera</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            {step === 1 ? 'Create your account' : 'Verify your email'}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {step === 1 ? 'Join Hirera' : 'Almost There!'}
              </CardTitle>
              <CardDescription className="text-sm">
                {step === 1 ? 'Enter your details to get started with job tracking' : 'Check your email for a verification code'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4"
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
                  className="mb-4"
                >
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      {success}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {step === 1 ? renderStepOne() : renderStepTwo()}
              
              {step === 1 && (
                <div className="mt-6 text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-medium">
                    Sign in
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
} 