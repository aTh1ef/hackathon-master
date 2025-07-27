"use client"
import type { AnalysisResult } from "@/app/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CropCard } from "@/components/crop-card"
import { Sprout, Sun, Loader2 } from "lucide-react"

type AnalysisResultDisplayProps = {
  result: AnalysisResult | null
  isLoading: boolean
  t: Record<string, any> // translations object
}

export function AnalysisResultDisplay({ result, isLoading, t }: AnalysisResultDisplayProps) {
  if (isLoading) {
    return (
      <div className="w-full mt-8 animate-in fade-in-0 duration-500">
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-16 w-16 animate-spin text-emerald-400 mb-4" />
            <p className="text-xl text-white font-semibold">{t.analyzingButton}</p>
            <p className="text-slate-300 mt-2">{"Analyzing your soil sample and location data..."}</p>
          </CardContent>
        </Card>

        {/* Enhanced Skeleton Loading */}
        <div className="mt-12 w-full space-y-10">
          {/* Skeleton for Recommended Crops */}
          <div>
            <Skeleton className="h-10 w-1/3 mx-auto mb-6 bg-slate-700/50" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <Skeleton className="h-80 w-full rounded-xl bg-slate-700/50" />
              <Skeleton className="h-80 w-full rounded-xl bg-slate-700/50" />
              <Skeleton className="h-80 w-full rounded-xl bg-slate-700/50" />
            </div>
          </div>

          {/* Skeleton for Analysis Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-slate-800/50 border-slate-600/50">
              <CardHeader>
                <Skeleton className="h-8 w-1/2 bg-slate-700/50" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full bg-slate-700/50" />
                <Skeleton className="h-12 w-full bg-slate-700/50" />
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-600/50">
              <CardHeader>
                <Skeleton className="h-8 w-1/2 bg-slate-700/50" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full bg-slate-700/50" />
                <Skeleton className="h-12 w-full bg-slate-700/50" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!result || (!result.soilAnalysis && !result.climateSuitability)) {
    return null
  }

  const { soilAnalysis, climateSuitability } = result

  return (
    <div className="mt-12 w-full space-y-10 animate-in fade-in-50 duration-700">
      {/* Recommended Crops */}
      {climateSuitability && climateSuitability.crops.length > 0 && (
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
            {t.recommendedCropsTitle}
          </h2>
          <p className="text-lg text-slate-300 mb-8">{t.recommendedCropsDescription}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {climateSuitability.crops.map((crop) => (
              <CropCard key={crop.name} crop={crop} />
            ))}
          </div>
        </div>
      )}

      {/* Analysis Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {soilAnalysis && (
          <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl hover:shadow-amber-500/10 transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-amber-800/50 to-orange-800/50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-2xl text-white">
                <Sprout className="h-7 w-7 text-amber-400" /> {t.soilAnalysisTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lg bg-slate-800/50 p-6">
              <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/30">
                <p className="font-semibold text-slate-300 mb-1">{t.soilTextureLabel}</p>
                <p className="font-bold text-xl text-white">{soilAnalysis.soilAnalysis.texture}</p>
              </div>
              <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/30">
                <p className="font-semibold text-slate-300 mb-1">{t.soilConditionLabel}</p>
                <p className="font-bold text-xl text-white">{soilAnalysis.soilAnalysis.condition}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {soilAnalysis && (
          <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-800/50 to-cyan-800/50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-2xl text-white">
                <Sun className="h-7 w-7 text-blue-400" /> {t.climateOverviewTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lg bg-slate-800/50 p-6">
              {/* <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/30">
                <p className="font-semibold text-slate-300 mb-1">{t.climateRegionLabel}</p>
                <p className="font-bold text-xl text-white">{soilAnalysis.climateAnalysis.region}</p>
              </div> */}
              <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/30">
                <p className="font-semibold text-slate-300 mb-1">{t.climateClimateLabel}</p>
                <p className="font-bold text-xl text-white">{soilAnalysis.climateAnalysis.climate}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


// 'use client';

// import type { AnalysisResult } from "@/app/actions";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { CropCard } from "@/components/crop-card";
// import { Sprout, Sun } from "lucide-react";

// type AnalysisResultDisplayProps = {
//   result: AnalysisResult | null;
//   isLoading: boolean;
//   t: Record<string, any>; // translations object
// };

// export function AnalysisResultDisplay({ result, isLoading, t }: AnalysisResultDisplayProps) {
//   if (isLoading) {
//     return (
//       <div className="mt-12 w-full space-y-10">
//         {/* Skeleton for Recommended Crops */}
//         <div>
//           <Skeleton className="h-10 w-1/3 mx-auto mb-6" />
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//             <Skeleton className="h-80 w-full rounded-xl" />
//             <Skeleton className="h-80 w-full rounded-xl" />
//             <Skeleton className="h-80 w-full rounded-xl" />
//           </div>
//         </div>
        
//         {/* Skeleton for Analysis Details */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//           <Card className="bg-secondary/30">
//             <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
//             <CardContent className="space-y-4">
//               <Skeleton className="h-12 w-full" />
//               <Skeleton className="h-12 w-full" />
//             </CardContent>
//           </Card>
//           <Card className="bg-secondary/30">
//             <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
//             <CardContent className="space-y-4">
//               <Skeleton className="h-12 w-full" />
//               <Skeleton className="h-12 w-full" />
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     );
//   }

//   if (!result || (!result.soilAnalysis && !result.climateSuitability)) {
//     return null;
//   }
  
//   const { soilAnalysis, climateSuitability } = result;

//   return (
//     <div className="mt-12 w-full space-y-10 animate-in fade-in-50 duration-700">
//        {/* Recommended Crops */}
//       {climateSuitability && climateSuitability.crops.length > 0 && (
//         <div className="text-center">
//           <h2 className="text-4xl font-bold font-headline mb-2 text-primary-foreground">{t.recommendedCropsTitle}</h2>
//           <p className="text-lg text-muted-foreground mb-8">{t.recommendedCropsDescription}</p>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//             {climateSuitability.crops.map((crop) => (
//               <CropCard key={crop.name} crop={crop} />
//             ))}
//           </div>
//         </div>
//       )}
      
//       {/* Analysis Details */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         {soilAnalysis && (
//           <Card className="bg-secondary/30 border-border/50">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-3 text-2xl font-headline text-primary-foreground">
//                 <Sprout className="h-7 w-7 text-primary" /> {t.soilAnalysisTitle}
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4 text-lg">
//               <div className="p-4 bg-background/50 rounded-lg">
//                 <p className="font-semibold text-muted-foreground mb-1">{t.soilTextureLabel}</p>
//                 <p className="font-bold text-xl text-primary-foreground">{soilAnalysis.soilAnalysis.texture}</p>
//               </div>
//               <div className="p-4 bg-background/50 rounded-lg">
//                 <p className="font-semibold text-muted-foreground mb-1">{t.soilConditionLabel}</p>
//                 <p className="font-bold text-xl text-primary-foreground">{soilAnalysis.soilAnalysis.condition}</p>
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {soilAnalysis && (
//           <Card className="bg-secondary/30 border-border/50">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-3 text-2xl font-headline text-primary-foreground">
//                 <Sun className="h-7 w-7 text-primary" /> {t.climateOverviewTitle}
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4 text-lg">
//               <div className="p-4 bg-background/50 rounded-lg">
//                 <p className="font-semibold text-muted-foreground mb-1">{t.climateRegionLabel}</p>
//                 <p className="font-bold text-xl text-primary-foreground">{soilAnalysis.climateAnalysis.region}</p>
//               </div>
//               <div className="p-4 bg-background/50 rounded-lg">
//                 <p className="font-semibold text-muted-foreground mb-1">{t.climateClimateLabel}</p>
//                 <p className="font-bold text-xl text-primary-foreground">{soilAnalysis.climateAnalysis.climate}</p>
//               </div>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   );
// }