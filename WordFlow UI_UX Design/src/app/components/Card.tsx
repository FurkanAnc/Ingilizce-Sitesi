import { motion } from 'motion/react';
import { forwardRef } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  children: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover = false, className = '', children, ...props }, ref) => {
    const Component = hover ? motion.div : 'div';
    const hoverProps = hover ? {
      whileHover: { y: -4, boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.2)' },
      transition: { duration: 0.2 }
    } : {};

    return (
      <Component
        ref={ref}
        className={`bg-card border border-border rounded-xl p-6 shadow-sm ${className}`}
        {...hoverProps}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';
