import { type NextRequest, NextResponse } from "next/server"

interface JavaError {
  message: string
  type: "error" | "warning" | "success"
  line?: number
  suggestion?: string
}

function analyzeJavaCode(code: string): { errors: JavaError[]; correctedCode: string } {
  const errors: JavaError[] = []
  let correctedCode = code

  // Check for missing semicolons
  const linesWithoutSemicolon = code.split("\n").map((line, idx) => {
    const trimmed = line.trim()
    if (
      trimmed &&
      !trimmed.endsWith("{") &&
      !trimmed.endsWith("}") &&
      !trimmed.endsWith(";") &&
      !trimmed.startsWith("//") &&
      !trimmed.startsWith("*") &&
      trimmed !== ""
    ) {
      return idx + 1
    }
    return null
  })

  linesWithoutSemicolon.forEach((lineNum) => {
    if (lineNum) {
      errors.push({
        message: "Missing semicolon at end of statement",
        type: "error",
        line: lineNum,
        suggestion: "Add a semicolon (;) at the end of this line",
      })
    }
  })

  // Check for unclosed braces
  const openBraces = (code.match(/{/g) || []).length
  const closeBraces = (code.match(/}/g) || []).length
  if (openBraces !== closeBraces) {
    errors.push({
      message: `Mismatched braces: ${openBraces} opening, ${closeBraces} closing`,
      type: "error",
      suggestion: "Check that all opening braces have matching closing braces",
    })
  }

  // Check for unclosed parentheses
  const openParens = (code.match(/\(/g) || []).length
  const closeParens = (code.match(/\)/g) || []).length
  if (openParens !== closeParens) {
    errors.push({
      message: `Mismatched parentheses: ${openParens} opening, ${closeParens} closing`,
      type: "error",
      suggestion: "Check that all opening parentheses have matching closing parentheses",
    })
  }

  // Check for missing main method in public class
  if (code.includes("public class") && !code.includes("public static void main")) {
    errors.push({
      message: "Public class might need a main method",
      type: "warning",
      suggestion: "Consider adding: public static void main(String[] args) { }",
    })
  }

  // Check for common typos
  if (code.includes("Systme.out")) {
    errors.push({
      message: 'Typo detected: "Systme" should be "System"',
      type: "error",
      line: code.split("\n").findIndex((l) => l.includes("Systme")) + 1,
      suggestion: 'Change "Systme.out" to "System.out"',
    })
    correctedCode = correctedCode.replace(/Systme\.out/g, "System.out")
  }

  // Check for missing String array in main
  if (code.includes("public static void main") && !code.includes("String[]")) {
    errors.push({
      message: "Main method should accept String[] args parameter",
      type: "warning",
      suggestion: "Use: public static void main(String[] args)",
    })
  }

  // Check for unclosed quotes
  const singleQuotes = (code.match(/"/g) || []).length
  if (singleQuotes % 2 !== 0) {
    errors.push({
      message: "Unclosed string literal (odd number of quotes)",
      type: "error",
      suggestion: "Check that all string literals are properly closed with quotes",
    })
  }

  // If no errors found, add success message
  if (errors.length === 0) {
    errors.push({
      message: "No errors detected! Your code looks good.",
      type: "success",
    })
  }

  return { errors, correctedCode }
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Invalid code provided" }, { status: 400 })
    }

    const { errors, correctedCode } = analyzeJavaCode(code)

    return NextResponse.json({ errors, correctedCode })
  } catch (error) {
    console.error("Error analyzing Java code:", error)
    return NextResponse.json({ error: "Failed to analyze code" }, { status: 500 })
  }
}
