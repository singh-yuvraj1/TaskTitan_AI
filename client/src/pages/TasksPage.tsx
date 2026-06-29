import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, SubTask } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input, TextArea, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell 
} from '../components/ui/Table';
import { 
  Plus, Edit, Trash2, Eye, Calendar, Clock, 
  CheckCircle2, AlertTriangle, PlusCircle, Bookmark, ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskSkeleton } from '../components/SkeletonLoader';

export const TasksPage: React.FC = () => {
  const { 
    tasks, addTask, updateTask, deleteTask, toggleSubtask, completeTask, isLoading 
  } = useApp();

  // Dialog & Active states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Form Fields (Common for Create / Edit)
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('NotUrgent-Important');
  const [category, setCategory] = useState('DSA');
  const [estimatedHours, setEstimatedHours] = useState('2');
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState('');

  // Subtask addition form
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Submit handlers
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !deadline) return;

    await addTask(title, desc, new Date(deadline).toISOString());
    clearForm();
    setIsCreateOpen(false);
  };

  const handleEditSetup = (task: Task) => {
    setActiveTask(task);
    setTitle(task.title);
    setDesc(task.description);
    const date = new Date(task.deadline);
    const tzOffset = date.getTimezoneOffset() * 60000;
    const formatted = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    setDeadline(formatted);
    setPriority(task.priority);
    setCategory(task.category);
    setEstimatedHours(String(task.estimatedHours));
    setProgress(task.progress !== undefined ? task.progress : 0);
    setNotes(task.notes || '');
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask || !title.trim() || !deadline) return;

    const updatedTask: Task = {
      ...activeTask,
      title,
      description: desc,
      deadline: new Date(deadline).toISOString(),
      priority: priority as Task['priority'],
      category: category as Task['category'],
      estimatedHours: Number(estimatedHours) || 2,
      progress,
      notes,
    };

    await updateTask(updatedTask);
    setIsEditOpen(false);
    setActiveTask(null);
    clearForm();
  };

  const handleDetailSetup = (task: Task) => {
    setActiveTask(task);
    setNotes(task.notes || '');
    setIsDetailOpen(true);
  };

  const saveNotes = async () => {
    if (!activeTask) return;
    const updated: Task = {
      ...activeTask,
      notes
    };
    await updateTask(updated);
    setActiveTask(updated);
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask || !newSubtaskTitle.trim()) return;

    const newSub: SubTask = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle,
      completed: false,
      estimatedMinutes: 30
    };

    const updated: Task = {
      ...activeTask,
      subtasks: [...activeTask.subtasks, newSub]
    };
    await updateTask(updated);
    setActiveTask(updated);
    setNewSubtaskTitle('');
  };

  const clearForm = () => {
    setTitle('');
    setDesc('');
    setDeadline('');
    setPriority('NotUrgent-Important');
    setCategory('DSA');
    setEstimatedHours('2');
    setProgress(0);
    setNotes('');
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'Urgent-Important':
        return <Badge variant="danger">Urgent</Badge>;
      case 'NotUrgent-Important':
        return <Badge variant="info">Important</Badge>;
      case 'Urgent-NotImportant':
        return <Badge variant="warning">Routine</Badge>;
      default:
        return <Badge variant="default">Backlog</Badge>;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' as any }}
      className="max-w-6xl mx-auto py-2 space-y-6"
    >
      
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-glass-border">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">Milestones & Tasks</h2>
          <p className="text-xs text-text-muted mt-1">Manage project objectives, practice schedules, and deadline risk profiles.</p>
        </div>
        <Button 
          variant="primary" 
          size="sm" 
          onClick={() => { clearForm(); setIsCreateOpen(true); }}
          leftIcon={<Plus size={13} />}
        >
          Add Task
        </Button>
      </div>

      {/* Tasks Table Dashboard */}
      {isLoading ? (
        <div className="space-y-4">
          <TaskSkeleton />
          <TaskSkeleton />
          <TaskSkeleton />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border border-glass-border rounded-2xl bg-[#0a0c16]/30 text-center space-y-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-glass-border flex items-center justify-center text-text-muted">
            <ClipboardList size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-text-primary">No tasks created yet</h3>
            <p className="text-xs text-text-muted max-w-sm">
              Your workflow is empty. Click "Add Task" or use the Command Palette to break down your milestones.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => { clearForm(); setIsCreateOpen(true); }}
            leftIcon={<Plus size={13} />}
          >
            Create Your First Task
          </Button>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-glass-border bg-white/[0.01]">
                <TableHead className="w-10"></TableHead>
                <TableHead className="font-bold text-text-primary text-xs">Task Title</TableHead>
                <TableHead className="font-bold text-text-primary text-xs">Priority</TableHead>
                <TableHead className="font-bold text-text-primary text-xs">Category</TableHead>
                <TableHead className="font-bold text-text-primary text-xs">Deadline</TableHead>
                <TableHead className="font-bold text-text-primary text-xs">Estimate</TableHead>
                <TableHead className="font-bold text-text-primary text-xs">Progress</TableHead>
                <TableHead className="text-right font-bold text-text-primary text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map(task => {
                const isOverdue = new Date(task.deadline).getTime() < Date.now() && !task.completed;
                const progressPct = task.progress !== undefined ? task.progress : 0;
                
                return (
                  <TableRow key={task.id} className={`transition-opacity hover:bg-white/[0.01] border-b border-glass-border/40 ${task.completed ? 'opacity-50' : ''}`}>
                    <TableCell>
                      <input 
                        type="checkbox" 
                        checked={task.completed}
                        onChange={() => completeTask(task.id)}
                        className="w-4 h-4 rounded-md border-glass-border bg-transparent text-violet-500 focus:ring-0 cursor-pointer"
                      />
                    </TableCell>
                    <TableCell className="font-bold text-text-primary">
                      <span className={task.completed ? 'line-through text-text-muted' : ''}>
                        {task.title}
                      </span>
                    </TableCell>
                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                    <TableCell>
                      <Badge variant="default">{task.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`font-mono text-[11px] ${isOverdue ? 'text-[#EF4444] font-bold' : 'text-text-secondary'}`}>
                        {new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-text-secondary">
                      {task.estimatedHours}h
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-14 bg-white/5 h-1.5 rounded-full overflow-hidden border border-glass-border">
                          <div 
                            className="bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#06B6D4] h-full rounded-full transition-all duration-300" 
                            style={{ width: `${progressPct}%` }} 
                          />
                        </div>
                        <span className="font-mono text-[10px] text-text-secondary w-7 text-right">{progressPct}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2.5">
                        <button 
                          className="p-1 text-text-muted hover:text-text-primary transition-colors"
                          onClick={() => handleDetailSetup(task)}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          className="p-1 text-text-muted hover:text-text-primary transition-colors"
                          onClick={() => handleEditSetup(task)}
                          title="Edit Task"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          className="p-1 text-text-muted hover:text-rose-400 transition-colors"
                          onClick={() => deleteTask(task.id)}
                          title="Delete Task"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* CREATE MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Goal"
        description="Provide details to decompose targets automatically."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input 
            label="Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Prepare DAA Exam Module 1"
          />
          <TextArea 
            label="Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Outline task deliverables..."
          />
          <div className="grid grid-cols-2 gap-3.5">
            <Input 
              label="Deadline Date & Time"
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
                { value: 'React', label: 'React / Frontend' },
                { value: 'WebDev', label: 'Web Development' },
                { value: 'Backend', label: 'Backend / Database' },
                { value: 'System Design', label: 'System Design' },
                { value: 'General', label: 'General' }
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <Select 
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              options={[
                { value: 'Urgent-Important', label: 'Urgent & Important' },
                { value: 'NotUrgent-Important', label: 'Important (Not Urgent)' },
                { value: 'Urgent-NotImportant', label: 'Urgent (Not Important)' },
                { value: 'NotUrgent-NotImportant', label: 'Routine Tasks' }
              ]}
            />
            <Input 
              label="Estimated Time (Hours)"
              type="number"
              min="1"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Create Goal
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setActiveTask(null); }}
        title="Edit Goal"
        description="Update fields for active milestone tracking."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input 
            label="Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextArea 
            label="Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3.5">
            <Input 
              label="Deadline Date & Time"
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
                { value: 'React', label: 'React / Frontend' },
                { value: 'WebDev', label: 'Web Development' },
                { value: 'Backend', label: 'Backend / Database' },
                { value: 'System Design', label: 'System Design' },
                { value: 'General', label: 'General' }
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <Select 
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              options={[
                { value: 'Urgent-Important', label: 'Urgent & Important' },
                { value: 'NotUrgent-Important', label: 'Important (Not Urgent)' },
                { value: 'Urgent-NotImportant', label: 'Urgent (Not Important)' },
                { value: 'NotUrgent-NotImportant', label: 'Routine Tasks' }
              ]}
            />
            <Input 
              label="Estimated Time (Hours)"
              type="number"
              min="1"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <Input 
              label="Progress (%)"
              type="number"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value) || 0)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => { setIsEditOpen(false); setActiveTask(null); }}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* DETAIL MODAL (Task inspector) */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setActiveTask(null); }}
        title={activeTask?.title || 'Goal Details'}
        description={activeTask?.description || 'Active task details'}
        size="lg"
      >
        <div className="space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-3 gap-4.5 p-4 bg-background border border-glass-border rounded-2xl text-xs font-mono">
            <div>
              <span className="text-text-muted block">Category</span>
              <span className="text-text-primary font-bold mt-1 block">{activeTask?.category}</span>
            </div>
            <div>
              <span className="text-text-muted block">Priority</span>
              <span className="text-text-primary font-bold mt-1 block">{activeTask?.priority.split('-')[0]}</span>
            </div>
            <div>
              <span className="text-text-muted block">Estimate</span>
              <span className="text-text-primary font-bold mt-1 block">{activeTask?.estimatedHours} hours</span>
            </div>
          </div>

          {/* Subtask Section */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <ClipboardList size={14} className="text-text-muted" />
              <span>Subtasks Checklist</span>
            </h4>
            <div className="space-y-2 border-l-2 border-glass-border pl-3.5">
              {activeTask?.subtasks.length === 0 ? (
                <p className="text-[11px] text-text-muted italic">No subtask chunks defined.</p>
              ) : (
                activeTask?.subtasks.map(sub => (
                  <label key={sub.id} className="flex items-center gap-2.5 text-xs text-text-secondary hover:text-text-primary cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() => {
                        if (activeTask) {
                          toggleSubtask(activeTask.id, sub.id);
                          const subtasks = activeTask.subtasks.map(s => s.id === sub.id ? { ...s, completed: !s.completed } : s);
                          const done = subtasks.filter(s => s.completed).length;
                          const nextPct = Math.round((done / subtasks.length) * 100);
                          setActiveTask({ ...activeTask, subtasks, progress: nextPct });
                        }
                      }}
                      className="w-4 h-4 rounded-md border-glass-border bg-transparent text-[#7C3AED] focus:ring-0 cursor-pointer"
                    />
                    <span className={sub.completed ? 'line-through text-text-muted/50 font-medium' : 'font-semibold'}>{sub.title}</span>
                  </label>
                ))
              )}
            </div>

            {/* Quick add subtask form */}
            <form onSubmit={handleAddSubtask} className="flex gap-2.5 pt-2">
              <Input
                placeholder="Add subtask component..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                className="flex-1 py-1 px-3 h-8.5"
              />
              <Button type="submit" variant="outline" size="sm" className="h-8.5 px-3">
                <PlusCircle size={14} />
              </Button>
            </form>
          </div>

          {/* Notes Section */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <Bookmark size={14} className="text-text-muted" />
              <span>Notes</span>
            </h4>
            <div className="space-y-3">
              <TextArea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Jot down notes, links, or documentation tags..."
                className="min-h-[85px]"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={saveNotes}
                className="text-[10px] rounded-xl font-bold"
              >
                Save Notes
              </Button>
            </div>
          </div>
        </div>
      </Modal>

    </motion.div>
  );
};
