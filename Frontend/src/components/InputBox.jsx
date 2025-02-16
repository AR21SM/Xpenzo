import { InputText } from "primereact/inputtext";

export function InputBox({ label, type = "text", placeholder, value, onChange }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <InputText
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border px-3 py-2 focus:border-indigo-500 focus:outline-none"
      />
    </div>
  );
}
