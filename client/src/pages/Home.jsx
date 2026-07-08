import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Pill, Bot, ShieldCheck, Activity } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Calendar,
      title: "Smart appointments",
      text: "Book, reschedule, and track visits with automatic reminders.",
    },
    {
      icon: Pill,
      title: "Medicine tracking",
      text: "Live inventory and prescription refills — never run out.",
    },
    {
      icon: Bot,
      title: "AI health assistant",
      text: "Ask questions, check symptoms, and get instant guidance.",
    },
    {
      icon: ShieldCheck,
      title: "Secure records",
      text: "Encrypted patient data with role-based access controls.",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      {/* Hero Section */}
      <main className="flex-grow">
        <section className="mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 text-center">
          <div className="mx-auto max-w-3xl">
            {/* Header Badge */}
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-3 py-1 text-xs font-semibold text-primary shadow-sm mb-6">
              <Activity className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span>Pharma Sync Management System</span>
            </span>

            {/* Core Message */}
            <h1 className="mt-4 text-4xl leading-tight font-extrabold tracking-tight sm:text-6xl text-text">
              Care that stays <span className="text-primary">calm, connected, and clear.</span>
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-text/80 leading-relaxed">
              Pharma Sync brings patients, doctors, and administrators together with a warm, easy interface — appointments, records, prescriptions, and an AI assistant, all in one place.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-6 py-3 bg-primary text-card hover:bg-primary-dark text-base font-semibold rounded-xl hover-scale shadow-md transition-all"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-6 py-3 bg-primary text-card hover:bg-primary-dark text-base font-semibold rounded-xl hover-scale shadow-md transition-all"
                  >
                    Get started
                  </Link>
                  <Link
                    to="/login"
                    className="px-6 py-3 bg-card border border-primary/25 text-primary hover:bg-background text-base font-semibold rounded-xl hover-scale shadow-sm transition-all"
                  >
                    Sign in
                  </Link>
                </>
              )}
              <Link
                to="/ai-assistant"
                className="px-6 py-3 bg-card border border-primary/25 text-primary hover:bg-background text-base font-semibold rounded-xl hover-scale shadow-sm transition-all"
              >
                Try the AI assistant
              </Link>
            </div>
          </div>
        </section>

        {/* Features Cards Grid */}
        <section className="border-t border-primary/10 bg-card/45 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-extrabold text-text">Everything a clinic needs</h2>
              <p className="mt-2 text-text/75 text-sm">
                Simple tools designed around real day-to-day healthcare workflows.
              </p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f, i) => (
                <div
                  key={f.title}
                  className="bg-card border border-primary/10 rounded-2xl p-6 shadow-sm hover-scale transition-all"
                >
                  <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-text">{f.title}</h3>
                  <p className="mt-2 text-sm text-text/70 leading-relaxed">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-primary/10 bg-card/45 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6">
          <p className="text-sm text-text/50">
            © {new Date().getFullYear()} Pharma Sync. All rights reserved.
          </p>
          <p className="text-xs text-text/50">
            A college project — Smart Health Management System.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
