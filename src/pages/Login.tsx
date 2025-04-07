import React, { useState } from "react";
import { useLogin } from "@refinedev/core";
import { FaEnvelope, FaPaperPlane, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { mutate: login } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    if (!email.trim() || !email.includes('@')) {
      setError("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }
    
    try {
      await login({ email });
      setIsSubmitted(true);
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to send login link. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        {!isSubmitted ? (
          // Form state
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Canvas</h1>
              <p className="text-gray-600">Enter your email to access the collaborative drawing space</p>
            </div>
            
            {error && (
              <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
                <FaExclamationTriangle className="mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@example.com"
                    required
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 flex justify-center items-center rounded-md text-white font-medium transition-colors
                  ${isSubmitting 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="mr-2" />
                    Send Magic Link
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>We'll send you a secure link to access the canvas</p>
              <p className="mt-1">No password required!</p>
            </div>
          </>
        ) : (
          // Success state
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-green-500 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Sent!</h2>
            <p className="text-gray-600 mb-6">
              We've sent an access link to:
            </p>
            <div className="bg-gray-100 rounded-md p-3 mb-6 font-medium text-gray-700">
              {email}
            </div>
            <p className="text-gray-600 mb-8">
              Please check your inbox and click the link to access the collaborative canvas.
            </p>
            
            <button 
              onClick={() => {
                setIsSubmitted(false);
                setEmail("");
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Use a different email
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;