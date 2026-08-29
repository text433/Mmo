import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../types/game';
import { MessageSquare, Send, Smile, ChevronDown, ChevronUp } from 'lucide-react';

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ messages, onSendMessage }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'world' | 'guild' | 'combat' | 'system'>('all');
  const [inputText, setInputText] = useState<string>('');
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const filteredMessages = messages.filter((m) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'world') return m.senderType === 'world' || m.senderType === 'player';
    if (activeTab === 'guild') return m.senderType === 'guild';
    if (activeTab === 'combat') return m.senderType === 'combat';
    if (activeTab === 'system') return m.senderType === 'system';
    return true;
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const quickEmotes = ['⚔️ LFG!', '🔥 Boss here!', '🛡️ Protect!', '💀 RIP', '👑 GG!'];

  return (
    <div id="hud-chatbox" className="absolute bottom-6 left-6 z-20 pointer-events-auto select-none w-72 sm:w-80">
      <div className="bg-black/60 border border-white/10 rounded-lg backdrop-blur-md shadow-2xl overflow-hidden flex flex-col">
        {/* Chat Header & Tabs */}
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-black/40 border-b border-white/10 text-xs">
          <div className="flex items-center gap-1">
            {(['all', 'world', 'combat', 'system'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase transition-colors ${
                  activeTab === tab
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white p-1"
          >
            {collapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {!collapsed && (
          <>
            {/* Messages Scroll Area */}
            <div
              ref={scrollRef}
              className="h-32 overflow-y-auto p-2.5 space-y-1 text-xs select-text font-sans scrollbar-thin scrollbar-thumb-gray-700"
            >
              {filteredMessages.map((msg) => (
                <div key={msg.id} className="leading-tight flex items-baseline gap-1 break-words">
                  <span className="text-[9px] text-gray-500 font-mono">[{msg.timestamp}]</span>
                  <span
                    className="font-bold shrink-0 text-[11px]"
                    style={{
                      color:
                        msg.senderType === 'system'
                          ? '#eab308'
                          : msg.senderType === 'combat'
                          ? '#4ade80'
                          : '#60a5fa',
                    }}
                  >
                    {msg.sender}:
                  </span>
                  <span
                    className="text-gray-300 text-[11px]"
                    style={{ color: msg.color || undefined }}
                  >
                    {msg.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Emote Reactions */}
            <div className="flex items-center gap-1 px-2 py-1 bg-black/40 border-t border-white/10 overflow-x-auto">
              {quickEmotes.map((emote) => (
                <button
                  key={emote}
                  onClick={() => onSendMessage(emote)}
                  className="text-[10px] whitespace-nowrap bg-black/40 hover:bg-white/10 text-gray-300 px-1.5 py-0.5 rounded border border-white/10 font-mono transition-colors"
                >
                  {emote}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSend} className="flex items-center gap-1.5 p-1.5 bg-black/50 border-t border-white/10">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Press Enter to send chat..."
                maxLength={80}
                className="flex-1 bg-black/40 border border-white/10 rounded px-2.5 py-1 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-white/30 font-sans"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded transition-colors text-xs font-mono font-bold flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
