'use client';
import Link from 'next/link';

export default function Home() {
  return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
        <main className="flex-grow">
          <section className="bg-indigo-600 text-white py-20">
            <div className="container mx-auto px-6 text-center">
              <h2 className="text-5xl font-bold mb-6">Welcome to Travel Guardians</h2>
              <p className="text-xl mb-6">
                Discover a collaborative platform where travelers share tips and warnings about common tourist scams.
                Stay safe, informed, and enjoy your adventures worry-free.
              </p>
              <Link href="/signup" className="inline-block bg-white text-indigo-600 font-semibold py-3 px-8 rounded-md hover:bg-gray-100 transition duration-300">
                  Get Started
              </Link>
            </div>
          </section>

          <section className="py-12 bg-white">
            <div className="container mx-auto px-6">
              <h3 className="text-3xl font-bold text-gray-800 text-center mb-8">Why Choose Travel Guardians?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
                  <h4 className="text-xl font-bold text-indigo-600 mb-4">Stay Informed</h4>
                  <p className="text-gray-700">
                    Access a global community of travelers who share real-time information on common scams and issues at tourist destinations.
                  </p>
                </div>
                <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
                  <h4 className="text-xl font-bold text-indigo-600 mb-4">Collaborative Experience</h4>
                  <p className="text-gray-700">
                    Our platform is built by travelers, for travelers. Share your experiences and help others avoid unpleasant situations.
                  </p>
                </div>
                <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
                  <h4 className="text-xl font-bold text-indigo-600 mb-4">Plan Safely</h4>
                  <p className="text-gray-700">
                    Get advice on safe routes, trusted guides, and real tips on how to protect yourself in any destination.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-gray-800 py-6">
          <div className="container mx-auto px-6 text-center text-gray-400">
            <p>&copy; 2024 Travel Guardians. All Rights Reserved.</p>
            <nav className="mt-4">
              <Link href="/signin" className="text-gray-400 hover:text-white mx-4">
                Sign In
              </Link>
              <Link href="/signup" className="text-gray-400 hover:text-white mx-4">
                Sign Up
              </Link>
            </nav>
          </div>
        </footer>
      </div>
  );
}