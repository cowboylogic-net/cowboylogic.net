import styles from "./Terms.module.css";
import { useEffect } from "react";

const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || "Your Company";
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "support@example.com";
const JURISDICTION = import.meta.env.VITE_JURISDICTION || "Your country/state";
const LAST_UPDATED = import.meta.env.VITE_TERMS_LAST_UPDATED || "2025-01-01";

export default function Terms() {
  useEffect(() => {
    document.title = `Terms of Service — ${COMPANY_NAME}`;
  }, []);

  return (
    <div className="layoutContainer">
      <div className={styles.page}>
        <h1>Terms of Service</h1>
        <p className={styles.meta}>Last updated: {LAST_UPDATED}</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using the website and services of {COMPANY_NAME}, you agree to be bound by
          these Terms. If you do not agree, do not use our services.
        </p>

        <h2>2. Accounts</h2>
        <ul>
          <li>You must provide accurate information and keep your credentials secure.</li>
          <li>You are responsible for all activity that occurs under your account.</li>
        </ul>

        <h2>3. Purchases & Payments</h2>
        <ul>
          <li>Prices and availability are subject to change.</li>
          <li>Payments are processed by our payment provider; you agree to their terms.</li>
          <li>Refunds, if any, are handled per our refund policy.</li>
        </ul>

        <h2>4. Acceptable Use</h2>
        <ul>
          <li>No unlawful, infringing, or harmful activity.</li>
          <li>No attempts to disrupt, reverse engineer, or bypass security.</li>
          <li>No misuse of content, trademarks, or intellectual property.</li>
        </ul>

        <h2>5. Intellectual Property</h2>
        <p>
          All content and materials are owned by {COMPANY_NAME} or licensors and protected by
          applicable laws. You receive a limited, non-exclusive license to use the site as intended.
        </p>

        <h2>6. Third-Party Services</h2>
        <p>
          Our services may integrate with third parties (e.g., Google Sign-In, Square). We are not
          responsible for third-party content, terms, or policies.
        </p>

        <h2>7. Disclaimers</h2>
        <p>
          Services are provided “as is” and “as available”. We disclaim warranties to the extent
          permitted by law.
        </p>

        <h2>8. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, {COMPANY_NAME} shall not be liable for indirect,
          incidental, or consequential damages.
        </p>

        <h2>9. Termination</h2>
        <p>
          We may suspend or terminate access if you violate these Terms. You may stop using the
          services at any time.
        </p>

        <h2>10. Governing Law</h2>
        <p>These Terms are governed by the laws of {JURISDICTION}, unless otherwise required.</p>

        <h2>11. Changes to Terms</h2>
        <p>
          We may update these Terms. We will post the new version with an updated date. Continued use
          constitutes acceptance of the updated Terms.
        </p>

        <h2>12. Contact</h2>
        <p>
          Questions? Contact <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>

        <p className={styles.note}>
          This page is for informational purposes and does not constitute legal advice.
        </p>
      </div>
    </div>
  );
}
