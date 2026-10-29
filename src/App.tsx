import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { ToastContainer } from './components/Layout/ToastContainer';
import { AdminPortal } from './components/Admin/AdminPortal';
import { AddEventModal } from './components/Calendar/AddEventModal';
import { NewReservationModal } from './components/Reservations/NewReservationModal';
import { HelpModal } from './components/Common/HelpModal';
import type { Venue } from './types';

const MainPortalContent: React.FC = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isNewReservationOpen, setIsNewReservationOpen] = useState(false);
  const [newReservationPreset, setNewReservationPreset] = useState<{
    venue?: Venue;
    date?: string;
    startTime?: string;
    endTime?: string;
  } | undefined>(undefined);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleOpenReservationModal = (preset?: {
    venue?: Venue;
    date?: string;
    startTime?: string;
    endTime?: string;
  }) => {
    setNewReservationPreset(preset);
    setIsNewReservationOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-phdark-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Persistent Sidebar (Barangay Administration navigation) */}
      <Sidebar
        isOpenMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
        {/* Sticky Top Header with PST Clock, Search, Notifications, Theme and Quick Actions */}
        <Header
          onToggleMobileMenu={() => setIsMobileNavOpen(!isMobileNavOpen)}
          onOpenNewEventModal={() => setIsAddEventOpen(true)}
          onOpenNewReservationModal={() => handleOpenReservationModal()}
        />

        {/* Administration Console Body */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          <AdminPortal
            onOpenBookingModal={handleOpenReservationModal}
            onOpenNewEventModal={() => setIsAddEventOpen(true)}
          />
        </main>

        {/* Municipal Footer */}
        <footer className="py-4 px-6 border-t border-slate-200 dark:border-phdark-800 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-phdark-900/50">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 font-medium">
              <span>Barangay Cantaongon Official Portal</span>
              <span>•</span>
              <span>Municipality of Loon, Bohol • Republic of the Philippines</span>
            </p>
            <p className="text-[11px] text-slate-400">
              Official Administration Console (Executive & Secretariat)
            </p>
          </div>
        </footer>
      </div>

      {/* Global Modals */}
      <AddEventModal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
      />

      <NewReservationModal
        isOpen={isNewReservationOpen}
        onClose={() => setIsNewReservationOpen(false)}
        initialVenue={newReservationPreset?.venue}
        initialDate={newReservationPreset?.date}
        initialStartTime={newReservationPreset?.startTime}
        initialEndTime={newReservationPreset?.endTime}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Floating System Toasts */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainPortalContent />
    </AppProvider>
  );
}

export default App;
