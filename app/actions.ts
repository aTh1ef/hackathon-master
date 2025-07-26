
'use server';

import { analyzeSoilImage, type AnalyzeSoilImageOutput } from '@/app/ai/flows/analyze-soil-image';
import { analyzeClimateSuitability, type AnalyzeClimateSuitabilityOutput } from '@/app/ai/flows/analyze-climate-suitability';

export type AnalysisResult = {
  soilAnalysis: AnalyzeSoilImageOutput | null;
  climateSuitability: AnalyzeClimateSuitabilityOutput | null;
  error?: string | null;
};

export async function getAnalysis(
  photoDataUri: string,
  latitude: number,
  longitude: number,
  language: string,
): Promise<AnalysisResult> {
  try {
    const soilResult = await analyzeSoilImage({
        photoDataUri: photoDataUri,
        locationLatitude: latitude,
        locationLongitude: longitude,
        language: language,
    });

    if (!soilResult) {
      throw new Error('Failed to get a soil analysis from the AI.');
    }
    
    if (!soilResult.isSoil) {
      return {
        soilAnalysis: null,
        climateSuitability: null,
        error: "The uploaded image does not appear to be soil. Please upload a clear picture of a soil sample.",
      };
    }

    const climateResult = await analyzeClimateSuitability({
        latitude: latitude,
        longitude: longitude,
        language: language,
      });


    if (!climateResult) {
      throw new Error('Failed to get a climate analysis from the AI.');
    }

    return {
      soilAnalysis: soilResult,
      climateSuitability: climateResult,
      error: null,
    };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred during analysis.';
    return {
      soilAnalysis: null,
      climateSuitability: null,
      error: `Sorry, we couldn't complete the analysis. Reason: ${errorMessage}`,
    };
  }
}