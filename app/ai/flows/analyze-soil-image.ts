
'use server';

/**
 * @fileOverview Analyzes the soil image to determine its texture and condition, and recommends suitable crops.
 *
 * - analyzeSoilImage - A function that handles the soil image analysis process.
 * - AnalyzeSoilImageInput - The input type for the analyzeSoilImage function.
 * - AnalyzeSoilImageOutput - The return type for the analyzeSoilImage function.
 */

import {ai} from '@/app/ai/genkit';
import {z} from 'genkit';

const AnalyzeSoilImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the soil, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  locationLatitude: z
    .number()
    .describe('The latitude of the location where the soil sample was taken.'),
  locationLongitude: z
    .number()
    .describe('The longitude of the location where the soil sample was taken.'),
  language: z.string().optional().describe('The preferred language for the output.'),
});
export type AnalyzeSoilImageInput = z.infer<typeof AnalyzeSoilImageInputSchema>;

const AnalyzeSoilImageOutputSchema = z.object({
  isSoil: z.boolean().describe('Whether the image appears to be of soil.'),
  soilAnalysis: z.object({
    texture: z.string().describe('The texture of the soil.'),
    condition: z.string().describe('The condition of the soil.'),
    suitableCrops: z
      .array(z.string())
      .describe('The list of suitable crops for the soil.'),
  }),
  climateAnalysis: z.object({
    region: z.string().describe('The region of the location.'),
    climate: z.string().describe('The climate of the location.'),
  }),
});
export type AnalyzeSoilImageOutput = z.infer<typeof AnalyzeSoilImageOutputSchema>;

export async function analyzeSoilImage(input: AnalyzeSoilImageInput): Promise<AnalyzeSoilImageOutput> {
  return analyzeSoilImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSoilImagePrompt',
  input: {schema: AnalyzeSoilImageInputSchema},
  output: {schema: AnalyzeSoilImageOutputSchema},
  prompt: `You are an expert soil and climate analyst for agricultural purposes in India.

First, determine if the provided image is a picture of soil. If it is not, set the isSoil field to false and you can leave the other fields empty.

If the image is of soil, you will use this information to analyze the soil from the image, and the climate data based on the coordinates provided.

Based on the soil texture and condition, and the climate and region, recommend the best-suited crops to grow. Consider local farming practices and common crops in the region.

Soil Photo: {{media url=photoDataUri}}
Location Latitude: {{{locationLatitude}}}
Location Longitude: {{{locationLongitude}}}

Respond in the language: {{{language}}}
Output in the format described in the output schema.`,
});

const analyzeSoilImageFlow = ai.defineFlow(
  {
    name: 'analyzeSoilImageFlow',
    inputSchema: AnalyzeSoilImageInputSchema,
    outputSchema: AnalyzeSoilImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);