// UI Components Type Definitions
// Provides proper TypeScript support for JSX UI components

declare module '@/components/ui/Button' {
  import React from 'react';
  interface ButtonProps {
    children?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline' | 'destructive';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    fullWidth?: boolean;
    disabled?: boolean;
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
    ariaLabel?: string;
    [key: string]: any;
  }
  const Button: React.FC<ButtonProps>;
  export { Button };
  export default Button;
}

declare module '@/components/ui/Textarea' {
  import React from 'react';
  interface TextareaProps {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    errorMessage?: string;
    helperText?: string;
    maxLength?: number;
    rows?: number;
    autoResize?: boolean;
    showCount?: boolean;
    required?: boolean;
    size?: 'sm' | 'md' | 'lg';
    resize?: 'none' | 'vertical' | 'horizontal' | 'both';
    className?: string;
    [key: string]: any;
  }
  const Textarea: React.FC<TextareaProps>;
  export { Textarea };
  export default Textarea;
}

declare module '@/components/ui/Select' {
  import React from 'react';
  interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    children?: React.ReactNode;
    className?: string;
  }
  const Select: React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLSelectElement>>;
  export { Select };
  export default Select;
}

declare module '@/components/ui/Badge' {
  import React from 'react';
  interface BadgeProps {
    children?: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'secondary' | 'primary' | 'info';
    className?: string;
  }
  function Badge(props: BadgeProps): JSX.Element;
  export { Badge };
  export default Badge;
}

declare module '@/components/ui/Modal' {
  import React from 'react';
  interface ModalProps {
    isOpen?: boolean;
    open?: boolean;
    onClose: () => void;
    title?: string | React.ReactNode;
    children?: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    closeOnBackdropClick?: boolean;
    closeOnEscape?: boolean;
    showCloseButton?: boolean;
    className?: string;
  }
  function Modal(props: ModalProps): JSX.Element | null;
  export { Modal };
  export default Modal;
}

declare module '@/components/ui/Dialog' {
  import React from 'react';
  interface DialogProps {
    isOpen?: boolean;
    open?: boolean;
    onClose: () => void;
    title?: string | React.ReactNode;
    children?: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    closeOnBackdropClick?: boolean;
    closeOnEscape?: boolean;
    showCloseButton?: boolean;
    className?: string;
  }
  function Dialog(props: DialogProps): JSX.Element | null;
  export { Dialog };
  export default Dialog;
}

declare module '@/components/ui/Checkbox' {
  import React from 'react';
  interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    checked?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    [key: string]: any;
  }
  const Checkbox: React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<HTMLInputElement>>;
  export { Checkbox };
  export default Checkbox;
}

declare module '@/components/ui/Input' {
  import React from 'react';
  interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label?: string;
    placeholder?: string;
    error?: boolean;
    errorMessage?: string;
    helperText?: string;
    className?: string;
    [key: string]: any;
  }
  const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
  export { Input };
  export default Input;
}
