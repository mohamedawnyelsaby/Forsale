import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <h2 className="mt-4 text-3xl font-bold">Page Not Found</h2>
        <p className="mt-2 text-gray-600">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Link 
          href="/"
          className="mt-8 inline-block rounded-lg bg-purple-600 px-6 py-3 text-white hover:bg-purple-700"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
