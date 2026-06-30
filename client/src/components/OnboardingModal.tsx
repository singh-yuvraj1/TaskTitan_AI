import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input, Select } from './ui/Input';
import { Sparkles, Trophy, ListTodo, Goal, User } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { addTask, showToast } = useApp();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('DSA');
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    if (step === 1 && !name.trim()) {
      showToast('Please enter your name.', 'warning');
      return;
    }
    if (step === 2 && !goal.trim()) {
      showToast('Please specify a main goal.', 'warning');
      return;
    }
    if (step === 3 && (!taskTitle.trim() || !deadline)) {
      showToast('Please provide a task title and deadline.', 'warning');
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Add first task using context API (which will auto-schedule and decompose it via backend Gemini)
      await addTask(taskTitle, `Goal: ${goal}. Added during workspace onboarding.`, new Date(deadline).toISOString());
      showToast(`Welcome, ${name}! Your first task has been scheduled by the AI.`, 'success');
      localStorage.setItem('cn_onboarding_completed', 'true');
      onClose();
    } catch (e) {
      console.error(e);
      showToast('Failed to seed task. Let\'s try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Force user to finish onboarding
      title="Welcome to TaskTitan-AI"
      description="Initialize your developer workspace and configure AI cognitive schedulers."
    >
      <div className="space-y-6 py-2">
        {/* Step Progress indicator */}
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((num) => (
            <React.Fragment key={num}>
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all
                  ${step >= num 
                    ? 'bg-neonCyan border-neonCyan text-black font-extrabold shadow-glass-cyan' 
                    : 'border-white/10 text-white/30 bg-white/5'
                  }
                `}
              >
                {num}
              </div>
              {num < 4 && (
                <div 
                  className={`flex-1 h-0.5 mx-2 transition-all
                    ${step > num ? 'bg-neonCyan shadow-glass-cyan' : 'bg-white/10'}
                  `}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Steps */}
        <div className="min-h-[160px] flex flex-col justify-center">
          {step === 1 && (
            <div className="space-y-4 animate-slide-in">
              <div className="flex items-center gap-2 mb-1">
                <User className="text-neonCyan" size={16} />
                <h3 className="text-sm font-bold text-white">Create Sandbox Profile</h3>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                Welcome to TaskTitan-AI Productivity OS. How should your AI Coach address you?
              </p>
              <Input
                label="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Yuvraj"
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-slide-in">
              <div className="flex items-center gap-2 mb-1">
                <Goal className="text-neonViolet" size={16} />
                <h3 className="text-sm font-bold text-white">State Your Ultimate Objective</h3>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                What is the primary target for this workspace sandbox sprint? We'll prioritize schedules matching this focus.
              </p>
              <Input
                label="Your Main Goal"
                required
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Ace DAA exam and publish React project"
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-slide-in">
              <div className="flex items-center gap-2 mb-1">
                <ListTodo className="text-neonRose" size={16} />
                <h3 className="text-sm font-bold text-white">Create Your First Task</h3>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                Provide a title and deadline. The Planner Agent will automatically decompose this into micro-milestones.
              </p>
              <Input
                label="Task Title"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Code dynamic programming matrix solvers"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Target Deadline"
                  type="datetime-local"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
                <Select
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={[
                    { value: 'DSA', label: 'DSA Practice' },
                    { value: 'React', label: 'React Project' },
                    { value: 'Backend', label: 'Backend/API' },
                    { value: 'General', label: 'Routine Tasks' }
                  ]}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-center animate-slide-in">
              <div className="inline-flex w-12 h-12 rounded-2xl bg-neonCyan/10 border border-neonCyan/30 items-center justify-center mb-2 shadow-glass-cyan">
                <Sparkles className="text-neonCyan animate-spin" size={24} style={{ animationDuration: '4s' }} />
              </div>
              <h3 className="text-sm font-bold text-white">Deploy AI Cognitive Scheduling Suite</h3>
              <p className="text-xs text-white/50 max-w-sm mx-auto leading-relaxed">
                Confirm finalization. Clicking complete will trigger the Gemini Planner Agent to decompose your task, analyze failure probability risk, and allocate focus calendar blocks.
              </p>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="flex justify-between items-center pt-4 border-t border-white/5">
          {step > 1 ? (
            <Button variant="ghost" size="sm" onClick={handleBack} disabled={isLoading}>
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button variant="primary" size="sm" onClick={handleNext}>
              Next Step
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={handleComplete} isLoading={isLoading}>
              Deploy OS Workspace
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
