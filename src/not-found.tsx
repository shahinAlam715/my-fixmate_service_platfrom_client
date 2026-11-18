
import Link from "next/link";
import {
  Wrench,
  Home,
  Search,
  AlertCircle,
} from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-gray-50 px-4 py-16">
      <div className="w-full max-w-lg text-center">

        {/* Icon */}
        <div className="relative mx-auto mb-8 flex size-28 items-center justify-center rounded-full bg-orange-100">
          <div className="absolute inset-0 animate-ping rounded-full border-2 border-orange-200 opacity-30" />
          <Wrench size={48} className="rotate-45 text-orange-600" />
          <AlertCircle
            size={23}
            className="absolute -right-1 -top-1 rounded-full bg-white text-red-500"
          />
        </div>

        {/* 404 */}
        <h1 className="text-8xl font-extrabold tracking-tight text-orange-600 sm:text-9xl">
          404
        </h1>

        <h2 className="mt-5 text-2xl font-bold text-gray-900 sm:text-3xl">
          Oops! Page Not Found
        </h2>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-gray-500 sm:text-base">
          Looks like this page needs a repair! The page you are looking for
          doesnt exist or may have been moved.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700"
          >
            <Home size={18} />
            Back to Home
          </Link>

          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:border-orange-500 hover:text-orange-600"
          >
            <Search size={18} />
            Explore Services
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 border-t border-gray-200 pt-6">
          <Link href="/" className="text-2xl font-extrabold text-gray-900">
            Fix<span className="text-orange-600">Mate</span>
          </Link>

          <p className="mt-2 text-xs text-gray-400">
            Dont worry, well help you get back on track!
          </p>
        </div>
      </div>
    </main>
  );
}
