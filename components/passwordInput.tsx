import { useState, forwardRef, InputHTMLAttributes } from "react";
import PasswordStrengthBar from "./passwordStrengthBar";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showStrength?: boolean;
  autoComplete?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    {
      label,
      id,
      value,
      onChange,
      showStrength = false,
      autoComplete,
      ...props
    },
    ref,
  ) {
    const [focused, setFocused] = useState(false);
    const [visible, setVisible] = useState(false);

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          width: "100%",
        }}
      >
        <label
          htmlFor={id}
          style={{
            fontSize: "13px",
            fontWeight: "700",
            color: "#374151",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {label}
        </label>
        <div style={{ position: "relative" }}>
          <input
            ref={ref}
            id={id}
            type={visible ? "text" : "password"}
            value={value}
            onChange={onChange}
            autoComplete={autoComplete}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              width: "100%",
              padding: "10px 13px",
              fontSize: "14px",
              fontFamily: "'Outfit', sans-serif",
              color: "#1e293b",
              background: focused ? "#fff" : "#f8fafc",
              border: focused ? "1.5px solid #1e3a8a" : "1.5px solid #e2e8f0",
              borderRadius: "8px",
              outline: "none",
              boxSizing: "border-box",
              transition:
                "border-color 0.18s, background 0.18s, box-shadow 0.18s",
              boxShadow: focused ? "0 0 0 3px rgba(30,58,138,0.10)" : "none",
              letterSpacing: "0.12em",
            }}
            onMouseEnter={(e) => {
              if (!focused) e.currentTarget.style.borderColor = "#94a3b8";
            }}
            onMouseLeave={(e) => {
              if (!focused) e.currentTarget.style.borderColor = "#e2e8f0";
            }}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: "#6b7280",
            }}
          >
            {visible ? (
              // Eye-off icon (hide password)
              <svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              >
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              // Eye icon (show password)
              <svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        {showStrength && <PasswordStrengthBar password={value} />}
      </div>
    );
  },
);

export default PasswordInput;