"use client";

interface SpinnerProps {
  show: boolean;
}

export default function Spinner({ show }: SpinnerProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
