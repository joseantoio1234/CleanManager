import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    // Estilos base: Subimos la altura a h-12 y el redondeado a xl para que sea más pro
    const baseStyles = "inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 h-12 px-6 active:scale-95";
    
    // Variantes de color actualizadas para la Landing
    const variants = {
      // Un azul más vivo con sombra suave
      primary: "bg-[#007AFF] text-white hover:bg-[#0056b3] shadow-lg shadow-blue-200",
      // Gris suave para botones secundarios
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
      // Borde azul para que se vea sobre el fondo blanco de la landing
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