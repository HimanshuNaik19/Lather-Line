import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";

/**
 * NotFoundPage – a visually rich 404 page that gently guides the user
 * back home. Uses the project's brand gradient and dark-surface palette.
 */

const NotFoundPage = () => {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-hero-gradient px-6 text-white">
      {/* Centred content card */}
      <section className="flex max-w-xl flex-col items-center gap-8 text-center animate-slide-up">
        {/* ---- Compass icon (decorative) ---- */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-surface-border bg-surface-card shadow-card">
          <Compass className="h-10 w-10 text-brand-400" strokeWidth={1.5} />
        </div>

        {/* ---- Large "404" gradient text ---- */}
        <h1 className="font-display text-8xl font-extrabold leading-none tracking-tighter text-transparent bg-clip-text bg-brand-gradient sm:text-9xl select-none">
          404
        </h1>

        {/* ---- Subtitle ---- */}
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Page Not Found
        </h2>

        {/* ---- Description ---- */}
        <p className="max-w-md text-base leading-relaxed text-gray-400">
          The page you're looking for doesn't exist or has been moved.
          <br />
          Let's get you back on track.
        </p>

        {/* ---- Back to Home button ---- */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-7 py-3.5 font-semibold text-white shadow-glow-brand transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-surface"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Home
        </Link>
      </section>
    </main>
  );
};

export default NotFoundPage;
