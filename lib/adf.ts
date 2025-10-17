export interface AdfAdapter {
  startPipeline(runId: string, payload: any): Promise<{ ok: boolean }>
  getProgress(runId: string): Promise<{ percent: number; logs: string[] }>
}

export class MockAdfAdapter implements AdfAdapter {
  async startPipeline(runId: string): Promise<{ ok: boolean }> {
    // Simulate immediate start; backend /api/execute already flips status
    return { ok: true }
  }
  async getProgress(): Promise<{ percent: number; logs: string[] }> {
    return { percent: 100, logs: ["Mock started", "Mock completed"] }
  }
}


