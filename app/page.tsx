"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import ErrorResults from "@/components/error-results"

export default function Home() {
  const [javaCode, setJavaCode] = useState("")
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const analyzeCode = async () => {
    if (!javaCode.trim()) {
      alert("Please enter Java code to analyze")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/analyze-java", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: javaCode }),
      })

      const data = await response.json()
      setResults(data)
    } catch (error) {
      setResults({
        errors: [{ message: "Failed to analyze code", type: "error" }],
        correctedCode: "",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Java Error Fixer</h1>
          <p className="text-slate-400">Paste your Java code and we'll identify and fix all errors</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="flex flex-col gap-4">
            <Card className="flex-1 flex flex-col bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Java Code Input</CardTitle>
                <CardDescription>Paste your Java program here</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                <Textarea
                  value={javaCode}
                  onChange={(e) => setJavaCode(e.target.value)}
                  placeholder="Paste your Java code here...&#10;&#10;Example:&#10;public class HelloWorld {&#10;    public static void main(String[] args) {&#10;        System.out.println(&quot;Hello World&quot;)&#10;    }&#10;}"
                  className="flex-1 bg-slate-950 text-white border-slate-700 font-mono text-sm resize-none"
                  rows={20}
                />
                <Button
                  onClick={analyzeCode}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                >
                  {loading ? "Analyzing..." : "Analyze Code"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="flex flex-col gap-4">
            {results ? (
              <ErrorResults results={results} />
            ) : (
              <Card className="flex-1 bg-slate-900/50 border-slate-800 flex items-center justify-center">
                <div className="text-center text-slate-400 p-8">
                  <div className="text-5xl mb-4">↓</div>
                  <p>Paste Java code and click Analyze to see results</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
