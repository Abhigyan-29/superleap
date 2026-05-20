import React from 'react';
import './Input.css'; // Reusing input styles

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = '', options, id, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    return (
      <div className={`input-wrapper ${className}`}>
        {label && (
          <label htmlFor={selectId} className="input-label">
            {label} {props.required && <span className="required">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`input-field ${error ? 'input-error' : ''}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="error-message">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
