import { LoadingSpinner } from "./loading-spinner"

export function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-6 p-8">
        {/* Main loading animation */}
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-20 h-20 w-20 mx-auto"></div>
          <div className="relative bg-white rounded-full p-4 shadow-lg mx-auto w-20 h-20 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </div>

        {/* Loading text with typing animation */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-800 animate-pulse">Authenticating</h2>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-64 mx-auto">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full animate-pulse"></div>
          </div>
        </div>

        <p className="text-gray-600 text-sm animate-fade-in">Verifying your credentials and permissions...</p>
      </div>
    </div>
  )
}
