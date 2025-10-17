"use client"
import { MigrationWizard } from "@/components/migration-wizard"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { WindowsShell } from "@/components/windows-shell"

export default function Home() {
  const [isAuthed, setIsAuthed] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([])
  const [projectName, setProjectName] = useState("")
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
    setIsAuthed(Boolean(token))
    const pid = typeof window !== "undefined" ? localStorage.getItem("projectId") : null
    if (pid) setSelectedProjectId(pid)
    ;(async () => {
      try {
        const res = await fetch("/api/projects")
        const data = await res.json()
        if (res.ok) setProjects(data.projects || [])
      } catch {}
    })()
  }, [])

  const handleSignIn = () => {
    setError("")
    if (!email || !password) {
      setError("Email and password are required")
      return
    }
    localStorage.setItem("authToken", "mock-token")
    localStorage.setItem("authEmail", email)
    setIsAuthed(true)
  }

  const handleSignOut = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("authEmail")
    setIsAuthed(false)
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-6 border border-border">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-foreground">Sign in</h1>
            <p className="text-sm text-muted-foreground">Mock authentication for preview</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button onClick={handleSignIn} className="w-full">Sign in</Button>
          </div>
        </Card>
      </div>
    )
  }

  // Project selector
  if (!selectedProjectId) {
    return (
      <WindowsShell title="Oracle → SQL Server Migration Wizard">
        <Card className="max-w-2xl mx-auto p-6 border border-border">
          <h2 className="text-xl font-semibold mb-4">Select or Create Project</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Existing Projects</label>
              <div className="grid gap-2">
                {projects.map((p) => (
                  <Button key={p.id} variant="outline" className="justify-start bg-transparent" onClick={() => {
                    setSelectedProjectId(p.id)
                    localStorage.setItem("projectId", p.id)
                  }}>
                    {p.name}
                  </Button>
                ))}
                {projects.length === 0 && <p className="text-sm text-muted-foreground">No projects yet</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Create New Project</label>
              <div className="flex gap-2">
                <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Project name" />
                <Button onClick={async () => {
                  if (!projectName.trim()) return
                  const res = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: projectName.trim() }) })
                  const data = await res.json()
                  if (res.ok) {
                    setProjects([...(projects || []), data.project])
                    setSelectedProjectId(data.project.id)
                    localStorage.setItem("projectId", data.project.id)
                  }
                }}>Create</Button>
              </div>
            </div>
          </div>
        </Card>
      </WindowsShell>
    )
  }

  return (
    <WindowsShell title="Oracle → SQL Server Migration Wizard">
      <div className="mb-2 text-right">
        <Button variant="outline" className="bg-transparent" onClick={handleSignOut}>Sign out</Button>
      </div>
      <MigrationWizard />
    </WindowsShell>
  )
}
