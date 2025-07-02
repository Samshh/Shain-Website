import { LoadingSpinner } from "./loading-spinner";

export function RoleLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="text-center space-y-6 p-8">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-full bg-green-400 opacity-20 h-16 w-16 mx-auto"></div>
          <div className="relative bg-white rounded-full p-3 shadow-lg mx-auto w-16 h-16 flex items-center justify-center">
            <LoadingSpinner size="md" className="border-t-green-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">
            Loading Dashboard
          </h2>
          <div className="flex justify-center space-x-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></div>
            <div
              className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>

        <p className="text-gray-600 text-sm">Preparing your workspace...</p>
      </div>
    </div>
  );
}
