import React from "react";
import { Link } from "react-router-dom";

function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-4xl mx-auto bg-gray-900 rounded-2xl shadow-lg p-6 md:p-10">

        {/* HEADER */}
        <h1 className="text-3xl font-bold text-center mb-2">
          Terms and Conditions
        </h1>
        <p className="text-center text-sm text-gray-400 mb-6">
          Effective Date: <span className="text-white">15/12/2025</span>
        </p>

        <p className="text-gray-300 mb-6">
          Welcome to <b>Andar Bahar Live Game</b> ("Game", "Service", "we", "our",
          "us"). These Terms and Conditions ("Terms") govern your access to and
          use of our mobile application, website, and related services. By
          accessing or using the Service, you agree to be bound by these Terms.
          If you do not agree, please discontinue use of the Service immediately.
        </p>

        <p className="text-gray-300 mb-8">
          These Terms are governed by the laws applicable in India.
        </p>

        {/* SECTION 1 */}
        <h2 className="text-xl font-semibold mb-3">1. Eligibility</h2>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>You must be 18 years of age or older to use the Game.</li>
          <li>
            By using the Service, you represent and warrant that:
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
              <li>You are legally competent to enter a binding agreement</li>
              <li>You are not prohibited under applicable laws</li>
              <li>You are accessing the Game from a legally permitted location</li>
            </ul>
          </li>
        </ul>

        {/* SECTION 2 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">
          2. Nature of the Game
        </h2>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>The Game is strictly for amusement and entertainment only.</li>
          <li>No real money, cash winnings, or gambling is involved.</li>
          <li>All coins, points, or tokens are virtual with no real-world value.</li>
          <li>
            Users must not associate real money with gameplay directly or
            indirectly.
          </li>
          <li>
            We are not responsible for any real-money losses or disputes.
          </li>
          <li>
            The Game is intended purely for recreational purposes.
          </li>
        </ul>

        {/* SECTION 3 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">3. User Account</h2>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>Account creation may be required for certain features.</li>
          <li>You are responsible for maintaining account confidentiality.</li>
          <li>
            Accounts may be suspended or terminated for:
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
              <li>False or misleading information</li>
              <li>Violation of these Terms</li>
              <li>Fraudulent or unlawful activity</li>
            </ul>
          </li>
        </ul>

        {/* SECTION 4 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">
          4. User Responsibilities
        </h2>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>No illegal or unauthorized use</li>
          <li>No exploitation, hacking, or reverse engineering</li>
          <li>No bots, automation, or unfair practices</li>
          <li>No interference with security or performance</li>
          <li>No harassment or abuse of other users</li>
        </ul>

        {/* SECTION 5 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">
          5. Payments and Virtual Items
        </h2>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>Virtual coins or purchases may be offered.</li>
          <li>All purchases are final and non-refundable.</li>
          <li>Virtual items have no monetary value.</li>
          <li>Payments handled by third-party gateways.</li>
        </ul>

        {/* SECTION 6 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">
          6. Fair Play and Anti-Fraud
        </h2>
        <p className="text-gray-300">
          Cheating, exploitation, or manipulation may result in permanent
          account termination.
        </p>

        {/* SECTION 7 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">
          7. Intellectual Property
        </h2>
        <p className="text-gray-300">
          All content and trademarks belong to Andar Bahar Live Game. Unauthorized
          use is prohibited.
        </p>

        {/* SECTION 8 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">
          8. Disclaimer of Warranties
        </h2>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>Service provided "as is" and "as available"</li>
          <li>No guarantee of uninterrupted or error-free service</li>
        </ul>

        {/* SECTION 9 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">
          9. Limitation of Liability
        </h2>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>No liability for indirect or consequential damages</li>
          <li>No responsibility for reliance on game outcomes</li>
        </ul>

        {/* SECTION 10 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">
          10. Suspension and Termination
        </h2>
        <p className="text-gray-300">
          Access may be suspended or terminated for violations of Terms.
        </p>

        {/* SECTION 11 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">
          11. Indemnification
        </h2>
        <p className="text-gray-300">
          You agree to indemnify Andar Bahar Live Game from claims arising from
          misuse or violations.
        </p>

        {/* SECTION 12 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">
          12. Governing Law
        </h2>
        <p className="text-gray-300">
          Governed by laws of India. Courts in India have jurisdiction.
        </p>

        {/* SECTION 13 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">
          13. Changes to These Terms
        </h2>
        <p className="text-gray-300">
          Continued use constitutes acceptance of updated Terms.
        </p>

        {/* SECTION 14 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">
          14. Contact Information
        </h2>
        <p className="text-gray-300">
          Email:{" "}
          <a
            href="mailto:luckystarlivegame@gmail.com"
            className="text-purple-400 hover:underline"
          >
            luckystarlivegame@gmail.com
          </a>
        </p>

        {/* FOOTER */}
        <p className="mt-8 text-center text-sm text-gray-400">
          © Andar Bahar Live Game
        </p>

        <div className="text-center mt-4">
          <Link to="/" className="text-purple-400 hover:underline text-sm">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TermsAndConditions;
