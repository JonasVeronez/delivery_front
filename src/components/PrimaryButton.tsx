interface Props {
  text: string;
  onClick: () => void;
}

export default function PrimaryButton({ text, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition duration-200 shadow-md"
    >
      {text}
    </button>
  );
}
