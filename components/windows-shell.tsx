"use client"
import { X, Minus, Square } from "lucide-react"

interface WindowsShellProps {
  title: string
  children: React.ReactNode
}

export function WindowsShell({ title, children }: WindowsShellProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="w-full h-screen bg-white overflow-hidden">
        {/* Title Bar */}
        <div className="h-10 flex items-center justify-between px-3 select-none" style={{ background: "linear-gradient(#ffffff,#e9e9e9)" }}>
          <div className="text-sm text-black font-semibold">{title}</div>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 grid place-items-center text-black/70 hover:bg-black/5 rounded">
              <Minus className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 grid place-items-center text-black/70 hover:bg-black/5 rounded">
              <Square className="w-3.5 h-3.5" />
            </button>
            <button className="w-8 h-8 grid place-items-center text-white hover:bg-red-600 rounded bg-red-500">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Divider under title bar */}
        <div className="h-px bg-[#e5e5e5]" />

        {/* Content */}
        <div className="bg-white p-4 h-[calc(100vh-10rem)] overflow-auto">{children}</div>

        {/* Footer */}
        <div className="h-10 border-t border-[#e5e5e5] bg-[#f7f7f7] flex items-center justify-between px-3">
          <div className="text-xs text-black/60">Ready</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <div className="text-xs text-black/60">Connected</div>
          </div>
        </div>
      </div>
    </div>
  )
}


