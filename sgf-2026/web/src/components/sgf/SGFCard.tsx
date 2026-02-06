import React from 'react';

export interface SGFCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
}

export const SGFCard = React.forwardRef<HTMLDivElement, SGFCardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hover = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'rounded-3xl transition-all duration-300';

    const variantStyles = {
      default: 'bg-white',
      elevated: 'bg-white shadow-xl shadow-slate-200/50',
      bordered: 'bg-white border-2 border-[var(--sgf-primary)]/20',
      glass: 'bg-white/80 backdrop-blur-md',
    };

    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
    };

    const hoverStyles = hover ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : '';

    return (
      <div
        ref={ref}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${paddingStyles[padding]}
          ${hoverStyles}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SGFCard.displayName = 'SGFCard';
