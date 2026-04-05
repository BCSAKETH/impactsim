import { SimulationState, ChallengeOption } from '../context/SimulationContext';

export interface MentorFeedback {
  critique: string;
  improvement: string;
  consequences: string;
}

export const getMentorFeedback = async (
  state: SimulationState,
  lastChoice: ChallengeOption
): Promise<MentorFeedback> => {
  const apiKey = (import.meta as any).env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY;

  if (!apiKey) {
    return {
      critique: "I'm observing your strategy closely. Remember to balance immediate impact with long-term financial sustainability.",
      improvement: "Ensure your next move secures either trust or a budget buffer.",
      consequences: "Unchecked spending will lead to a resource crisis in the next milestone."
    };
  }

  const prompt = `
    You are Yukti, the AI Mentor for a social entrepreneurship simulation. Your tone is supportive yet direct. 
    You analyze trade-offs between Budget, Impact, and Risk.

    Current Venture: ${state.scenarioName}
    Current State:
    - Budget: $${state.budget.toLocaleString()}
    - Social Impact: ${state.socialImpact}%
    - Stakeholder Trust: ${state.trust}%
    - Risk Level: ${100 - state.trust}%

    User's Latest Choice: "${lastChoice.text}"
    Choice Effects: 
    - Budget: ${lastChoice.effect_budget}
    - Impact: ${lastChoice.effect_impact}
    - Trust: ${lastChoice.effect_trust}

    Provide a strategic evaluation of this choice. 
    1. Critique the decision (Challenge assumptions if it was too safe or too risky).
    2. Predict long-term consequences.
    3. Provide one actionable strategic improvement for the next move.

    OUTPUT MUST BE STRICT JSON:
    {
      "critique": "Your supportive but direct critique",
      "improvement": "One specific actionable advice",
      "consequences": "Long-term trajectory prediction"
    }
    Language: ${state.gameLanguage || 'English'}
  `;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { 
            role: 'system', 
            content: 'You are Yukti AI Mentor. Context-aware, direct, and strategic advisor. Output strictly valid JSON.' 
          },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('Yukti Mentor Error:', error);
    return {
      critique: "Strategic synchronization lost. Continue with caution.",
      improvement: "Verify your budget runway before the next major investment.",
      consequences: "Operational visibility is currently limited."
    };
  }
};
