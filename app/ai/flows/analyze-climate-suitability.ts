'use server';

/**
 * @fileOverview Analyzes climate suitability for crops based on location.
 *
 * - analyzeClimateSuitability - A function that analyzes climate suitability based on location.
 * - AnalyzeClimateSuitabilityInput - The input type for the analyzeClimateSuitability function.
 * - AnalyzeClimateSuitabilityOutput - The return type for the analyzeClimateSuitability function.
 */

import {ai} from '@/app/ai/genkit';
import {z} from 'genkit';

const AnalyzeClimateSuitabilityInputSchema = z.object({
  latitude: z.number().describe('The latitude of the location.'),
  longitude: z.number().describe('The longitude of the location.'),
  language: z.string().optional().describe('The preferred language for the output.'),
});
export type AnalyzeClimateSuitabilityInput = z.infer<typeof AnalyzeClimateSuitabilityInputSchema>;

const AnalyzeClimateSuitabilityOutputSchema = z.object({
  crops: z.array(
    z.object({
      name: z.string().describe('The name of the suitable crop.'),
      description: z.string().describe('A description of the crop and why it is suitable for the location.'),
      image: z.string().optional().describe('A URL of an image of the crop.'),
    })
  ).describe('A list of crops suitable for the given location and climate.'),
});
export type AnalyzeClimateSuitabilityOutput = z.infer<typeof AnalyzeClimateSuitabilityOutputSchema>;

export async function analyzeClimateSuitability(input: AnalyzeClimateSuitabilityInput): Promise<AnalyzeClimateSuitabilityOutput> {
  return analyzeClimateSuitabilityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeClimateSuitabilityPrompt',
  input: {schema: AnalyzeClimateSuitabilityInputSchema},
  output: {schema: AnalyzeClimateSuitabilityOutputSchema},
  prompt: `You are an agricultural expert advising farmers on the best crops to grow.

Based on the location (latitude: {{{latitude}}}, longitude: {{{longitude}}}), analyze the climate and region.

Recommend 3 crops that are best suited for these conditions. Provide a brief description of each crop and why it is suitable.
For each crop, provide a publicly accessible image URL from a source like Wikipedia/Wikimedia Commons. Ensure the image URL is direct and embeddable.
Respond in the language: {{{language}}}

Output the answer as a JSON array of crops:

[
  {
    "name": "Crop Name",
    "description": "Description of the crop and its suitability.",
    "image": "URL of the crop image"
  }
]
`,
});

const analyzeClimateSuitabilityFlow = ai.defineFlow(
  {
    name: 'analyzeClimateSuitabilityFlow',
    inputSchema: AnalyzeClimateSuitabilityInputSchema,
    outputSchema: AnalyzeClimateSuitabilityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);