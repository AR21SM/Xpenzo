import { Button as PrimeButton } from "primereact/button";

export function Button({ label, onClick, disabled }) {
  return (
    <PrimeButton
      label={label}
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-indigo-600 text-white hover:bg-indigo-700 transition"
    />
  );
}
