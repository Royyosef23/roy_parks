import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, RegisterSchema, type LoginDTO, type RegisterDTO, UserRole } from '@roy-parks/shared';
import { useAuth } from '../../hooks/useAuth';

type AuthMode = 'login' | 'register';

export const AuthForm: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const { login, register: registerUser, isLoading, error, clearError } = useAuth();

  // טופס התחברות
  const loginForm = useForm<LoginDTO>({
    resolver: zodResolver(LoginSchema),
  });

  // טופס רישום
  const registerForm = useForm<RegisterDTO>({
    resolver: zodResolver(RegisterSchema),
  });

  const handleLogin = async (data: LoginDTO) => {
    try {
      clearError(); // נקה שגיאות קודמות
      await login(data);
    } catch (error) {
      // השגיאה כבר נטופלת ב-useAuth
      console.error('Login error:', error);
    }
  };

  const handleRegister = async (data: RegisterDTO) => {
    try {
      clearError(); // נקה שגיאות קודמות
      await registerUser(data);
    } catch (error) {
      // השגיאה כבר נטופלת ב-useAuth
      console.error('Register error:', error);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    clearError();
    loginForm.reset();
    registerForm.reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {mode === 'login' ? 'התחברות למערכת' : 'הרשמה למערכת'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ParkBnB - שיתוף חניות בקהילה
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {mode === 'login' ? (
          <form className="mt-8 space-y-6" onSubmit={loginForm.handleSubmit(handleLogin)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">
                  כתובת אימייל
                </label>
                <input
                  {...loginForm.register('email')}
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your@email.com"
                />
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
                  סיסמה
                </label>
                <input
                  {...loginForm.register('password')}
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'מתחבר...' : 'התחבר'}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={registerForm.handleSubmit(handleRegister)}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="register-firstName" className="block text-sm font-medium text-gray-700">
                    שם פרטי
                  </label>
                  <input
                    {...registerForm.register('firstName')}
                    id="register-firstName"
                    type="text"
                    autoComplete="given-name"
                    className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="יוסי"
                  />
                  {registerForm.formState.errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {registerForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="register-lastName" className="block text-sm font-medium text-gray-700">
                    שם משפחה
                  </label>
                  <input
                    {...registerForm.register('lastName')}
                    id="register-lastName"
                    type="text"
                    autoComplete="family-name"
                    className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="כהן"
                  />
                  {registerForm.formState.errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {registerForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="register-email" className="block text-sm font-medium text-gray-700">
                  כתובת אימייל
                </label>
                <input
                  {...registerForm.register('email')}
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your@email.com"
                />
                {registerForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="register-password" className="block text-sm font-medium text-gray-700">
                  סיסמה
                </label>
                <input
                  {...registerForm.register('password')}
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
                {registerForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="register-phone" className="block text-sm font-medium text-gray-700">
                  טלפון (אופציונלי)
                </label>
                <input
                  {...registerForm.register('phone')}
                  id="register-phone"
                  type="tel"
                  autoComplete="tel"
                  className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="050-1234567"
                />
                {registerForm.formState.errors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {registerForm.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="register-role" className="block text-sm font-medium text-gray-700">
                  תפקיד
                </label>
                <select
                  {...registerForm.register('role')}
                  id="register-role"
                  autoComplete="off"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">בחר תפקיד</option>
                  <option value={UserRole.RESIDENT}>דייר (יכול להשכיר ולשכור)</option>
                </select>
                {registerForm.formState.errors.role && (
                  <p className="mt-1 text-sm text-red-600">
                    {registerForm.formState.errors.role.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="register-buildingCode" className="block text-sm font-medium text-gray-700">
                  קוד בניין
                </label>
                <input
                  {...registerForm.register('buildingCode')}
                  id="register-buildingCode"
                  type="text"
                  autoComplete="off"
                  className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="לדוגמא: ABC123 (קבל מוועד הבית)"
                  style={{ textTransform: 'uppercase' }}
                />
                {registerForm.formState.errors.buildingCode && (
                  <p className="mt-1 text-sm text-red-600">
                    {registerForm.formState.errors.buildingCode.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'נרשם...' : 'הירשם'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={switchMode}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            {mode === 'login' 
              ? 'אין לך חשבון? הירשם כאן' 
              : 'יש לך חשבון? התחבר כאן'
            }
          </button>
        </div>
      </div>
    </div>
  );
};
