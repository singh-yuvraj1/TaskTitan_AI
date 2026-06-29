import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { useKaiConversation } from './useKaiConversation';
import KaiHeader from './KaiHeader';
import KaiWelcome from './KaiWelcome';
import KaiMessageList from './KaiMessageList';
import KaiInputBar from './KaiInputBar';
import KaiVoiceMode from './KaiVoiceMode';
import KaiOrb from './KaiOrb';

const API_BASE = 'http://localhost:5000/api';

const KaiDrawer: React.FC = () => {
  const {
    runAICommand,
    userEmail,
    setActiveTab,
    addTask,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  const recognitionRef = useRef<any>(null);
  const synthRef       = useRef<SpeechSynthesis | null>(null);

  // runAICommand already calls fetchUserState internally → no-op here keeps state fresh
  const noopFetchUserState = useCallback(async () => {}, []);

  const {
    messages,
    orbState,
    setOrbState,
    phase,
    isTyping,
    handleUserMessage,
    handleChipAnswer,
    handleConfirm,
    handleCancel,
    handleRetryCommand,
    clearConversation,
  } = useKaiConversation(runAICommand, noopFetchUserState);

  // ── Speech Recognition Setup ──────────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous     = false;
      rec.interimResults = true;   // show live partial transcript
      rec.lang           = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setVoiceTranscript('');
        setOrbState('listening');
      };

      rec.onresult = async (event: any) => {
        // Build transcript from all results
        let partial = '';
        let isFinal = false;
        for (let i = 0; i < event.results.length; i++) {
          partial += event.results[i][0].transcript;
          if (event.results[i].isFinal) isFinal = true;
        }
        setVoiceTranscript(partial);

        if (isFinal) {
          setIsListening(false);
          const finalText = partial.trim();
          if (finalText) {
            setOrbState('thinking');
            await processVoiceCommand(finalText);
          }
        }
      };

      rec.onerror = (event: any) => {
        setIsListening(false);
        setVoiceTranscript('');
        setOrbState('idle');
        const errorMsg =
          event.error === 'no-speech'
            ? `I didn't catch anything. Tap the mic and speak clearly.`
            : `I couldn't understand that. Would you like to try again?`;
        // Show error message in chat if open
        if (isOpen) handleUserMessage(errorMsg);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ── Process Speech via Backend Voice Intent Detection ────────────────────
  const processVoiceCommand = async (text: string) => {
    try {
      const res = await fetch(`${API_BASE}/ai/voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text }),
        credentials: 'include'
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const { action, reply, data } = json.data;

          // 1. Log the speech interaction in chat history
          handleUserMessage(text);

          // 2. Perform intent action
          if (action === 'create_task' && data.title) {
            await addTask(data.title, data.description || 'Created via Voice Assistant.', data.deadline || new Date().toISOString());
          } else if (action === 'start_pomodoro') {
            setActiveTab('focus');
          } else if (action === 'show_section' && data.target) {
            setActiveTab(data.target);
          }

          // 3. Briefly show response in Voice overlay before closing
          setVoiceTranscript(reply);
          setOrbState('speaking');
          
          if (synthRef.current) {
            const utterance = new SpeechSynthesisUtterance(reply);
            synthRef.current.speak(utterance);
          }

          setTimeout(() => {
            closeVoiceMode();
          }, 3000);
          return;
        }
      }
    } catch (e) {
      console.warn('Voice command processing failed:', e);
    }

    // Fallback directly to text chat
    handleUserMessage(text);
    setTimeout(() => {
      closeVoiceMode();
    }, 1000);
  };

  // ── Voice Toggle ──────────────────────────────────────────────────────────
  const toggleVoice = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) {
      // No browser support — fall back to text
      return;
    }

    if (isListening) {
      rec.stop();
      setVoiceTranscript('');
      setIsVoiceMode(false);
    } else {
      if (synthRef.current) synthRef.current.cancel();
      setVoiceTranscript('');
      setIsVoiceMode(true);
      setTimeout(() => {
        try { rec.start(); } catch { /* already running */ }
      }, 350);
    }
  }, [isListening]);

  const closeVoiceMode = useCallback(() => {
    setIsVoiceMode(false);
    setVoiceTranscript('');
    setOrbState('idle');
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  }, [isListening, setOrbState]);

  // ── Smart card action callbacks ───────────────────────────────────────────
  const handleViewTask = useCallback(() => {
    setActiveTab('tasks');
    setIsOpen(false);
  }, [setActiveTab]);

  const handleViewCalendar = useCallback(() => {
    setActiveTab('calendar');
    setIsOpen(false);
  }, [setActiveTab]);

  const handleStartFocus = useCallback(() => {
    setActiveTab('focus');
    setIsOpen(false);
  }, [setActiveTab]);

  // Retry uses the hook's built-in retry (re-runs last command)
  const handleRetry = useCallback(() => {
    handleRetryCommand();
  }, [handleRetryCommand]);

  // ── Keyboard shortcut: Escape to close ───────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isVoiceMode) {
          closeVoiceMode();
        } else {
          setIsOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, isVoiceMode, closeVoiceMode]);

  const userName    = userEmail ? userEmail.split('@')[0] : 'Developer';
  const isExecuting = phase === 'executing';

  return (
    <>
      {/* ── Floating Orb (trigger) ─────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-[999]">
        <AnimatePresence>
          {!isOpen && (
            <KaiOrb
              orbState={orbState}
              onClick={() => setIsOpen(true)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── Mobile backdrop ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => { setIsOpen(false); closeVoiceMode(); }}
            className="fixed inset-0 z-[998] bg-black/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Drawer Panel ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="drawer"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 32,
              mass: 0.9,
            }}
            className={`
              fixed right-0 top-0 bottom-0 z-[999]
              w-full lg:w-[35vw] lg:min-w-[400px] lg:max-w-[520px]
              flex flex-col
              bg-[#070a18] border-l border-white/[0.08]
              shadow-2xl shadow-black/60
            `}
          >
            {/* Background gradient */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/6 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Content */}
            <div className="relative flex flex-col h-full overflow-hidden">
              {/* Header */}
              <KaiHeader
                orbState={orbState}
                onClose={() => { setIsOpen(false); closeVoiceMode(); }}
                onToggleVoice={toggleVoice}
                onClearHistory={clearConversation}
                isListening={isListening}
              />

              {/* Body: Welcome or Chat */}
              <div className="flex-1 flex flex-col overflow-hidden relative">
                {messages.length === 0 ? (
                  <KaiWelcome
                    userName={userName}
                    onPromptClick={(text) => handleUserMessage(text)}
                  />
                ) : (
                  <KaiMessageList
                    messages={messages}
                    isTyping={isTyping}
                    phase={phase}
                    onChipAnswer={handleChipAnswer}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                    onViewTask={handleViewTask}
                    onViewCalendar={handleViewCalendar}
                    onStartFocus={handleStartFocus}
                    onRetry={handleRetry}
                  />
                )}

                {/* Voice mode overlay */}
                <KaiVoiceMode
                  isVisible={isVoiceMode}
                  orbState={orbState}
                  onToggleMic={toggleVoice}
                  onClose={closeVoiceMode}
                  transcript={voiceTranscript}
                />
              </div>

              {/* Input bar (hidden while voice overlay is open) */}
              {!isVoiceMode && (
                <KaiInputBar
                  onSend={handleUserMessage}
                  onToggleVoice={toggleVoice}
                  isListening={isListening}
                  isDisabled={isExecuting || isTyping}
                  placeholder={
                    isExecuting
                      ? 'Kai is creating your plan...'
                      : phase === 'followup'
                      ? 'Type your answer or tap an option above...'
                      : phase === 'confirming'
                      ? 'Type "yes" to confirm or "cancel" to restart...'
                      : 'Ask Kai anything...'
                  }
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default KaiDrawer;
