interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'red' | 'white' | 'gray';
  text?: string;
}

export const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'red', 
  text 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-4xl'
  };

  const colorClasses = {
    red: 'text-netflix-red',
    white: 'text-white',
    gray: 'text-gray-400'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <i className={`fas fa-spinner fa-spin ${sizeClasses[size]} ${colorClasses[color]} mb-2`}></i>
      {text && (
        <p className="text-gray-400 text-sm">{text}</p>
      )}
    </div>
  );
};