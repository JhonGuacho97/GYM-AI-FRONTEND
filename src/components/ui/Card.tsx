import { type HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated' | 'accent';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const variants = {
      default:  'bg-[var(--color-card)]',
      bordered: 'bg-[var(--color-card)] border border-[var(--color-border)]',
      elevated: 'bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-muted)] transition-colors',
      accent:   'bg-[var(--color-card)] border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5',
    };

    return (
      <div
        ref={ref}
        className={`rounded-2xl p-6 ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
