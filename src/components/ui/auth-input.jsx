"use client";

import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

const Input = React.forwardRef(
  (
    {
      label,
      type = "text",
      className,
      error,
      showPasswordToggle = true,
      value,
      defaultValue,
      onChange,
      id,
      name,
      ...props
    },
    ref
  ) => {
    const isPassword = type === "password";
    const [showPassword, setShowPassword] = useState(false);
    const [internalValue, setInternalValue] = useState(value ?? defaultValue ?? "");
    const [isAutoFilled, setIsAutoFilled] = useState(false);
    const inputRef = useRef(null);

    // Combine refs
    const combinedRef = (node) => {
      inputRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    useEffect(() => {
      if (value !== undefined) setInternalValue(value ?? "");
    }, [value]);

    // Enhanced auto-fill detection
    useEffect(() => {
      const input = inputRef.current;
      if (!input) return;

      const checkAutoFill = () => {
        if (input.value && input.value !== internalValue) {
          setInternalValue(input.value);
          setIsAutoFilled(true);
          return;
        }

        const computedStyle = window.getComputedStyle(input);
        const backgroundColor = computedStyle.backgroundColor;
        
        const isLikelyAutofilled = (
          backgroundColor !== 'rgba(0, 0, 0, 0)' && 
          backgroundColor !== 'white' && 
          backgroundColor !== '#ffffff' &&
          backgroundColor !== 'rgb(255, 255, 255)'
        );

        if (isLikelyAutofilled) {
          setIsAutoFilled(true);
        }
      };

      checkAutoFill();

      const timers = [
        setTimeout(checkAutoFill, 10),
        setTimeout(checkAutoFill, 100),
        setTimeout(checkAutoFill, 500),
        setTimeout(checkAutoFill, 1000)
      ];

      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    }, [id, name, internalValue]);

    const handleChange = (e) => {
      if (value === undefined) {
        setInternalValue(e.target.value);
      }
      setIsAutoFilled(false);
      onChange?.(e);
    };

    const handleBlur = (e) => {
      if (inputRef.current?.value && !internalValue) {
        setInternalValue(inputRef.current.value);
        setIsAutoFilled(true);
      }
      props.onBlur?.(e);
    };

    const inputType = isPassword && showPassword ? "text" : type;
    const currentValue = value ?? internalValue;
    const hasValue = currentValue !== "" && currentValue != null;
    const shouldFloatLabel = hasValue || isAutoFilled;

    const generatedId =
      id || name || (label ? String(label).toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="relative w-full">
        <input
          id={generatedId}
          ref={combinedRef}
          name={name}
          type={inputType}
          value={currentValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder=" "
          className={cn(
            "peer block w-full rounded-md border border-gray-300 bg-white px-3 py-3 text-sm text-black",
            "focus:border-[#0073b6] focus:outline-none focus:ring-1 focus:ring-[#0073b6] transition-all duration-150",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "autofill:bg-white autofill:shadow-[inset_0_0_0px_1000px_white]",
            "[-webkit-text-fill-color:black]",
            "[&:-webkit-autofill]:bg-white",
            "[&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_white]",
            "[&:-internal-autofill-selected]:bg-white",
            "[&:-internal-autofill-selected]:shadow-[inset_0_0_0px_1000px_white]",
            isPassword ? "pr-10" : "",
            className
          )}
          style={{
            boxShadow: "inset 0 0 0 1000px white",
          }}
          {...props}
        />

        {label && (
          <label
            htmlFor={generatedId}
            className={cn(
              "absolute left-3 pointer-events-none transition-all duration-200",
              "text-gray-500",
              shouldFloatLabel
                ? [
                    "-top-2 text-xs font-medium text-[#0073b6]",
                    "bg-white px-1",
                  ].join(' ')
                : [
                    "top-3 text-sm",
                    "bg-transparent"
                  ].join(' '),
              "peer-focus:-top-2 peer-focus:text-xs peer-focus:text-[#0073b6] peer-focus:bg-white peer-focus:px-1"
            )}
          >
            {label}
          </label>
        )}

        {isPassword && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}

        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
export { Input };
