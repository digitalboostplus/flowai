import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Validate environment variables
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: apiKey,
});

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content: `You are an expert in creating Mermaid.js flowcharts. Convert natural language descriptions into well-structured flowcharts.
          
          Rules for the flowchart:
          1. Start with "graph TD"
          2. Use simple node shapes:
             - Triggers: ((text)) with style fill:#1f4532,stroke:#4ade80,color:#4ade80
             - Conditions: {text} with style fill:#1f3f52,stroke:#60a5fa,color:#60a5fa
             - Actions: [text] with style fill:#1f1f52,stroke:#818cf8,color:#818cf8
          3. Use simple connections with -->
          4. For condition branches, use |Yes| and |No|
          5. Keep node text very short (2-3 words max)
          6. Add style definitions at the end
          7. Use simple layout
          
          You must respond with a JSON object containing a valid Mermaid.js flowchart syntax. Example:
          {
            "mermaidSyntax": "graph TD\\nA((New Lead))-->B{Score > 80}\\nB-->|Yes|C[Send Email]\\nB-->|No|D[Add to CRM]\\nstyle A fill:#1f4532,stroke:#4ade80,color:#4ade80\\nstyle B fill:#1f3f52,stroke:#60a5fa,color:#60a5fa\\nstyle C fill:#1f1f52,stroke:#818cf8,color:#818cf8\\nstyle D fill:#1f1f52,stroke:#818cf8,color:#818cf8",
            "workflow": [
              {
                "id": "A",
                "title": "New Lead",
                "description": "Triggered when a new lead is received",
                "type": "trigger"
              },
              {
                "id": "B",
                "title": "Check Score",
                "description": "Evaluate if lead score is greater than 80",
                "type": "condition"
              },
              {
                "id": "C",
                "title": "Send Email",
                "description": "Send automated email to qualified lead",
                "type": "action"
              },
              {
                "id": "D",
                "title": "Add to CRM",
                "description": "Store lead information in CRM",
                "type": "action"
              }
            ]
          }`
        },
        {
          role: "user",
          content: `Convert this workflow description to a JSON response with valid Mermaid.js flowchart syntax: ${prompt}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });

    const responseString = completion.choices[0].message.content;
    if (!responseString) {
      throw new Error('No response from OpenAI');
    }

    try {
      const parsedResponse = JSON.parse(responseString);
      if (!parsedResponse.mermaidSyntax || !parsedResponse.workflow || !Array.isArray(parsedResponse.workflow)) {
        throw new Error('Invalid response format');
      }

      // Validate and clean the Mermaid syntax
      const cleanedSyntax = parsedResponse.mermaidSyntax
        .replace(/\\n/g, '\n')  // Replace literal \n with actual newlines
        .trim();                // Remove extra whitespace

      // Return the cleaned response
      return NextResponse.json({
        mermaidSyntax: cleanedSyntax,
        workflow: parsedResponse.workflow
      });
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse workflow response' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Workflow generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to generate workflow: ${errorMessage}` },
      { status: 500 }
    );
  }
} 