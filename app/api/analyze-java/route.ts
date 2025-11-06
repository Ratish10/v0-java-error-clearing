import { type NextRequest, NextResponse } from "next/server"

interface JavaError {
  message: string
  type: "error" | "warning" | "success"
  line?: number
  suggestion?: string
}

function tokenizeJava(code: string) {
  const tokens = []
  let i = 0
  let line = 1

  while (i < code.length) {
    const char = code[i]
    const startLine = line

    // Track line numbers
    if (char === "\n") {
      line++
      i++
      continue
    }

    // Skip whitespace
    if (/\s/.test(char)) {
      i++
      continue
    }

    // String tokens
    if (char === '"' || char === "'") {
      let str = char
      i++
      while (i < code.length && code[i] !== char) {
        if (code[i] === "\\") i++
        str += code[i]
        i++
      }
      if (i < code.length) str += code[i++]
      tokens.push({ type: "string", value: str, line: startLine })
      continue
    }

    // Comments
    if (char === "/" && code[i + 1] === "/") {
      let comment = ""
      while (i < code.length && code[i] !== "\n") comment += code[i++]
      tokens.push({ type: "comment", value: comment, line: startLine })
      continue
    }

    if (char === "/" && code[i + 1] === "*") {
      let comment = ""
      i += 2
      while (i < code.length && !(code[i] === "*" && code[i + 1] === "/")) {
        if (code[i] === "\n") line++
        comment += code[i++]
      }
      i += 2
      tokens.push({ type: "comment", value: comment, line: startLine })
      continue
    }

    // Numbers
    if (/\d/.test(char)) {
      let num = ""
      while (i < code.length && /[\d.]/.test(code[i])) num += code[i++]
      tokens.push({ type: "number", value: num, line: startLine })
      continue
    }

    // Identifiers and keywords
    if (/[a-zA-Z_$]/.test(char)) {
      let word = ""
      while (i < code.length && /[a-zA-Z0-9_$]/.test(code[i])) word += code[i++]
      tokens.push({ type: "identifier", value: word, line: startLine })
      continue
    }

    // Delimiters: { } [ ] ( ) , ; : .
    if ("{}[](),;:.".includes(char)) {
      tokens.push({ type: "delimiter", value: char, line: startLine })
      i++
      continue
    }

    // Operators
    if ("+-*/%=<>!&|?".includes(char)) {
      let op = char
      i++
      if (i < code.length && "+-*/%=<>!&|".includes(code[i])) op += code[i++]
      tokens.push({ type: "operator", value: op, line: startLine })
      continue
    }

    i++
  }

  return tokens
}

function analyzeJavaCode(code: string) {
  const errors: JavaError[] = []
  let correctedCode = code
  const tokens = tokenizeJava(code)

  // Track opening/closing brackets
  const stack: { char: string; line: number }[] = []
  const bracketPair: Record<string, string> = { "{": "}", "[": "]", "(": ")" }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    // Check for unclosed strings
    if (token.type === "string") {
      const openQuote = token.value.charAt(0)
      if (!token.value.endsWith(openQuote)) {
        errors.push({
          message: `Unclosed string at line ${token.line}`,
          type: "error",
          line: token.line,
          suggestion: `Add closing quote: ${openQuote}`,
        })
        correctedCode = correctedCode.replace(token.value, token.value + openQuote)
      }
    }

    // Check opening brackets
    if (token.type === "delimiter" && "{[(".includes(token.value)) {
      stack.push({ char: token.value, line: token.line })
    }

    // Check closing brackets
    if (token.type === "delimiter" && "}])".includes(token.value)) {
      const lastOpen = stack[stack.length - 1]
      const expectedOpen = token.value === "}" ? "{" : token.value === "]" ? "[" : "("

      if (lastOpen && lastOpen.char === expectedOpen) {
        stack.pop()
      } else {
        errors.push({
          message: `Mismatched bracket: ${token.value} at line ${token.line}`,
          type: "error",
          line: token.line,
          suggestion: `Expected ${bracketPair[lastOpen?.char] || "matching bracket"}`,
        })
      }
    }
  }

  // Check for unclosed brackets at end
  for (const unclosed of stack) {
    errors.push({
      message: `Unclosed bracket: ${unclosed.char} at line ${unclosed.line}`,
      type: "error",
      line: unclosed.line,
      suggestion: `Add closing bracket: ${bracketPair[unclosed.char]}`,
    })
  }

  // Check for common typos
  if (code.includes("Systme")) {
    errors.push({
      message: 'Typo: "Systme" should be "System"',
      type: "error",
      suggestion: 'Replace with "System.out.println"',
    })
    correctedCode = correctedCode.replace(/Systme/g, "System")
  }

  if (errors.length === 0) {
    errors.push({
      message: "No errors found! Code looks clean.",
      type: "success",
    })
  }

  return { errors, correctedCode }
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 })
    }

    const result = analyzeJavaCode(code)
    return NextResponse.json(result)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to analyze code" }, { status: 500 })
  }
}
