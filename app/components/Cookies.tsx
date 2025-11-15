"use client";

import Head from "next/head";

export default function Cookies() {
  return (
    <>
      <Head>
        <title>Cookie Policy - Roots</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap"
          rel="stylesheet"
        />
      </Head>

      <main className="cookie-page-container">
        <h1 className="page-title">Cookie Policy</h1>

        <section className="what-are-cookies">
          <h2>What Are Cookies?</h2>
          <p>
            Cookies are small text files that websites store on your device to remember information about your visit,
            like login details, shopping cart contents, and site preferences. They are used to personalize your experience,
            keep you logged in, and help websites function properly. Essentially, they act as a digital memory for a website
            to recognize you and your activity when you return.
          </p>
        </section>

        <section className="cookie-types">
          <h2>Types of Cookies Used</h2>

          <div className="cookie-category strict-necessary">
            <div className="category-header">
              <i className="fa-solid fa-key" />
              <h3>Strictly Necessary Cookies</h3>
            </div>
            <ul className="cookie-list">
              <li>Session cookies - maintains an active session.</li>
              <li>Security cookies - CSRF protection.</li>
              <li>Load balancing - distributing traffic.</li>
            </ul>
            <p className="note">⚠ Consent is NOT required under Art. 5 para. (3) of Directive 2002/58/CE.</p>
          </div>

          <div className="cookie-category functional">
            <div className="category-header">
              <i className="fa-solid fa-check-circle" />
              <h3>Functional Cookies</h3>
            </div>
            <p>Enhances user experience by storing preference memory.</p>
            <ul className="cookie-list">
              <li>Preferred language</li>
              <li>Display settings</li>
              <li>Shopping cart</li>
            </ul>
            <p className="note-consent">✓ Requires consent</p>
          </div>

          <div className="cookie-category analytics">
            <div className="category-header">
              <i className="fa-solid fa-chart-line" />
              <h3>Analytics Cookies</h3>
            </div>
            <p>Collects information on how the site is used.</p>
            <ul className="cookie-list">
              <li>Google Analytics</li>
              <li>Visitor statistics</li>
              <li>User behavior</li>
            </ul>
            <p className="note-consent">✓ Requires consent</p>
          </div>
        </section>

        <section className="footer-note">
          <p>
            For more detailed information, please read our <a href="#">Full Privacy Statement.</a>
          </p>
        </section>
      </main>

      <style jsx>{`
        :root {
          --dark-bg: #111;
          --dark-text: #eee;
          --dark-secondary: #222;
          --primary-color: #70ad47;
          --strict-color: #d4edda;
          --functional-color: #cce5ff;
          --analytics-color: #e2d9ff;
          --strict-bg: #1c352d;
          --functional-bg: #1a2a40;
          --analytics-bg: #302045;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        :global(html, body) {
          height: 100%;
        }

        :global(body) {
          font-family: "Inter", sans-serif;
          background-color: var(--dark-bg);
          color: var(--dark-text);
          line-height: 1.6;
          padding-top: 60px;
        }

        a {
          color: var(--primary-color);
          text-decoration: none;
        }

        a:hover {
          text-decoration: underline;
        }

        .cta-button {
          background-color: var(--primary-color);
          color: var(--dark-bg);
          padding: 8px 20px;
          border: none;
          border-radius: 5px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .cta-button:hover {
          background-color: #558a38;
        }

        .cookie-page-container {
          max-width: 950px;
          margin: 40px auto;
          padding: 35px;
          background: rgb(41, 39, 35);
          border: 2px solid rgb(6, 82, 25);
          border-radius: 40px;
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }

        .page-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--primary-color);
          text-align: center;
          margin-bottom: 40px;
          padding-top: 20px;
        }

        .what-are-cookies h2 {
          font-size: 1.8rem;
          margin-bottom: 15px;
          color: var(--dark-text);
        }

        .cookie-types h2 {
          font-size: 2rem;
          margin: 40px 0 20px 0;
          color: var(--dark-text);
        }

        .cookie-category {
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          border-left: 5px solid;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .category-header {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }

        .category-header i {
          font-size: 1.5rem;
          margin-right: 15px;
        }

        .category-header h3 {
          font-size: 1.4rem;
          font-weight: 600;
        }

        .cookie-list {
          list-style: none;
          padding-left: 20px;
          margin-top: 10px;
        }

        .cookie-list li {
          position: relative;
          padding-left: 20px;
          margin-bottom: 8px;
        }

        .cookie-list li::before {
          content: "•";
          color: var(--dark-text);
          font-weight: bold;
          display: inline-block;
          width: 1em;
          margin-left: -1em;
        }

        .note,
        .note-consent {
          margin-top: 15px;
          padding: 10px 15px;
          border-radius: 5px;
          font-style: italic;
          font-size: 0.9rem;
        }

        .strict-necessary {
          border-left-color: var(--primary-color);
          background-color: var(--strict-bg);
        }

        .strict-necessary .category-header i {
          color: var(--primary-color);
        }

        .note {
          background-color: #3b281f;
          color: #ffcc00;
        }

        .functional {
          border-left-color: #007bff;
          background-color: var(--functional-bg);
        }

        .functional .category-header i {
          color: #007bff;
        }

        .analytics {
          border-left-color: #9370db;
          background-color: var(--analytics-bg);
        }

        .analytics .category-header i {
          color: #9370db;
        }

        .note-consent {
          background-color: #1a301d;
          color: #38a169;
          font-weight: bold;
        }

        .footer-note {
          margin-top: 20px;
          text-align: center;
        }
      `}</style>
    </>
  );
}