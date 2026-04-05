import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely converts AI-generated values to strings for React rendering.
 * Specifically handles objects with keys like {area, detail} if they occur.
 */
export function safeRender(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    if (val.area && val.detail) return `${val.area}: ${val.detail}`;
    if (val.detail) return String(val.detail);
    if (val.area) return String(val.area);
    return JSON.stringify(val);
  }
  return String(val);
}

export function cleanJsonParse(text: string) {
  try {
    // 1. Try direct parse
    return JSON.parse(text);
  } catch (e) {
    try {
      // 2. Try stripping markdown blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1].trim());
      }
      
      // 3. Try finding the first '{' and last '}'
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
      }
      
      throw new Error("Could not find JSON structure");
    } catch (parseError) {
      console.error("Failed to parse JSON even after cleaning:", text);
      throw parseError;
    }
  }
}
