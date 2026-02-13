import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">

      <div className="bg-white w-full max-w-md p-10 rounded-3xl shadow-2xl">

        <h1 className="text-3xl font-bold text-green-600 text-center mb-4">
          {title}
        </h1>

        {subtitle && (
          <h2 className="text-lg text-gray-500 text-center mb-8">
            {subtitle}
          </h2>
        )}

        {children}

      </div>

    </div>
  );
}
