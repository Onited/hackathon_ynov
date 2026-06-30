import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { useChat } from './hooks/useChat';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const {
    sessions,
    activeSession,
    activeId,
    isGenerating,
    createSession,
    selectSession,
    deleteSession,
    sendMessage,
    stopGenerating,
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-white dark:bg-[#0a0a12] transition-colors duration-300">
      <Sidebar
        sessions={sessions}
        activeId={activeId}
        onNewChat={createSession}
        onSelect={selectSession}
        onDelete={deleteSession}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <ChatArea
        session={activeSession}
        isGenerating={isGenerating}
        theme={theme}
        onToggleTheme={toggleTheme}
        onToggleSidebar={() => setSidebarOpen(true)}
        onSend={sendMessage}
        onStop={stopGenerating}
      />
    </div>
  );
}
