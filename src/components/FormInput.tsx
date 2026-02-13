interface Props {
  label: string;
  type?: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FormInput({
  label,
  type = "text",
  placeholder,
  onChange,
}: Props) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        onChange={onChange}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
      />
    </div>
  );
}
