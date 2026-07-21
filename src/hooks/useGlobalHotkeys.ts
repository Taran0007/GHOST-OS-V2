import { useEffect, useState, useCallback } from 'react';
import { StorageService } from '../core/StorageService';
import { OBSService } from '../core/OBSService';
import { AIEngine } from '../core/AIEngine';
import { EventBus } from '../core/EventBus';
import { HotkeyConfig } from '../types';

export function useGlobalHotkeys() {
  const [hotkeys, setHotkeys] = useState<HotkeyConfig>(StorageService.getHotkeys());
  const [lastAction, setLastAction] = useState<{ name: string; timestamp: number } | null>(null);

  const triggerAction = useCallback((actionName: string, actionFn: () => void) => {
    try {
      actionFn();
      setLastAction({ name: actionName, timestamp: Date.now() });
      EventBus.emit('AlertTriggered', 'useGlobalHotkeys', {
        title: `Hotkey Executed: ${actionName}`,
        type: 'hotkey',
      });
    } catch (err) {
      console.warn(`[GlobalHotkeys] Failed to execute ${actionName}:`, err);
    }
  }, []);

  // Hotkey Execution Dispatcher
  const handleShortcutTrigger = useCallback((actionKey: keyof HotkeyConfig) => {
    switch (actionKey) {
      case 'sceneGaming':
        triggerAction('Gaming Scene Switch', () => OBSService.switchScene('🎮 Gaming Main'));
        break;
      case 'sceneChatting':
        triggerAction('Just Chatting Scene Switch', () => OBSService.switchScene('💬 Just Chatting & AI'));
        break;
      case 'sceneBRB':
        triggerAction('BRB Scene Switch', () => OBSService.switchScene('☕ Be Right Back'));
        break;
      case 'sceneEnding':
        triggerAction('Starting Soon Scene Switch', () => OBSService.switchScene('⏳ Starting Soon'));
        break;
      case 'muteMic':
        triggerAction('Toggle Mic Audio Mute', () => {
          const current = OBSService.getCurrentScene();
          if (current) {
            const mic = current.sources.find((s) => s.type === 'audio' && s.name.toLowerCase().includes('mic'));
            if (mic) {
              OBSService.toggleAudioMute(current.id, mic.id);
            }
          }
        });
        break;
      case 'spinWheel':
        triggerAction('Wheel of Fortune Spin', () => {
          EventBus.emit('FlowExecuted', 'useGlobalHotkeys', { action: 'spin_wheel' });
        });
        break;
      case 'triggerAIRoast':
        triggerAction('AI Chat Roast Triggered', () => {
          AIEngine.generateRoast('ChatUser').then((roast) => {
            EventBus.emit('ChatMessage', 'useGlobalHotkeys', {
              id: `roast-${Date.now()}`,
              username: 'GhostAI_Bot',
              message: roast,
              platform: 'twitch',
              isBot: true,
              timestamp: new Date().toLocaleTimeString(),
            });
          });
        });
        break;
      case 'emergencyStop':
        triggerAction('Emergency Stream Cut', () => OBSService.toggleStream());
        break;
      default:
        break;
    }
  }, [triggerAction]);

  useEffect(() => {
    // 1. Web Browser Keyboard Listener
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid capturing hotkeys when user is typing in input fields
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      const ctrl = e.ctrlKey || e.metaKey;
      const alt = e.altKey;
      const shift = e.shiftKey;
      const key = e.key.toUpperCase();

      // Check key against mapped HotkeyConfig
      if (ctrl && key === '1') handleShortcutTrigger('sceneGaming');
      if (ctrl && key === '2') handleShortcutTrigger('sceneChatting');
      if (ctrl && key === '3') handleShortcutTrigger('sceneBRB');
      if (ctrl && key === '4') handleShortcutTrigger('sceneEnding');
      if (ctrl && key === 'M') handleShortcutTrigger('muteMic');
      if (ctrl && shift && key === 'W') handleShortcutTrigger('spinWheel');
      if (ctrl && shift && key === 'R') handleShortcutTrigger('triggerAIRoast');
      if (ctrl && shift && key === 'M') {
        EventBus.emit('MemeVideoTriggered', 'useGlobalHotkeys', {
          title: '🔥 DANCING CAT MEME OVERLAY',
          videoUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWkzaHF4aW1sdGg4azVsNXNydjQyZHc1bXFpdnlmdThic3R4MmcwNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JPbDhAzsrtdB3unK9v/giphy.gif',
          durationSeconds: 5,
        });
        EventBus.emit('AlertTriggered', 'useGlobalHotkeys', {
          title: '🎬 Hotkey Meme Overlay Triggered! (Ctrl+Shift+M)',
          type: 'obs',
        });
      }
      if (ctrl && alt && key === 'E') handleShortcutTrigger('emergencyStop');
    };

    // 2. Electron IPC Listener (Captured when minimized or backgrounded)
    const electronWindow = window as any;
    if (electronWindow.electronAPI) {
      electronWindow.electronAPI.onHotkey((hotkeyType: string) => {
        if (hotkeyType === 'scene-switch') handleShortcutTrigger('sceneGaming');
        if (hotkeyType === 'ai-roast') handleShortcutTrigger('triggerAIRoast');
      });

      electronWindow.electronAPI.onTrigger((triggerType: string) => {
        if (triggerType === 'spin-wheel') handleShortcutTrigger('spinWheel');
        if (triggerType === 'toggle-ai') handleShortcutTrigger('triggerAIRoast');
      });
    }

    // 3. Storage update listener
    const unsubHotkeyUpdate = EventBus.subscribe('HotkeyUpdated', (evt) => {
      setHotkeys(evt.payload.hotkeys);
    });

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      unsubHotkeyUpdate();
    };
  }, [handleShortcutTrigger]);

  return {
    hotkeys,
    lastAction,
    triggerAction: handleShortcutTrigger,
    isElectronAvailable: typeof window !== 'undefined' && !!(window as any).electronAPI,
  };
}
