import React from "react";
import { Link } from "react-router-dom";

function PopupMessage() {
       return( <div className="min-h-screen bg-black text-white px-4 py-6">
      <div className="max-w-5xl mx-auto shadow-lg p-6 md:p-8">

        {/* HEADER */}
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">
          नियम एवं शर्तें तथा गोपनीयता नीति
        </h1>
        <p className="text-center text-sm text-gray-400 mb-6">
          प्रभावी तिथि: <span className="text-white">15/12/2025</span>
        </p>

        <p className="text-gray-300 mb-4">
          Andar Bahar Live Game (“गेम”, “सेवा”, “हम”, “हमारा”, “हमें”) में आपका स्वागत है।
          यह संयुक्त नियम एवं शर्तें तथा गोपनीयता नीति हमारे मोबाइल एप्लिकेशन, वेबसाइट और
          संबंधित सेवाओं के उपयोग को नियंत्रित करती है।
        </p>

        <p className="text-gray-300 mb-4">
          इस सेवा का उपयोग करके, आप इस दस्तावेज़ से सहमत होते हैं। यदि आप सहमत नहीं हैं,
          तो कृपया सेवा का उपयोग तुरंत बंद करें।
        </p>

        <p className="text-gray-300 mb-8">
          यह दस्तावेज़ भारत में लागू कानूनों, विशेष रूप से सूचना प्रौद्योगिकी अधिनियम, 2000
          और उससे संबंधित नियमों के अनुसार तैयार किया गया है।
        </p>

        {/* PART A */}
        <h2 className="text-xl font-semibold mt-8 mb-3">
          भाग A – नियम एवं शर्तें
        </h2>

        <h3 className="text-lg font-semibold mb-2">1. पात्रता</h3>
        <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
          <li>
            1.1 Andar Bahar Live Game का उपयोग करने के लिए आपकी आयु 18 वर्ष या उससे अधिक होनी चाहिए।
          </li>
          <li>
            1.2 सेवा का उपयोग करके, आप यह पुष्टि करते हैं कि:
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
              <li>आप कानूनी रूप से बाध्यकारी समझौता करने में सक्षम हैं</li>
              <li>आप किसी भी लागू कानून के तहत प्रतिबंधित नहीं हैं</li>
              <li>आप ऐसे क्षेत्र से गेम का उपयोग कर रहे हैं जहाँ इसकी अनुमति है</li>
            </ul>
          </li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">2. गेम का स्वरूप</h3>
        <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
          <li>2.1 Andar Bahar Live Game केवल मनोरंजन और समय बिताने के उद्देश्य से बनाया गया है।</li>
          <li>2.2 इस गेम में किसी भी प्रकार का वास्तविक पैसा, नकद जीत या जुआ शामिल नहीं है।</li>
          <li>
            2.3 गेम में उपयोग किए जाने वाले सभी सिक्के, पॉइंट्स, टोकन या वर्चुअल आइटम पूरी तरह
            काल्पनिक हैं और उनका कोई वास्तविक मौद्रिक मूल्य नहीं है।
          </li>
          <li>2.4 उपयोगकर्ता किसी भी प्रकार से वास्तविक धन का उपयोग, दांव या लेन-देन नहीं करेंगे।</li>
          <li>
            2.5 यदि कोई उपयोगकर्ता वास्तविक धन से संबंधित कोई गतिविधि करता है, तो उसकी पूरी
            जिम्मेदारी उपयोगकर्ता की होगी, और हम इसके लिए उत्तरदायी नहीं होंगे।
          </li>
          <li>
            2.6 यह गेम केवल मनोरंजन के लिए है और इससे किसी प्रकार का वास्तविक आर्थिक लाभ या
            हानि नहीं होती।
          </li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">3. उपयोगकर्ता खाता</h3>
        <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
          <li>3.1 कुछ सुविधाओं के लिए खाता बनाना आवश्यक हो सकता है।</li>
          <li>
            3.2 अपने खाते की गोपनीयता और उससे होने वाली सभी गतिविधियों की जिम्मेदारी आपकी होगी।
          </li>
          <li>
            3.3 हम निम्न परिस्थितियों में खाता निलंबित या समाप्त कर सकते हैं:
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
              <li>गलत या भ्रामक जानकारी देना</li>
              <li>इन नियमों का उल्लंघन</li>
              <li>धोखाधड़ी या अवैध गतिविधियाँ</li>
            </ul>
          </li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">4. उपयोगकर्ता की जिम्मेदारियाँ</h3>
        <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
          <li>गेम का उपयोग किसी अवैध उद्देश्य के लिए नहीं करेंगे</li>
          <li>सिस्टम से छेड़छाड़ या रिवर्स इंजीनियरिंग नहीं करेंगे</li>
          <li>बॉट, ऑटोमेशन या अनुचित साधनों का उपयोग नहीं करेंगे</li>
          <li>अन्य उपयोगकर्ताओं को परेशान या नुकसान नहीं पहुँचाएँगे</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">
          5. इंटरनेट कनेक्टिविटी एवं गेमप्ले जिम्मेदारी
        </h3>
        <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
          <li>5.1 उपयोगकर्ता को यह सुनिश्चित करना होगा कि उसके पास उचित और स्थिर इंटरनेट कनेक्शन हो।</li>
          <li>
            5.2 कमजोर इंटरनेट, ऑटो लॉगआउट, डिवाइस या नेटवर्क समस्या के कारण यदि गेम बाधित होता है,
            तो हम जिम्मेदार नहीं होंगे।
          </li>
          <li>
            5.3 ऐसी स्थिति में सभी परिणाम और रिकॉर्ड केवल गेम हिस्ट्री / प्लेयर हिस्ट्री के अनुसार
            ही मान्य होंगे।
          </li>
          <li>5.4 गेम रिकॉर्ड से बाहर किसी भी दावे पर विचार नहीं किया जाएगा।</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">6. बेटिंग समय सीमा एवं कार्रवाई</h3>
        <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
          <li>6.1 उपयोगकर्ता को केवल बेटिंग विंडो खुली होने पर ही अपने चिप्स या सिक्के लगाने होंगे।</li>
          <li>6.2 बेटिंग बंद होने के बाद कोई भी बेट स्वीकार नहीं की जाएगी।</li>
          <li>
            6.3 देरी, इंटरनेट समस्या या तकनीकी कारणों से बेट न लग पाने की स्थिति में संस्था जिम्मेदार
            नहीं होगी।
          </li>
          <li>6.4 समय पर कार्रवाई करना उपयोगकर्ता की पूर्ण जिम्मेदारी है।</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">7. भुगतान एवं वर्चुअल आइटम</h3>
        <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
          <li>7.1 गेम में वर्चुअल आइटम या इन-ऐप खरीदारी हो सकती है।</li>
          <li>7.2 सभी खरीदारी अंतिम और गैर-वापसी योग्य होती हैं, जब तक कानून द्वारा आवश्यक न हो।</li>
          <li>7.3 वर्चुअल आइटम को नकद में बदला नहीं जा सकता।</li>
          <li>7.4 भुगतान थर्ड-पार्टी गेटवे द्वारा प्रोसेस किए जाते हैं।</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">8. निष्पक्ष खेल एवं धोखाधड़ी</h3>
        <p className="text-gray-300 mb-6">
          किसी भी प्रकार की धोखाधड़ी या सिस्टम का दुरुपयोग करने पर खाता तुरंत निलंबित या
          समाप्त किया जा सकता है।
        </p>

        <h3 className="text-lg font-semibold mb-2">9. बौद्धिक संपदा</h3>
        <p className="text-gray-300 mb-6">
          गेम से संबंधित सभी सामग्री हमारी स्वामित्व या लाइसेंस प्राप्त है।
          अनधिकृत उपयोग प्रतिबंधित है।
        </p>

        <h3 className="text-lg font-semibold mb-2">10. अस्वीकरण एवं दायित्व सीमा</h3>
        <p className="text-gray-300 mb-6">
          सेवा “जैसी है, वैसी उपलब्ध” आधार पर प्रदान की जाती है।
          किसी भी अप्रत्यक्ष हानि के लिए हम उत्तरदायी नहीं होंगे।
        </p>

        <h3 className="text-lg font-semibold mb-2">11. निलंबन एवं समाप्ति</h3>
        <p className="text-gray-300 mb-6">
          नियमों के उल्लंघन पर हम किसी भी समय सेवा समाप्त कर सकते हैं।
        </p>

        <h3 className="text-lg font-semibold mb-2">12. क्षतिपूर्ति</h3>
        <p className="text-gray-300 mb-6">
          उपयोगकर्ता, सेवा के दुरुपयोग से उत्पन्न सभी दावों के लिए हमें क्षतिपूर्ति देने
          के लिए सहमत होता है।
        </p>

        <h3 className="text-lg font-semibold mb-2">13. लागू कानून</h3>
        <p className="text-gray-300 mb-8">
          यह दस्तावेज़ भारत के कानूनों के अनुसार शासित होगा और भारतीय न्यायालयों का अधिकार
          क्षेत्र होगा।
        </p>

        {/* PART B */}
        <h2 className="text-xl font-semibold mt-10 mb-3">
          भाग B – गोपनीयता नीति
        </h2>

        <h3 className="text-lg font-semibold mb-2">14. एकत्र की जाने वाली जानकारी</h3>
        <p className="text-gray-300 font-semibold">14.1 व्यक्तिगत जानकारी</p>
        <ul className="list-disc list-inside text-gray-300 space-y-1 mb-4">
          <li>नाम / उपयोगकर्ता नाम</li>
          <li>ईमेल</li>
          <li>संपर्क विवरण</li>
          <li>जन्म तिथि / आयु पुष्टि</li>
          <li>सहायता या प्रतिक्रिया से जुड़ी जानकारी</li>
        </ul>

        <p className="text-gray-300 font-semibold">14.2 गैर-व्यक्तिगत जानकारी</p>
        <ul className="list-disc list-inside text-gray-300 space-y-1 mb-4">
          <li>डिवाइस और ऑपरेटिंग सिस्टम</li>
          <li>IP पता</li>
          <li>उपयोग डेटा और गेम आँकड़े</li>
        </ul>

        <p className="text-gray-300 font-semibold">14.3 भुगतान जानकारी</p>
        <p className="text-gray-300 mb-6">
          भुगतान थर्ड-पार्टी गेटवे द्वारा किया जाता है। हम संवेदनशील भुगतान जानकारी संग्रहीत
          नहीं करते।
        </p>

        <h3 className="text-lg font-semibold mb-2">15. जानकारी का उपयोग</h3>
        <ul className="list-disc list-inside text-gray-300 space-y-1 mb-6">
          <li>सेवा संचालन और सुधार</li>
          <li>खाता प्रबंधन</li>
          <li>सुरक्षा और धोखाधड़ी रोकथाम</li>
          <li>कानूनी अनुपालन</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">16. जानकारी साझा करना</h3>
        <p className="text-gray-300 mb-6">
          हम आपकी जानकारी बेचते नहीं हैं। आवश्यकतानुसार सेवा प्रदाताओं या कानून के अंतर्गत
          साझा किया जा सकता है।
        </p>

        <h3 className="text-lg font-semibold mb-2">17. डेटा सुरक्षा</h3>
        <p className="text-gray-300 mb-6">
          हम उचित सुरक्षा उपाय अपनाते हैं, लेकिन पूर्ण सुरक्षा की गारंटी नहीं देते।
        </p>

        <h3 className="text-lg font-semibold mb-2">18. डेटा संरक्षण अवधि</h3>
        <p className="text-gray-300 mb-6">
          जानकारी केवल आवश्यक अवधि तक ही रखी जाती है।
        </p>

        <h3 className="text-lg font-semibold mb-2">19. बच्चों की गोपनीयता</h3>
        <p className="text-gray-300 mb-6">
          यह गेम 18 वर्ष से कम आयु वालों के लिए नहीं है।
        </p>

        <h3 className="text-lg font-semibold mb-2">20. तृतीय-पक्ष सेवाएँ</h3>
        <p className="text-gray-300 mb-6">
          हम बाहरी वेबसाइटों की गोपनीयता नीतियों के लिए जिम्मेदार नहीं हैं।
        </p>

        <h3 className="text-lg font-semibold mb-2">21. उपयोगकर्ता अधिकार</h3>
        <p className="text-gray-300 mb-6">
          आप अपनी जानकारी को देखने, सुधारने या हटाने का अनुरोध कर सकते हैं।
        </p>

        <h3 className="text-lg font-semibold mb-2">22. नीति में परिवर्तन</h3>
        <p className="text-gray-300 mb-6">
          हम समय-समय पर इस दस्तावेज़ को अपडेट कर सकते हैं।
        </p>

        <h3 className="text-lg font-semibold mb-2">23. संपर्क करें</h3>
        <p className="text-gray-300">
          📧 ईमेल:{" "}
          <a
            href="mailto:luckystarlivegame@gmail.com"
            className="text-purple-400 hover:underline"
          >
            luckystarlivegame@gmail.com
          </a>
        </p>

      </div>
      <div className="max-w-5xl mx-auto shadow-lg p-6 md:p-8">

        {/* HEADER */}
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">
          Terms & Conditions and Privacy Policy
        </h1>
        <p className="text-center text-sm text-gray-400 mb-6">
          Effective Date: <span className="text-white">15/12/2025</span>
        </p>

        <p className="text-gray-300 mb-4">
          Welcome to Andar Bahar Live Game (“Game”, “Service”, “we”, “our”, “us”).
          This combined Terms & Conditions and Privacy Policy governs your access
          to and use of our mobile application, website, and related services.
        </p>

        <p className="text-gray-300 mb-4">
          By accessing or using the Service, you agree to be bound by this
          document. If you do not agree, please discontinue use of the Service
          immediately.
        </p>

        <p className="text-gray-300 mb-8">
          This document is governed by and prepared in accordance with the laws
          applicable in India, including the Information Technology Act, 2000 and
          relevant rules thereunder.
        </p>

        {/* PART A */}
        <h2 className="text-xl font-semibold mt-8 mb-3">
          PART A – TERMS AND CONDITIONS
        </h2>

        <h3 className="text-lg font-semibold mb-2">1. Eligibility</h3>
        <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
          <li>
            1.1 You must be 18 years of age or older to use the Andar Bahar Live
            Game.
          </li>
          <li>
            1.2 By using the Service, you represent and warrant that:
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
              <li>You are legally competent to enter into a binding agreement</li>
              <li>
                You are not prohibited from using such services under applicable
                laws
              </li>
              <li>
                You are accessing the Game from a jurisdiction where it is
                legally permitted
              </li>
            </ul>
          </li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">2. Nature of the Game</h3>
        <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
          <li>
            2.1 Andar Bahar Live Game is strictly an amusement and
            entertainment-based game.
          </li>
          <li>
            2.2 The Game does not involve real money, real cash winnings, or
            real-money gambling in any form.
          </li>
          <li>
            2.3 Any coins, points, tokens, or virtual items used in the Game are
            purely virtual, have no real-world monetary value, and are intended
            solely for entertainment.
          </li>
          <li>
            2.4 Users must not use, stake, wager, or associate any real money with
            gameplay, either directly or indirectly.
          </li>
          <li>
            2.5 We shall not be responsible or liable for any real-money
            transactions, losses, disputes, or claims arising from users
            independently engaging in real-money involvement.
          </li>
          <li>
            2.6 The Game is intended solely for fun and recreational purposes,
            and game outcomes do not result in real-world financial gain or loss.
          </li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">3. User Account</h3>
        <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
          <li>
            3.1 You may be required to create an account to access certain
            features.
          </li>
          <li>
            3.2 You are responsible for maintaining the confidentiality of your
            account credentials and all activities under your account.
          </li>
          <li>
            3.3 We reserve the right to suspend or terminate accounts that:
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
              <li>Provide false or misleading information</li>
              <li>Violate these terms</li>
              <li>Engage in fraudulent, abusive, or unlawful activity</li>
            </ul>
          </li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">4. User Responsibilities</h3>
        <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
          <li>Use the Game for illegal or unauthorized purposes</li>
          <li>
            Attempt to manipulate, exploit, reverse-engineer, or interfere with
            the Game
          </li>
          <li>Use bots, automation, or unfair practices</li>
          <li>Harass or harm other users</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">
          5. Internet Connectivity & Gameplay Responsibility
        </h3>
        <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
          <li>
            5.1 Users must ensure they have a stable and proper internet
            connection while playing.
          </li>
          <li>
            5.2 We are not responsible for gameplay disruption due to:
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
              <li>Poor internet connectivity</li>
              <li>Automatic logouts</li>
              <li>Network or device issues</li>
            </ul>
          </li>
          <li>
            5.3 In such cases, game results, credits, or settlements will be
            considered final strictly as per the Game History / Player History
            recorded in the system.
          </li>
          <li>
            5.4 No claims beyond official in-game records will be entertained.
          </li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">
          6. Betting Window & Action Timing
        </h3>
        <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
          <li>
            6.1 Users must place their chips, coins, or virtual bets within the
            active betting window.
          </li>
          <li>
            6.2 Once the betting window is closed, no actions can be performed.
          </li>
          <li>
            6.3 Failure to place bets on time—due to delay, hesitation, technical
            issues, or internet problems—shall not be the responsibility of the
            organization.
          </li>
          <li>
            6.4 Users acknowledge that timely gameplay actions are entirely their
            responsibility.
          </li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">
          7. Payments, Virtual Items, and Purchases
        </h3>
        <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
          <li>7.1 The Game may offer virtual items or in-app purchases.</li>
          <li>
            7.2 All purchases are final and non-refundable, unless required by
            law.
          </li>
          <li>
            7.3 Virtual items cannot be exchanged for cash or transferred outside
            the Game.
          </li>
          <li>
            7.4 Payments are processed via third-party gateways. We are not
            responsible for gateway failures.
          </li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">
          8. Fair Play and Anti-Fraud
        </h3>
        <p className="text-gray-300 mb-6">
          Any attempt to cheat, collude, exploit bugs, or manipulate gameplay may
          result in immediate suspension or permanent termination without notice.
        </p>

        <h3 className="text-lg font-semibold mb-2">
          9. Intellectual Property
        </h3>
        <p className="text-gray-300 mb-6">
          All content, software, logos, and designs belong to or are licensed to
          Andar Bahar Live Game. Unauthorized use is strictly prohibited.
        </p>

        <h3 className="text-lg font-semibold mb-2">
          10. Disclaimer & Limitation of Liability
        </h3>
        <p className="text-gray-300 mb-6">
          The Service is provided on an “as is” and “as available” basis.
          <br />
          We are not liable for indirect, incidental, or consequential damages.
          <br />
          Your sole remedy is to discontinue use of the Game.
        </p>

        <h3 className="text-lg font-semibold mb-2">
          11. Suspension and Termination
        </h3>
        <p className="text-gray-300 mb-6">
          We reserve the right to suspend or terminate access at any time for
          violations of these terms or applicable laws.
        </p>

        <h3 className="text-lg font-semibold mb-2">12. Indemnification</h3>
        <p className="text-gray-300 mb-6">
          You agree to indemnify and hold harmless Andar Bahar Live Game from any
          claims arising from your use of the Service or violation of this
          document.
        </p>

        <h3 className="text-lg font-semibold mb-2">
          13. Governing Law and Jurisdiction
        </h3>
        <p className="text-gray-300 mb-8">
          This document shall be governed by the laws of India. Courts in India
          shall have exclusive jurisdiction.
        </p>

        {/* PART B */}
        <h2 className="text-xl font-semibold mt-10 mb-3">
          PART B – PRIVACY POLICY
        </h2>

        <h3 className="text-lg font-semibold mb-2">
          14. Information We Collect
        </h3>

        <p className="text-gray-300 font-semibold">14.1 Personal Information</p>
        <ul className="list-disc list-inside text-gray-300 space-y-1 mb-4">
          <li>Name or username</li>
          <li>Email address</li>
          <li>Contact details</li>
          <li>Date of birth / age confirmation</li>
          <li>Support or feedback information</li>
        </ul>

        <p className="text-gray-300 font-semibold">14.2 Non-Personal Information</p>
        <ul className="list-disc list-inside text-gray-300 space-y-1 mb-4">
          <li>Device type, OS, identifiers</li>
          <li>IP address</li>
          <li>App usage and interaction logs</li>
          <li>Game statistics and preferences</li>
        </ul>

        <p className="text-gray-300 font-semibold">14.3 Payment Information</p>
        <p className="text-gray-300 mb-6">
          Payment processing is handled by third-party gateways. We do not store
          sensitive payment data.
        </p>

        <h3 className="text-lg font-semibold mb-2">
          15. How We Use Information
        </h3>
        <ul className="list-disc list-inside text-gray-300 space-y-1 mb-6">
          <li>Operate and improve the Game</li>
          <li>Manage accounts and gameplay</li>
          <li>Communicate updates and support</li>
          <li>Prevent fraud and ensure security</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">
          16. Sharing of Information
        </h3>
        <p className="text-gray-300 mb-6">
          We do not sell personal data. Information may be shared only with:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-1 mb-6">
          <li>Service providers under confidentiality</li>
          <li>Legal authorities when required</li>
          <li>Business entities in case of mergers or acquisitions</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">17. Data Security</h3>
        <p className="text-gray-300 mb-6">
          We use reasonable safeguards to protect user data. However, no system
          is completely secure.
        </p>

        <h3 className="text-lg font-semibold mb-2">18. Data Retention</h3>
        <p className="text-gray-300 mb-6">
          Data is retained only as long as necessary or as required by law.
        </p>

        <h3 className="text-lg font-semibold mb-2">19. Children’s Privacy</h3>
        <p className="text-gray-300 mb-6">
          The Game is intended for users 18 years and above. We do not knowingly
          collect data from minors.
        </p>

        <h3 className="text-lg font-semibold mb-2">
          20. Third-Party Services
        </h3>
        <p className="text-gray-300 mb-6">
          We are not responsible for the privacy practices of third-party
          services linked through the Game.
        </p>

        <h3 className="text-lg font-semibold mb-2">21. User Rights</h3>
        <p className="text-gray-300 mb-6">
          Users may request access, correction, or deletion of their personal
          data, subject to legal requirements.
        </p>

        <h3 className="text-lg font-semibold mb-2">
          22. Changes to This Document
        </h3>
        <p className="text-gray-300 mb-6">
          We may update this document from time to time. Continued use
          constitutes acceptance of updates.
        </p>

        <h3 className="text-lg font-semibold mb-2">
          23. Contact Information
        </h3>
        <p className="text-gray-300 mb-4">
          For any questions or concerns:
        </p>
        <p className="text-gray-300">
          📧 Email:{" "}
          <a
            href="mailto:luckystarlivegame@gmail.com"
            className="text-purple-400 hover:underline"
          >
            luckystarlivegame@gmail.com
          </a>
        </p>

        <p className="text-gray-400 mt-8 text-center">
          Andar Bahar Live Game
        </p>

      </div>
    </div>);     
}

export default PopupMessage;