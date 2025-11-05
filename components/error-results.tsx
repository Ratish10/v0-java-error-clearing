"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Copy } from "lucide-react"
import { useState } from "react"

interface ErrorResult {
  message: string
  type: "error" | "warning" | "success"
  line?: number
  suggestion?: string
}

interface ErrorResultsProps {
  results: {
    errors: ErrorResult[]
    correctedCode: string
  }
}

export default function ErrorResults({ results }: ErrorResultsProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(results.correctedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const errorCount = results.errors.filter((e) => e.type === "error").length
  const warningCount = results.errors.filter((e) => e.type === "warning").length
  const successCount = results.errors.filter((e) => e.type === "success").length

  return (
    <div className="flex flex-col gap-4">
      {/* Summary Card */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
              <div className="text-red-400 font-semibold">{errorCount}</div>
              <div className="text-red-300 text-sm">Errors</div>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-3">
              <div className="text-yellow-400 font-semibold">{warningCount}</div>
              <div className="text-yellow-300 text-sm">Warnings</div>
            </div>
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-3">
              <div className="text-green-400 font-semibold">{successCount}</div>
              <div className="text-green-300 text-sm">Fixed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Errors List */}
      {results.errors.length > 0 && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Issues Found</CardTitle>
            <CardDescription>Details for each error detected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {results.errors.map((error, idx) => (
                <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    {error.type === "error" ? (
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    ) : error.type === "warning" ? (
                      <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">{error.message}</p>
                      {error.line && <p className="text-slate-400 text-xs mt-1">Line {error.line}</p>}
                      {error.suggestion && (
                        <p className="text-slate-300 text-sm mt-2 bg-slate-900/50 rounded p-2">💡 {error.suggestion}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Corrected Code */}
      {results.correctedCode && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">Corrected Code</CardTitle>
              <CardDescription>Fixed version of your Java program</CardDescription>
            </div>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition"
            >
              <Copy className="w-4 h-4" />
              {copied ? "Copied!" : "Copy"}
            </button>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-950 border border-slate-700 rounded-lg p-4 overflow-x-auto">
              <pre className="text-slate-300 font-mono text-xs whitespace-pre-wrap break-words">
                {results.correctedCode}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
