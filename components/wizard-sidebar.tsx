"use client"

import { Check, ChevronRight } from "lucide-react"
import type { WizardStep } from "./migration-wizard"

interface WizardSidebarProps {
  steps: { id: WizardStep; label: string; number: number }[]
  currentStep: WizardStep
  onStepClick: (stepId: WizardStep) => void
}

export function WizardSidebar({ steps, currentStep, onStepClick }: WizardSidebarProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep)

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col">
      <div className="p-6 border-b border-border">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Migration Steps</h2>
      </div>
      <nav className="flex-1 overflow-auto p-4 space-y-2">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = step.id === currentStep
          const isAccessible = index <= currentIndex

          return (
            <button
              key={step.id}
              onClick={() => onStepClick(step.id)}
              disabled={!isAccessible}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                isCurrent
                  ? "bg-primary/10 text-primary font-medium"
                  : isCompleted
                    ? "text-muted-foreground hover:bg-muted/50"
                    : isAccessible
                      ? "text-foreground hover:bg-muted/50"
                      : "text-muted-foreground opacity-50 cursor-not-allowed"
              }`}
            >
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : isCompleted
                      ? "bg-green-500/20 text-green-600"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.number}
              </div>
              <span className="flex-1">{step.label}</span>
              {isCurrent && <ChevronRight className="w-4 h-4" />}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
