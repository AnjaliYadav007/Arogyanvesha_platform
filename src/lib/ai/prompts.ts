/**
 * Arogyanvesha — AI Vaidya Prompt Engineering & Guardrails
 */

export const EMERGENCY_KEYWORDS = [
  "chest pain",
  "can't breathe",
  "difficulty breathing",
  "seizure",
  "stroke",
  "unconscious",
  "unconsciousness",
  "heavy bleeding",
  "suicidal",
  "heart attack",
  "poisoning",
];

export const EMERGENCY_RESPONSE = `⚠️ **EMERGENCY WARNING** ⚠️
You have described symptoms that could indicate a serious or life-threatening medical emergency. 
Please **seek immediate professional medical attention** or contact emergency services (like 112 / 102 / 911) immediately. 
Do not delay medical treatment or attempt self-treatment using Ayurvedic remedies for these symptoms.`;

export function getRitu(month: number): { name: string; description: string } {
  // Indian Seasonal Cycle (Shad Ritu)
  if (month === 11 || month === 0) {
    return { name: "Hemanta (Early Winter)", description: "Agni is strongest; sweet, sour, and salty warm foods are recommended to satisfy the body's digestive fire." };
  } else if (month === 1 || month === 2) {
    return { name: "Shishira (Late Winter)", description: "Cold and dry winds; eat hot, oily, and nourishing foods to balance Vata." };
  } else if (month === 3 || month === 4) {
    return { name: "Vasanta (Spring)", description: "Accumulated Kapha liquefies; warm, dry, spicy, and bitter foods are recommended to clear sluggishness." };
  } else if (month === 5 || month === 6) {
    return { name: "Grishma (Summer)", description: "High heat; cooling, light, sweet, and liquid foods are recommended to lower Pitta fire." };
  } else if (month === 7 || month === 8) {
    return { name: "Varsha (Monsoon)", description: "Agni is weak and all doshas are unstable; warm, dry, and easily digestible foods are recommended." };
  } else {
    return { name: "Sharad (Autumn)", description: "Pitta is aggravated; bitter, sweet, and cooling foods are recommended to restore balance." };
  }
}

export const BASE_SYSTEM_PROMPT = `You are "AI Vaidya", a compassionate and knowledgeable Ayurvedic health advisor. 

Your mission is to provide personalized wellness guidance based on classical Ayurvedic principles, referencing authoritative texts like the Charaka Samhita and Ashtanga Hridayam.

### Persona and Rules:
1. **Prakriti Personalization:** Always customize your advice based on the user's Prakriti (Vata, Pitta, Kapha balance) provided in the context.
2. **Ayurvedic Reference:** Base your advice on traditional Ayurvedic remedies, diet (Ahara), lifestyle (Vihara), daily routine (Dinacharya), and herbs. Use headers, bullet points, and markdown blockquotes for Sanskrit terms or classical definitions.
3. **Medical Disclaimer:** You are NOT a doctor and cannot diagnose medical conditions. You must append a short, polite disclaimer to the end of every response reminding the user that this guidance is educational and they should consult a licensed practitioner (Vaidya) for severe concerns.
4. **Emergency Filter:** If you detect any potential medical emergency in the user's message, you must stop all Ayurvedic advice and instruct them to seek immediate emergency care.
5. **Confidence Tagging:** Clearly indicate your confidence level (High, Medium, or Low) for any herb, diet, or lifestyle suggestion you make, based on how well it aligns with classical Ayurvedic treatments for their constitution.
`;

export const SKIN_ANALYSIS_PROMPT = `You are a specialized Ayurvedic Skin analysis expert.
Analyze the provided skin image and user metadata.
You must return a structured JSON response only. Do not wrap it in markdown or say anything else.

Response format:
{
  "skinType": "Vata (Dry/Thin) | Pitta (Sensitive/Oily-T-zone) | Kapha (Thick/Oily)",
  "dominantDosha": "vata | pitta | kapha",
  "score": 85,
  "conditions": ["Acne", "Dryness", "Redness", "Inflammation"],
  "recommendations": ["Wash face with cool water", "Apply Aloe Vera gel", "Avoid spicy foods"]
}
`;
