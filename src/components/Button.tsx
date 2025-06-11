import styles from '@/styles/components/button.module.scss'

export interface ButtonProps {
  /** Is this the principal call to action on the page? */
  primary?: boolean;
  /** How large should the button be? */
  buttonType?: 'anchor' | 'account';
  /** Button contents */
  label: string;
  /** Optional click handler */
  onClick?: () => void;
}

/** Primary UI component for user interaction */
export const Button = ({
  primary = false,
  buttonType = 'anchor',
  label,
  ...props
}: ButtonProps) => {
  const mode = primary ? styles['storybook-button--primary'] : styles['storybook-button--secondary'];
  return (
    <button
      type="button"
      className={[styles['storybook-button'], styles[`storybook-button--${buttonType}`], mode].join(' ')}
      {...props}
    >
      {label}
    </button>
  );
};
