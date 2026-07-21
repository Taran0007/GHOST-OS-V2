import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, WorkspaceView } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { OverlayPreviewModal } from './components/OverlayPreviewModal';
import { OverviewDashboard } from './views/OverviewDashboard';
import { PolaroidPluginView } from './views/PolaroidPluginView';
import { StreamAnalyticsView } from './views/StreamAnalyticsView';
import { MultiChatView } from './views/MultiChatView';
import { OBSStudioView } from './views/OBSStudioView';
import { AICoHostView } from './views/AICoHostView';
import { StreamAndAudioDeckView } from './views/StreamAndAudioDeckView';
import { WheelStudioView } from './views/WheelStudioView';
import { EconomyAndGtaView } from './views/EconomyAndGtaView';
import { FlowBuilderView } from './views/FlowBuilderView';
import { MarketplaceView } from './views/MarketplaceView';
import { AccountIntegrationsView } from './views/AccountIntegrationsView';
import { DesktopAndAudioView } from './views/DesktopAndAudioView';
import { MobileCompanionView } from './views/MobileCompanionView';
import { DeveloperConsoleView } from './views/DeveloperConsoleView';
import { StandaloneOverlayView } from './views/StandaloneOverlayView';
import { StandaloneMobileView } from './views/StandaloneMobileView';
import { ThemeEngine } from './core/ThemeEngine';
import { EventBus } from './core/EventBus';
import { useGlobalHotkeys } from './hooks/useGlobalHotkeys';

export default function App() {
  const [currentView, setCurrentView] = useState<WorkspaceView>('dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isOverlayPreviewOpen, setIsOverlayPreviewOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState(ThemeEngine.getActiveTheme());
  const [overlayHash, setOverlayHash] = useState<string>(
    typeof window !== 'undefined' ? window.location.hash : ''
  );

  // Initialize global keyboard shortcut manager (supports browser & minimized Electron IPC)
  const { lastAction } = useGlobalHotkeys();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    const handleHashChange = () => {
      const h = window.location.hash;
      setOverlayHash(h);
      if (h === '#mobile-companion' || h === '#mobile') {
        setCurrentView('mobile');
      }
    };

    if (window.location.hash === '#mobile-companion' || window.location.hash === '#mobile') {
      setCurrentView('mobile');
    }

    const unsubTheme = EventBus.subscribe('ThemeChanged', (evt) => {
      setActiveTheme(evt.payload.theme);
    });

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', handleHashChange);
      unsubTheme();
    };
  }, []);

  // Standalone Transparent Overlay Mode for OBS
  if (overlayHash && overlayHash.startsWith('#overlay-')) {
    return <StandaloneOverlayView type={overlayHash} />;
  }

  // Standalone Isolated Mobile View Modes (Chat, Deck, Soundboard, Wheel)
  if (overlayHash && ['#mobile-chat', '#mobile-deck', '#mobile-soundboard', '#mobile-wheel'].includes(overlayHash)) {
    return <StandaloneMobileView mode={overlayHash} />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <OverviewDashboard />;
      case 'polaroid':
        return <PolaroidPluginView />;
      case 'analytics':
        return <StreamAnalyticsView />;
      case 'chat':
        return <MultiChatView />;
      case 'obs':
        return <OBSStudioView />;
      case 'ai':
        return <AICoHostView />;
      case 'deck':
        return <StreamAndAudioDeckView />;
      case 'wheel':
        return <WheelStudioView />;
      case 'economy':
        return <EconomyAndGtaView />;
      case 'flow':
        return <FlowBuilderView />;
      case 'marketplace':
        return <MarketplaceView />;
      case 'accounts':
        return <AccountIntegrationsView />;
      case 'desktop_audio':
        return <DesktopAndAudioView />;
      case 'mobile':
        return <MobileCompanionView />;
      case 'dev':
        return <DeveloperConsoleView />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${activeTheme.bgClass}`}>
      {/* Fixed Header */}
      <Header
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenMobileQR={() => setCurrentView('mobile')}
        onOpenOverlayPreview={() => setIsOverlayPreviewOpen(true)}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <Sidebar currentView={currentView} onSelectView={setCurrentView} />

        {/* Workspace Content Viewport */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {renderCurrentView()}
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(view) => {
          setCurrentView(view);
          setIsCommandPaletteOpen(false);
        }}
      />

      {/* OBS Browser Source Generator Modal */}
      <OverlayPreviewModal
        isOpen={isOverlayPreviewOpen}
        onClose={() => setIsOverlayPreviewOpen(false)}
      />
    </div>
  );
}
