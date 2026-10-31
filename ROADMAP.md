# Barangay Cantaongon Portal: Future Improvements & Recommendations

This roadmap archives the prioritized recommendations and architectural enhancements for the **Barangay Cantaongon Public Portal and Administration Console**. Keep this document as a reference when planning future development phases.

---

## 📌 Phase 1: Security & Secretariat Management

### 1. Customizable Admin PIN
* **Objective:** Allow the Barangay Secretary or Punong Barangay to change the default passcode (`1234`) without modifying source code.
* **Implementation Plan:**
  - Add a **"Security & Passcode"** tab inside the `UserProfileModal`.
  - Provide fields: *Current PIN*, *New 4-Digit PIN*, and *Confirm New PIN*.
  - Store the updated PIN in browser `localStorage` and sync it to the Supabase cloud settings table.
  - Include an emergency master fallback or admin reset procedure.

---

## 📊 Phase 2: Administrative Productivity & LGU Reporting

### 2. Export Bookings & Audit Trail to Excel / CSV
* **Objective:** Simplify periodic reporting to the Mayor's Office, Municipal Council (Sangguniang Bayan), and DILG.
* **Implementation Plan:**
  - Add an **`📥 Export to CSV / Excel`** button in the **Facility Bookings** table.
  - Add an **`📥 Export Audit Trail`** button in the **Activity Audit Trail** tab.
  - Export columns: *Reference Number, Date, Time Window, Venue, Organization / Resident, Contact Person, Status, Approval Date, Approving Officer*.
  - Use lightweight client-side CSV generator (no external heavy libraries required).

### 3. Printable Daily Hall & Court Schedule Sheet
* **Objective:** Provide a physical printed 1-page itinerary for Barangay Tanods, janitorial staff, and hall receptionists.
* **Implementation Plan:**
  - Add a **"Print Today's Schedule"** button on the Executive Dashboard.
  - Formats a clean 1-page summary showing morning, afternoon, and evening occupancy for the Gymnasium and Multipurpose Hall.

---

## 📲 Phase 3: Resident Communication

### 4. Automated SMS Notifications (Semaphore Philippines / Twilio)
* **Objective:** Notify residents immediately when their booking is approved or declined without requiring them to re-check the website.
* **Implementation Plan:**
  - Integrate a Philippine SMS gateway (e.g., [Semaphore.co](https://semaphore.co/)) which supports all local networks (Globe, Smart, DITO, TNT, TM).
  - Trigger automated SMS upon Secretary approval:
    > *"Maayong adlaw! Your booking for Barangay Gymnasium on Nov 11, 2026 (Ref: RES-2026-001) has been APPROVED by the Barangay Secretary. Please claim your signed permit at the Barangay Hall."*
  - Trigger automated SMS with reasons if declined or rescheduled.

---

## ⚡ Phase 4: Performance & Network Optimization

### 5. Code Splitting & Lazy Loading for Provincial Mobile Networks
* **Objective:** Reduce initial page load bundle size from 621 kB to under 350 kB for lightning-fast speeds on provincial mobile data (3G/4G).
* **Implementation Plan:**
  - Wrap non-critical modals and heavy components in `React.lazy()` and `Suspense`:
    - `FacilityPermitModal` (only loaded when user clicks "Print Permit")
    - `AuditLogView` (only loaded when Admin opens the Audit tab)
    - `HelpModal` (only loaded on demand)
  - Configure Vite chunking in `vite.config.ts`.

---

## 📋 Summary Table for Quick Reference

| Priority | Feature | Category | Target Users | Estimated Impact |
| :---: | :--- | :---: | :---: | :---: |
| **High** | Customizable Admin PIN | Security | Secretary / Admin | Eliminates default passcode reliance |
| **High** | Export to Excel / CSV | Admin Tools | LGU Officials / DILG | Cuts monthly report prep time by 90% |
| **Medium** | Daily Hall Itinerary Printout | Operations | Tanods / Facilities Staff | Clear daily venue handover & security |
| **Medium** | SMS Approval Alerts (Semaphore) | Resident UX | Public Residents | Instant notification on mobile phones |
| **Low** | Dynamic Lazy Loading | Performance | Mobile Data Users | Faster first-load speed on 3G connections |

---
*Archived on: October 31, 2026 • Project: Barangay Cantaongon Portal (`y-portal-mu.vercel.app`)*
