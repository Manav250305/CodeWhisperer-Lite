
const OpenAI = require("openai");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


/**
 * Generate code using OpenAI GPT
 * @param {string} prompt - The user's request
 * @param {string} language - Target programming language
 * @returns {Promise<string>} - Generated code
 */
export const generateCode = async (prompt, language) => {
  try {
    console.log("Generating code for language:", language);

    // Language-specific system prompts
    const systemPrompts = {
      javascript:
        "You are an expert JavaScript developer. Generate clean, modern JavaScript code with proper error handling and comments. Follow ES6+ standards and best practices.",
      python:
        "You are an expert Python developer. Generate clean, pythonic code with proper error handling, type hints where appropriate, and docstrings. Follow PEP 8 standards.",
      html: "You are an expert web developer. Generate semantic, accessible HTML5 code with proper structure and meaningful class names.",
      css: "You are an expert CSS developer. Generate modern CSS with flexbox/grid layouts, proper naming conventions, and responsive design principles.",
      react:
        "You are an expert React developer. Generate functional components using hooks, with proper prop types, clean JSX, and following React best practices.",
      typescript:
        "You are an expert TypeScript developer. Generate type-safe code with proper interfaces, type annotations, and following TypeScript best practices.",
      java: "You are an expert Java developer. Generate clean, object-oriented Java code with proper naming conventions, error handling, and documentation.",
      cpp: "You are an expert C++ developer. Generate efficient, modern C++ code with proper memory management and following C++17+ standards.",
      csharp:
        "You are an expert C# developer. Generate clean C# code following .NET conventions with proper error handling and XML documentation.",
      php: "You are an expert PHP developer. Generate modern PHP code with proper error handling, type declarations, and following PSR standards.",
      ruby: "You are an expert Ruby developer. Generate clean, idiomatic Ruby code following Ruby conventions and best practices.",
      go: "You are an expert Go developer. Generate clean, idiomatic Go code with proper error handling and following Go conventions.",
      rust: "You are an expert Rust developer. Generate safe, efficient Rust code with proper ownership, error handling, and documentation.",
      sql: "You are an expert database developer. Generate efficient, readable SQL queries with proper formatting and comments.",
      bash: "You are an expert shell scripting developer. Generate robust bash scripts with proper error handling and comments.",
    };

    const systemPrompt =
      systemPrompts[language] ||
      `You are an expert ${language} developer. Generate clean, well-documented code following best practices for ${language}.`;

    // Enhanced user prompt with context
    const enhancedPrompt = `
Create ${language} code for the following request: "${prompt}"

Requirements:
- Write clean, readable code
- Include helpful comments
- Add error handling where appropriate
- Follow ${language} best practices and conventions
- Make the code production-ready
- Only return the code, no explanations or markdown formatting

Request: ${prompt}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: enhancedPrompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.3, // Lower temperature for more consistent code
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const generatedCode = completion.choices[0].message.content.trim();

    // Clean up the response (remove markdown formatting if present)
    const cleanCode = generatedCode
      .replace(/^```[a-zA-Z]*\n/, "") // Remove opening code fence
      .replace(/\n```$/, "") // Remove closing code fence
      .trim();

    return cleanCode;
  } catch (error) {
    console.error("Code generation failed:", error);

    // Provide helpful error messages
    if (error.code === "insufficient_quota") {
      throw new Error(
        "OpenAI API quota exceeded. Please check your billing settings."
      );
    } else if (error.code === "invalid_api_key") {
      throw new Error(
        "Invalid OpenAI API key. Please check your configuration."
      );
    } else if (error.code === "rate_limit_exceeded") {
      throw new Error("Rate limit exceeded. Please try again in a moment.");
    } else {
      throw new Error(`Code generation failed: ${error.message}`);
    }
  }
};

/**
 * Improve existing code with AI suggestions
 * @param {string} code - Existing code to improve
 * @param {string} language - Programming language
 * @param {string} improvementType - Type of improvement (performance, readability, security, etc.)
 * @returns {Promise<string>} - Improved code
 */
export const improveCode = async (
  code,
  language,
  improvementType = "general"
) => {
  try {
    const improvementPrompts = {
      performance:
        "Optimize this code for better performance while maintaining functionality.",
      readability: "Improve the readability and maintainability of this code.",
      security:
        "Enhance the security of this code by addressing potential vulnerabilities.",
      general:
        "Improve this code by making it more efficient, readable, and following best practices.",
    };

    const prompt = `${improvementPrompts[improvementType]}

Original ${language} code:
\`\`\`${language}
${code}
\`\`\`

Please provide the improved version with comments explaining the changes made.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert ${language} developer specializing in code optimization and best practices.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.2,
    });

    const improvedCode = completion.choices[0].message.content.trim();

    // Clean up the response
    const cleanCode = improvedCode
      .replace(/^```[a-zA-Z]*\n/, "")
      .replace(/\n```$/, "")
      .trim();

    return cleanCode;
  } catch (error) {
    console.error("Code improvement failed:", error);
    throw new Error(`Code improvement failed: ${error.message}`);
  }
};

/**
 * Explain code functionality
 * @param {string} code - Code to explain
 * @param {string} language - Programming language
 * @returns {Promise<string>} - Code explanation
 */
export const explainCode = async (code, language) => {
  try {
    const prompt = `Explain what this ${language} code does in simple terms:

\`\`\`${language}
${code}
\`\`\`

Provide a clear, beginner-friendly explanation of:
1. What the code does overall
2. Key components and their purpose
3. How it works step by step
4. Any important concepts used`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful programming instructor who explains code clearly and simply.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("Code explanation failed:", error);
    throw new Error(`Code explanation failed: ${error.message}`);
  }
};

/**
 * Generate unit tests for code
 * @param {string} code - Code to test
 * @param {string} language - Programming language
 * @returns {Promise<string>} - Generated unit tests
 */
export const generateTests = async (code, language) => {
  try {
    const testFrameworks = {
      javascript: "Jest",
      python: "pytest",
      java: "JUnit",
      csharp: "NUnit",
      go: "Go testing package",
      rust: "Rust built-in testing",
      php: "PHPUnit",
    };

    const framework =
      testFrameworks[language] || "appropriate testing framework";

    const prompt = `Generate comprehensive unit tests for this ${language} code using ${framework}:

\`\`\`${language}
${code}
\`\`\`

Include:
- Test cases for normal functionality
- Edge cases and error conditions
- Mock data where needed
- Clear test descriptions
- Proper setup and teardown if needed`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert test automation engineer specializing in ${language} testing with ${framework}.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.2,
    });

    const tests = completion.choices[0].message.content.trim();

    // Clean up the response
    const cleanTests = tests
      .replace(/^```[a-zA-Z]*\n/, "")
      .replace(/\n```$/, "")
      .trim();

    return cleanTests;
  } catch (error) {
    console.error("Test generation failed:", error);
    throw new Error(`Test generation failed: ${error.message}`);
  }
};

/**
 * Check if API key is configured
 * @returns {boolean} - Whether API key is available
 */
export const isApiKeyConfigured = () => {
  return !!process.env.OPENAI_API_KEY;
};

/**
 * Test API connection
 * @returns {Promise<boolean>} - Whether API is accessible
 */
export const testApiConnection = async () => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Hello",
        },
      ],
      max_tokens: 10,
    });

    return !!completion.choices[0].message.content;
  } catch (error) {
    console.error("API test failed:", error);
    return false;
  }
};
