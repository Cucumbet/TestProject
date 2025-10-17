"use client"

import { useState } from "react"
import { ConnectionsStep } from "./steps/connections-step"
import { SelectTablesStep } from "./steps/select-tables-step"
import { MappingEditorStep } from "./steps/mapping-editor-step"
import { PlanStep } from "./steps/plan-step"
import { DryRunStep } from "./steps/dry-run-step"
import { ExecuteStep } from "./steps/execute-step"
import { SummaryStep } from "./steps/summary-step"
import { WizardHeader } from "./wizard-header"
import { WizardSidebar } from "./wizard-sidebar"

export type WizardStep = "connections" | "select-tables" | "mappings" | "plan" | "dry-run" | "execute" | "summary"

export interface MigrationState {
  projectName: string
  oracleConnection: {
    host: string
    port: number
    service: string
    username: string
    password: string
  }
  sqlServerConnection: {
    host: string
    port: number
    database: string
    username: string
    password: string
  }
  selectedTables: string[]
  destinationOverrides: Record<string, { schema: string; name: string }>
  mappings: Record<string, any>
  plan: any
  dryRunResults: any
  executionResults: any
}

const STEPS: { id: WizardStep; label: string; number: number }[] = [
  { id: "connections", label: "Connections", number: 1 },
  { id: "select-tables", label: "Select Tables", number: 2 },
  { id: "mappings", label: "Edit Mappings", number: 3 },
  { id: "plan", label: "Plan", number: 4 },
  { id: "dry-run", label: "Dry-Run", number: 5 },
  { id: "execute", label: "Execute", number: 6 },
  { id: "summary", label: "Summary", number: 7 },
]

export function MigrationWizard() {
  const [currentStep, setCurrentStep] = useState<WizardStep>("connections")
  const [state, setState] = useState<MigrationState>({
    projectName: "",
    oracleConnection: { host: "", port: 1521, service: "", username: "", password: "" },
    sqlServerConnection: { host: "", port: 1433, database: "", username: "", password: "" },
    selectedTables: [],
    destinationOverrides: {},
    mappings: {},
    plan: null,
    dryRunResults: null,
    executionResults: null,
  })

  const handleNext = () => {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep)
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id)
    }
  }

  const handlePrevious = () => {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id)
    }
  }

  const handleStepClick = (stepId: WizardStep) => {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep)
    const targetIndex = STEPS.findIndex((s) => s.id === stepId)
    if (targetIndex <= currentIndex) {
      setCurrentStep(stepId)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case "connections":
        return <ConnectionsStep state={state} setState={setState} onNext={handleNext} />
      case "select-tables":
        return <SelectTablesStep state={state} setState={setState} onNext={handleNext} onPrevious={handlePrevious} />
      case "mappings":
        return <MappingEditorStep state={state} setState={setState} onNext={handleNext} onPrevious={handlePrevious} />
      case "plan":
        return <PlanStep state={state} setState={setState} onNext={handleNext} onPrevious={handlePrevious} />
      case "dry-run":
        return <DryRunStep state={state} setState={setState} onNext={handleNext} onPrevious={handlePrevious} />
      case "execute":
        return <ExecuteStep state={state} setState={setState} onNext={handleNext} onPrevious={handlePrevious} />
      case "summary":
        return <SummaryStep state={state} />
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <WizardSidebar steps={STEPS} currentStep={currentStep} onStepClick={handleStepClick} />
      <div className="flex-1 flex flex-col">
        <WizardHeader projectName={state.projectName} />
        <main className="flex-1 overflow-auto">{renderStep()}</main>
      </div>
    </div>
  )
}
