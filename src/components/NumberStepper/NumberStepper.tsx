import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useState, useEffect } from "react";

interface NumberStepperProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onDirectChange: (newValue: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

const NumberStepper = ({
  value,
  onIncrement,
  onDecrement,
  onDirectChange,
  min = 1,
  max = 999,
  disabled = false,
  className = "",
}: NumberStepperProps) => {
  const [inputValue, setInputValue] = useState(value.toString());

  // Sync internal state when parent value changes
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (value < max && !disabled) {
      onIncrement();
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (value > min && !disabled) {
      onDecrement();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setInputValue(raw);
  };

  const handleInputBlur = () => {
    const numValue = parseInt(inputValue);
    if (isNaN(numValue) || numValue < min) {
      setInputValue(value.toString());
    } else if (numValue > max) {
      setInputValue(max.toString());
      onDirectChange(max);
    } else if (numValue !== value) {
      onDirectChange(numValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Minus Button */}
      <motion.button
        type="button"
        whileHover={{ scale: disabled || value <= min ? 1 : 1.1 }}
        whileTap={{ scale: disabled || value <= min ? 1 : 0.9 }}
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
          disabled || value <= min
            ? "bg-gray-100 text-gray-300 cursor-not-allowed"
            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
        }`}
      >
        <Minus className="w-4 h-4" />
      </motion.button>

      {/* Number Input */}
      <input
        type="text"
        inputMode="numeric"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`w-16 text-center text-lg font-bold bg-white rounded-lg border-2 transition-all py-2 px-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
          disabled
            ? "border-gray-200 text-gray-400 cursor-not-allowed"
            : "border-gray-200 focus:border-[#c4886a] focus:outline-none"
        }`}
      />

      {/* Plus Button */}
      <motion.button
        type="button"
        whileHover={{ scale: disabled || value >= max ? 1 : 1.1 }}
        whileTap={{ scale: disabled || value >= max ? 1 : 0.9 }}
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
          disabled || value >= max
            ? "bg-gray-100 text-gray-300 cursor-not-allowed"
            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
        }`}
      >
        <Plus className="w-4 h-4" />
      </motion.button>
    </div>
  );
};

export default NumberStepper;
