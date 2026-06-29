import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  ArrowRight, ShieldAlert, Sparkles, Calendar, Clock, 
  CheckCircle2, ArrowDown, ChevronRight, X, AlertTriangle, Play, Award
} from 'lucide-react';

export const Landing: React.FC = () => {
  const { isAuthenticated, setActiveTab } = useApp();
  const [activeStep, setActiveStep] = useState<number>(0);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setActiveTab('dashboard');
    } else {
      setActiveTab('auth');
    }
  };

  const steps = [
    {
      title: "1. Deadline Risk",
      desc: "Detecting schedule defaults",
      content: (
        <div className="space-y-4 font-sans text-xs">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold text-white">React Project Proposal</div>
              <div className="text-[10px] text-neutral-500 font-mono mt-0.5">Due Friday at 4:00 PM (In 12h)</div>
            </div>
            <Badge variant="danger">84% Risk</Badge>
          </div>
          <div className="p-3 bg-rose-950/15 border border-rose-900/35 rounded-lg flex gap-2.5 items-start">
            <ShieldAlert size={14} className="text-rose-400 shrink-0 mt-0.5" />
            <div className="text-rose-300 leading-relaxed text-[11px]">
              <strong>Default Hazard:</strong> Work velocity has dropped below requirement. High likelihood of missing scheduled delivery date.
            </div>
          </div>
        </div>
      )
    },
    {
      title: "2. AI Analysis",
      desc: "Parsing work parameters",
      content: (
        <div className="space-y-3 font-sans text-xs">
          <div className="flex items-center gap-2 text-neutral-400">
            <Sparkles size={13} className="text-neutral-300" />
            <span>Analyzing bottleneck variables...</span>
          </div>
          <div className="space-y-2 font-mono text-[10px] bg-neutral-900/60 p-3 border border-neutral-850 rounded-lg text-neutral-300 leading-relaxed">
            <div>&gt; checking historical coding velocity: 1.2h/day</div>
            <div>&gt; checking overlapping calendar slots: DAA Quiz detected Thursday</div>
            <div>&gt; workload deficit: 4.5 focus hours required</div>
            <div className="text-neutral-500 animate-pulse">&gt; compiling rescue block solutions...</div>
          </div>
        </div>
      )
    },
    {
      title: "3. Rescue Plan",
      desc: "Scheduling focus blocks",
      content: (
        <div className="space-y-3 font-sans text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-neutral-900">
            <span className="font-medium text-white">Focus Reservation Locked</span>
            <span className="text-[10px] text-neutral-400 font-mono">2 slots reserved</span>
          </div>
          <div className="space-y-2">
            <div className="p-2.5 bg-neutral-900/60 border border-neutral-800 rounded-lg flex justify-between items-center">
              <div>
                <div className="font-semibold text-neutral-200">Slot 1: Component Refactor</div>
                <div className="text-[10px] text-neutral-500 font-mono mt-0.5">Thu 8:00 PM — 10:00 PM</div>
              </div>
              <Badge variant="info">Focus Protected</Badge>
            </div>
            <div className="p-2.5 bg-neutral-900/60 border border-neutral-800 rounded-lg flex justify-between items-center">
              <div>
                <div className="font-semibold text-neutral-200">Slot 2: API Integration</div>
                <div className="text-[10px] text-neutral-500 font-mono mt-0.5">Fri 9:00 AM — 11:30 AM</div>
              </div>
              <Badge variant="info">Focus Protected</Badge>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "4. Completed",
      desc: "Safeguarding milestones",
      content: (
        <div className="space-y-4 font-sans text-xs text-center py-4 flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-emerald-950/30 border border-emerald-900/50 flex items-center justify-center text-emerald-400 mb-2">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="font-semibold text-white">React Project Submitted</div>
            <div className="text-[10px] text-neutral-500 font-mono mt-1">Delivered 2.5h prior to deadline</div>
          </div>
          <div className="flex gap-4 border-t border-neutral-900 pt-3 w-full justify-center text-[10px] font-mono text-neutral-400">
            <span>+150 XP Earned</span>
            <span>•</span>
            <span>Streak Maintained</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen text-neutral-300 bg-black flex flex-col font-sans select-none relative overflow-x-hidden selection:bg-neutral-800 selection:text-white">
      
      {/* Navigation Header */}
      <header className="max-w-6xl mx-auto w-full px-6 py-6 flex justify-between items-center z-10 border-b border-neutral-900">
        <div className="flex items-center gap-2">
          <span className="text-xl">🥷</span>
          <span className="text-sm font-bold text-white tracking-tight">
            Coding<span className="text-neutral-400">Ninja</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleGetStarted}
            className="text-neutral-400 hover:text-white"
          >
            Sign In
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleGetStarted}
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">

        {/* Section 1: Hero */}
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05]">
              Never miss a<br />deadline again.
            </h1>
            <p className="text-base text-neutral-400 leading-relaxed max-w-xl font-medium">
              CodingNinja helps students and developers plan work, detect calendar risks, and recover automatically before deadlines are missed.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button 
                variant="primary" 
                size="lg" 
                onClick={handleGetStarted}
                rightIcon={<ArrowRight size={14} />}
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => {
                  const element = document.getElementById('how-it-works');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                See How It Works
              </Button>
            </div>
          </div>

          {/* Right Column: Interactive Visual Showcase */}
          <div className="lg:col-span-5 w-full">
            <Card className="border border-neutral-850 bg-neutral-950/60 shadow-elevated">
              <div className="bg-neutral-950 px-5 py-3 border-b border-neutral-850 flex items-center justify-between">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">AI Planning & Rescue Lifecycle</span>
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
                </div>
              </div>
              <CardContent className="p-6 space-y-6">
                
                {/* Visual Step Render */}
                <div className="min-h-[140px] flex flex-col justify-center">
                  {steps[activeStep].content}
                </div>

                {/* Progress bar line */}
                <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden border border-neutral-850">
                  <div 
                    className="bg-neutral-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                  />
                </div>

                {/* Interaction Selectors */}
                <div className="grid grid-cols-4 gap-1.5">
                  {steps.map((step, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveStep(idx)}
                      className={`
                        py-2 text-[10px] font-mono rounded border text-center transition-all duration-150
                        ${activeStep === idx 
                          ? 'bg-neutral-900 border-neutral-700 text-white font-semibold' 
                          : 'bg-transparent border-transparent text-neutral-500 hover:text-neutral-300'
                        }
                      `}
                    >
                      Step {idx + 1}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 2: The Problem */}
        <section className="bg-neutral-950/30 border-t border-b border-neutral-900 py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-6 text-center space-y-12">
            <div className="space-y-3">
              <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Why planning fails</h2>
              <p className="text-2xl font-semibold text-white tracking-tight">The silent blockers developers face daily.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <Card className="p-6 bg-neutral-950/50">
                <ShieldAlert className="text-rose-400 mb-4" size={20} />
                <h3 className="text-sm font-semibold text-white">Late Assignments</h3>
                <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                  Assuming subtasks are simple often leads to massive delays when APIs break or configurations overlap.
                </p>
              </Card>

              <Card className="p-6 bg-neutral-950/50">
                <Clock className="text-amber-400 mb-4" size={20} />
                <h3 className="text-sm font-semibold text-white">Last-Minute Exam Prep</h3>
                <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                  Cramming huge syllabus modules (like DAA or DBMS) into 48 hours results in high anxiety and poor retention.
                </p>
              </Card>

              <Card className="p-6 bg-neutral-950/50">
                <AlertTriangle className="text-rose-400 mb-4" size={20} />
                <h3 className="text-sm font-semibold text-white">Burnout Cycles</h3>
                <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                  Compensating for bad time estimations with 14-hour crunch blocks destroys consistency and long-term momentum.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Section 3: How It Works */}
        <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-16 md:py-24 space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Workflow roadmap</h2>
            <p className="text-2xl font-semibold text-white tracking-tight">Four steps to absolute deadline safety.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3 p-4 border border-neutral-900 rounded-xl bg-neutral-950/10">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-mono font-semibold text-white">
                01
              </div>
              <h4 className="text-xs font-semibold text-white">Create Goal</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Provide basic plain text details regarding assignments, coding projects, or upcoming course assessments.
              </p>
            </div>

            <div className="space-y-3 p-4 border border-neutral-900 rounded-xl bg-neutral-950/10">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-mono font-semibold text-white">
                02
              </div>
              <h4 className="text-xs font-semibold text-white">AI Task Breakdown</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                The planning agent parses deadlines and automatically breaks them down into actionable milestones.
              </p>
            </div>

            <div className="space-y-3 p-4 border border-neutral-900 rounded-xl bg-neutral-950/10">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-mono font-semibold text-white">
                03
              </div>
              <h4 className="text-xs font-semibold text-white">Risk Estimation</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                The agent scans active capacity and alerts you if historical velocity threatens completion dates.
              </p>
            </div>

            <div className="space-y-3 p-4 border border-neutral-900 rounded-xl bg-neutral-950/10">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-mono font-semibold text-white">
                04
              </div>
              <h4 className="text-xs font-semibold text-white">Automated Rescue</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                If defaults are imminent, the coordinator shifts calendar events to lock in dedicated study blocks.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Real Use Cases */}
        <section className="bg-neutral-950/30 border-t border-b border-neutral-900 py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-6 space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Contextual use cases</h2>
              <p className="text-2xl font-semibold text-white tracking-tight">Structured to fit your active pipeline.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-neutral-950/50 flex flex-col justify-between h-56">
                <div>
                  <Badge variant="default" className="mb-3">Academic</Badge>
                  <h4 className="text-sm font-semibold text-white">DAA Exam in 5 Days</h4>
                  <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                    Automated timeline splits course syllabus into review topics, booking 2-hour revision sprints in the evening.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-neutral-600">Goal: 85%+ syllabus coverage</div>
              </Card>

              <Card className="p-6 bg-neutral-950/50 flex flex-col justify-between h-56">
                <div>
                  <Badge variant="default" className="mb-3">Industry</Badge>
                  <h4 className="text-sm font-semibold text-white">React Project Due Friday</h4>
                  <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                    Splits UI components, API setups, and QA into logical daily chunks. Automatically blocks calendar when risks rise.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-neutral-600">Goal: Safe deployment by Friday morning</div>
              </Card>

              <Card className="p-6 bg-neutral-950/50 flex flex-col justify-between h-56">
                <div>
                  <Badge variant="default" className="mb-3">Placement Prep</Badge>
                  <h4 className="text-sm font-semibold text-white">DSA + OS Prep Roadmap</h4>
                  <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                    Balances daily practice arrays with mock interview schedules to ensure complete assessment readiness.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-neutral-600">Goal: Peak velocity during campus drives</div>
              </Card>
            </div>
          </div>
        </section>

        {/* Section 5: Features Outcome */}
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Core Engine Features</h2>
            <p className="text-2xl font-semibold text-white tracking-tight">Engineered for focus and execution outcomes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2 p-5 border border-neutral-900 rounded-xl bg-neutral-950/20">
              <Sparkles size={16} className="text-neutral-400" />
              <h4 className="text-xs font-semibold text-white mt-2">AI Plan Generator</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Decompose large projects into granular checkmarks without manually plotting task dates.
              </p>
            </div>

            <div className="space-y-2 p-5 border border-neutral-900 rounded-xl bg-neutral-950/20">
              <ShieldAlert size={16} className="text-neutral-400" />
              <h4 className="text-xs font-semibold text-white mt-2">Active Rescue Schedulers</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Identifies capacity deficits early. Rewrites calendar allocations to secure your study sessions.
              </p>
            </div>

            <div className="space-y-2 p-5 border border-neutral-900 rounded-xl bg-neutral-950/20">
              <Calendar size={16} className="text-neutral-400" />
              <h4 className="text-xs font-semibold text-white mt-2">Clean Calendar Integration</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Synchronizes seamlessly with your dashboard events, maintaining standard focus times.
              </p>
            </div>

            <div className="space-y-2 p-5 border border-neutral-900 rounded-xl bg-neutral-950/20">
              <Clock size={16} className="text-neutral-400" />
              <h4 className="text-xs font-semibold text-white mt-2">Focus Ritual Trackers</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Monitors distraction indicators and tab changes to keep focus blocks pure.
              </p>
            </div>

            <div className="space-y-2 p-5 border border-neutral-900 rounded-xl bg-neutral-950/20">
              <CheckCircle2 size={16} className="text-neutral-400" />
              <h4 className="text-xs font-semibold text-white mt-2">Contribution Grid</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                A simple GitHub-style contribution grid that visually charts your daily coding blocks.
              </p>
            </div>

            <div className="space-y-2 p-5 border border-neutral-900 rounded-xl bg-neutral-950/20">
              <Award size={16} className="text-neutral-400" />
              <h4 className="text-xs font-semibold text-white mt-2">Progress Ratings</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Level structures and XP scoring tables designed to gamify focus metrics and streak retention.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Before vs After */}
        <section className="bg-neutral-950/30 border-t border-b border-neutral-900 py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-6 space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Before & After</h2>
              <p className="text-2xl font-semibold text-white tracking-tight">Concrete workflow improvements.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-6 bg-neutral-950/40 border border-neutral-900 rounded-xl space-y-4">
                <h4 className="font-semibold text-rose-400 flex items-center gap-1.5">
                  <X size={14} />
                  <span>Without CodingNinja</span>
                </h4>
                <ul className="space-y-2.5 text-neutral-500">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 mt-0.5">•</span>
                    <span>Missed deadlines due to poor subtask breakdown.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 mt-0.5">•</span>
                    <span>High stress levels from last-minute crunches.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 mt-0.5">•</span>
                    <span>No visualization of schedule overlaps.</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-neutral-950/40 border border-neutral-900 rounded-xl space-y-4">
                <h4 className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  <span>With CodingNinja</span>
                </h4>
                <ul className="space-y-2.5 text-neutral-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>Actionable tasks generated instantly from deadlines.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>Early risk alerts trigger calendar adjustments.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>Consistent streaks with clear focus targets.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Call To Action */}
        <section className="max-w-6xl mx-auto px-6 py-20 md:py-28 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Start planning smarter.
          </h2>
          <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
            Avoid estimation default. Experience real automated scheduling protection today.
          </p>
          <div className="pt-2">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={handleGetStarted}
              rightIcon={<ArrowRight size={14} />}
            >
              Start Free Session
            </Button>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950/50 z-10 py-8 px-6 text-xs text-neutral-500 text-center font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>© {new Date().getFullYear()} CodingNinja Inc. All rights reserved.</div>
          <div className="flex gap-4">
            <span className="hover:text-neutral-400 cursor-pointer">Security</span>
            <span className="hover:text-neutral-400 cursor-pointer">Privacy</span>
            <span className="hover:text-neutral-400 cursor-pointer">Docs</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
