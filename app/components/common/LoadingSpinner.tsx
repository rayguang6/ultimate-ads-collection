interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  message = 'Loading...', 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeClass = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };
  
  const spinner = (
    <>
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-500 ${sizeClass[size]}`}></div>
      {message && <p className="mt-4 text-gray-600">{message}</p>}
    </>
  );
  
  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          {spinner}
        </div>
      </div>
    );
  }
  
  return <div className="text-center">{spinner}</div>;
} 