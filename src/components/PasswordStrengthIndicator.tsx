import { useTranslation } from 'react-i18next';
import { checkPasswordStrength, PasswordStrength } from '@/utils/passwordStrength';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export const PasswordStrengthIndicator = ({ password, className = '' }: PasswordStrengthIndicatorProps) => {
  const { t } = useTranslation();
  const strength = checkPasswordStrength(password);

  if (!password) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Password Strength
          </span>
          <span className={`text-xs font-semibold ${
            strength.score >= 4 ? 'text-green-600' : 
            strength.score >= 3 ? 'text-blue-600' : 
            strength.score >= 2 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {strength.label}
          </span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`h-2 flex-1 rounded-full transition-colors ${
                level <= strength.score ? strength.color : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requirements */}
      <div className="grid grid-cols-1 gap-1 text-xs">
        <div className={`flex items-center gap-2 ${
          strength.requirements.minLength ? 'text-green-600' : 'text-gray-500'
        }`}>
          {strength.requirements.minLength ? (
            <Check className="h-3 w-3" />
          ) : (
            <X className="h-3 w-3" />
          )}
          <span>At least 8 characters</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className={`flex items-center gap-2 ${
            strength.requirements.hasUppercase ? 'text-green-600' : 'text-gray-500'
          }`}>
            {strength.requirements.hasUppercase ? (
              <Check className="h-3 w-3" />
            ) : (
              <X className="h-3 w-3" />
            )}
            <span>Uppercase</span>
          </div>
          <div className={`flex items-center gap-2 ${
            strength.requirements.hasLowercase ? 'text-green-600' : 'text-gray-500'
          }`}>
            {strength.requirements.hasLowercase ? (
              <Check className="h-3 w-3" />
            ) : (
              <X className="h-3 w-3" />
            )}
            <span>Lowercase</span>
          </div>
          <div className={`flex items-center gap-2 ${
            strength.requirements.hasNumber ? 'text-green-600' : 'text-gray-500'
          }`}>
            {strength.requirements.hasNumber ? (
              <Check className="h-3 w-3" />
            ) : (
              <X className="h-3 w-3" />
            )}
            <span>Number</span>
          </div>
          <div className={`flex items-center gap-2 ${
            strength.requirements.hasSpecial ? 'text-green-600' : 'text-gray-500'
          }`}>
            {strength.requirements.hasSpecial ? (
              <Check className="h-3 w-3" />
            ) : (
              <X className="h-3 w-3" />
            )}
            <span>Special char</span>
          </div>
        </div>
      </div>
    </div>
  );
};