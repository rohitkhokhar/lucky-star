import React from "react";
import { Link } from "react-router-dom";

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white px-4 py-4">
      <div className="shadow-lg p-6 md:p-5">

        {/* HEADER */}
        <h1 className="text-3xl font-bold text-center mb-2">
          Privacy Policy
        </h1>
        <p className="text-center text-sm text-gray-400 mb-6">
          Effective Date: <span className="text-white">15/12/2025</span>
        </p>

        <p className="text-gray-300 mb-6">
          This Privacy Policy describes how <b>Andar Bahar Live Game</b> ("we",
          "our", "us") collects, uses, discloses, and protects your information
          when you use our mobile application, website, or related services
          (collectively, the "Service"). This policy is prepared in accordance
          with applicable laws in India, including the Information Technology
          Act, 2000 and related rules.
        </p>

        <p className="text-gray-300 mb-8">
          By accessing or using the Andar Bahar Live Game, you agree to the
          collection and use of information in accordance with this Privacy
          Policy. If you do not agree, please do not use the Service.
        </p>

        {/* SECTION 1 */}
        <h2 className="text-xl font-semibold mb-3">
          1. Information We Collect
        </h2>

        <h3 className="font-semibold mt-4 mb-2">
          1.1 Personal Information
        </h3>
        <ul className="list-disc list-inside text-gray-300 space-y-1">
          <li>Name or username</li>
          <li>Email address</li>
          <li>Contact details</li>
          <li>Date of birth / age confirmation</li>
          <li>Information submitted through customer support or feedback</li>
        </ul>

        <h3 className="font-semibold mt-4 mb-2">
          1.2 Non-Personal Information
        </h3>
        <ul className="list-disc list-inside text-gray-300 space-y-1">
          <li>Device information (device type, OS, identifiers)</li>
          <li>IP address</li>
          <li>App usage data and interaction logs</li>
          <li>Game statistics and preferences</li>
        </ul>

        <h3 className="font-semibold mt-4 mb-2">
          1.3 Payment Information
        </h3>
        <p className="text-gray-300">
          Payment processing is handled by third-party gateways. We do not store
          or process sensitive payment information such as card or bank details.
        </p>

        {/* SECTION 2 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">
          2. How We Use Your Information
        </h2>
        <ul className="list-disc list-inside text-gray-300 space-y-1">
          <li>Provide, operate, and improve the game</li>
          <li>Create and manage user accounts</li>
          <li>Enable gameplay, leaderboards, and rewards</li>
          <li>Communicate updates, offers, and support</li>
          <li>Prevent fraud and ensure security</li>
          <li>Comply with legal obligations</li>
        </ul>

        {/* SECTION 3 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">
          3. Sharing of Information
        </h2>
        <ul className="list-disc list-inside text-gray-300 space-y-1">
          <li>Trusted service providers under confidentiality</li>
          <li>Legal or regulatory requirements</li>
          <li>Business transfers (merger, acquisition, sale)</li>
        </ul>

        {/* SECTION 4 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">
          4. Data Security
        </h2>
        <p className="text-gray-300">
          We use reasonable security measures, but no system is 100% secure.
        </p>

        {/* SECTION 5 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">
          5. Data Retention
        </h2>
        <p className="text-gray-300">
          Personal information is retained only as long as necessary or required
          by law.
        </p>

        {/* SECTION 6 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">
          6. Children’s Privacy
        </h2>
        <p className="text-gray-300">
          This game is intended for users aged 18+. We do not knowingly collect
          data from minors.
        </p>

        {/* SECTION 7 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">
          7. Third-Party Links
        </h2>
        <p className="text-gray-300">
          We are not responsible for third-party privacy practices.
        </p>

        {/* SECTION 8 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">
          8. Your Rights
        </h2>
        <ul className="list-disc list-inside text-gray-300 space-y-1">
          <li>Access or correct personal data</li>
          <li>Withdraw consent</li>
          <li>Request deletion (subject to law)</li>
        </ul>

        {/* SECTION 9 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">
          9. Changes to This Policy
        </h2>
        <p className="text-gray-300">
          Updates will be posted with a revised effective date.
        </p>

        {/* SECTION 10 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">
          10. Contact Us
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
      </div>
    </div>
  );
}

export default PrivacyPolicy;
