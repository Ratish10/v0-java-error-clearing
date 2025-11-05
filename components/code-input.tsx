"use client"

import { Textarea } from "@/components/ui/textarea"

interface CodeInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function CodeInput({ value, onChange, placeholder }: CodeInputProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "Paste your Java code here..."}
      className="bg-slate-950 text-white border-slate-700 font-mono text-sm"
    />
  )
}
