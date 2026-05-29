import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 h-12 px-6 active:scale-95";
    
    // Variantes de color actualizadas para la Landing
    const variants = {
      primary: "bg-[#007AFF] text-white hover:bg-[#0056b3] shadow-lg shadow-blue-200",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
      outline: "border-2 border-[#007AFF] text-[#007AFF] hover:bg-blue-50"
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }