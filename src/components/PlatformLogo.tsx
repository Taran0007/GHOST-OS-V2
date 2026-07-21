import React from 'react';
import { Bot, MessageSquare } from 'lucide-react';
import { Platform } from '../types';

interface PlatformLogoProps {
  platform: Platform | 'discord' | 'tiktok' | 'kick' | 'twitch' | 'youtube' | 'system' | string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const PlatformLogo: React.FC<PlatformLogoProps> = ({
  platform,
  size = 'md',
  showLabel = false,
}) => {
  const normalized = (platform || 'twitch').toLowerCase();

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const badgePadding = {
    sm: 'px-1.5 py-0.5 text-[9px]',
    md: 'px-2 py-1 text-[10px]',
    lg: 'px-2.5 py-1 text-xs',
  };

  if (normalized === 'twitch') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-lg font-bold font-mono bg-[#9146FF]/15 text-[#bf94ff] border border-[#9146FF]/30 ${badgePadding[size]}`}
        title="Twitch Stream"
      >
        <svg className={`${iconSizes[size]} fill-current`} viewBox="0 0 24 24">
          <path d="M11.571 4.714h1.715v5.143h-1.715zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
        </svg>
        {showLabel && <span>TWITCH</span>}
      </span>
    );
  }

  if (normalized === 'kick') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-lg font-bold font-mono bg-[#53FC18]/15 text-[#53FC18] border border-[#53FC18]/30 ${badgePadding[size]}`}
        title="Kick Live Stream"
      >
        <svg className={`${iconSizes[size]} fill-current`} viewBox="0 0 24 24">
          <path d="M3 3h4.5v6.5L13.5 3H19l-6.8 7.5L19 21h-5.5l-6-8v8H3V3z" />
        </svg>
        {showLabel && <span>KICK</span>}
      </span>
    );
  }

  if (normalized === 'youtube') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-lg font-bold font-mono bg-red-600/15 text-red-400 border border-red-500/30 ${badgePadding[size]}`}
        title="YouTube Gaming"
      >
        <svg className={`${iconSizes[size]} fill-current`} viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
        {showLabel && <span>YOUTUBE</span>}
      </span>
    );
  }

  if (normalized === 'discord') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-lg font-bold font-mono bg-[#5865F2]/15 text-[#7983f5] border border-[#5865F2]/30 ${badgePadding[size]}`}
        title="Discord Server Chat"
      >
        <svg className={`${iconSizes[size]} fill-current`} viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
        {showLabel && <span>DISCORD</span>}
      </span>
    );
  }

  if (normalized === 'tiktok') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-lg font-bold font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 ${badgePadding[size]}`}
        title="TikTok Live"
      >
        <svg className={`${iconSizes[size]} fill-current`} viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.28-2.81.9-5.63 3.12-7.3 1.25-.96 2.82-1.5 4.38-1.48v4.06c-.66.02-1.33.2-1.92.52-.94.51-1.6 1.42-1.78 2.47-.28 1.52.41 3.12 1.71 3.89 1.18.72 2.73.68 3.86-.09.84-.55 1.37-1.47 1.48-2.47.07-2.31.02-4.62.03-6.93V.02z" />
        </svg>
        {showLabel && <span>TIKTOK</span>}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg font-bold font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 ${badgePadding[size]}`}
      title="GhostOS System AI"
    >
      <Bot className={`${iconSizes[size]} text-indigo-400`} />
      {showLabel && <span>GHOST AI</span>}
    </span>
  );
};
