import { Suspense } from 'react';
import SignInForm from './SignInForm';

// A skeleton loader to show while the form is loading
const SkeletonLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-3 sm:p-4">
    <div className="w-full max-w-md">
      <div className="rounded-lg shadow-2xl border-0 bg-white/80 backdrop-blur-sm animate-pulse">
        <div className="p-6">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-4 mt-8">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-300 rounded mt-6"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function SignInPage() {
  return (
    <Suspense fallback={<SkeletonLoader />}>
      <SignInForm />
    </Suspense>
  );
} 