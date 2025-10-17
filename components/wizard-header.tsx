import { Database } from "lucide-react"

interface WizardHeaderProps {
  projectName: string
}

export function WizardHeader({ projectName }: WizardHeaderProps) {
  return (
    <header className="border-b border-border bg-card px-8 py-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
          <Database className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Oracle → SQL Server Migrator</h1>
          {projectName && <p className="text-sm text-muted-foreground">Project: {projectName}</p>}
        </div>
      </div>
    </header>
  )
}
