'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Something went wrong!</h2>
        <p className="mt-4 text-gray-600">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={() => reset()}
          className="mt-8 rounded-lg bg-purple-600 px-6 py-3 text-white hover:bg-purple-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
