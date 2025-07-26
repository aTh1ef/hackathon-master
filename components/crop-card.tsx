"use client"
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import type { AnalyzeClimateSuitabilityOutput } from "@/app/ai/flows/analyze-climate-suitability"
import { Sprout } from "lucide-react"

type Crop = AnalyzeClimateSuitabilityOutput["crops"][0]

type CropCardProps = {
  crop: Crop
}

export function CropCard({ crop }: CropCardProps) {
  return (
    <Card className="overflow-hidden shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 flex flex-col h-full bg-slate-800/90 backdrop-blur-xl border-slate-600/50 hover:-translate-y-2 hover:scale-[1.02] group">
      <CardContent className="p-6 flex-grow flex flex-col justify-center items-center text-center">
        <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-full mb-4 group-hover:from-emerald-400/30 group-hover:to-green-400/30 group-hover:border-emerald-400/50 transition-all duration-300">
          <Sprout className="h-10 w-10 text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300" />
        </div>
        <CardTitle className="text-3xl font-bold mb-3 text-white group-hover:text-emerald-100 transition-colors duration-300">
          {crop.name}
        </CardTitle>
        <CardDescription className="text-base text-slate-300 flex-grow leading-relaxed group-hover:text-slate-200 transition-colors duration-300">
          {crop.description}
        </CardDescription>
      </CardContent>
    </Card>
  )
}

// 'use client';

// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import type { AnalyzeClimateSuitabilityOutput } from "@/app/ai/flows/analyze-climate-suitability";

// import { Sprout } from "lucide-react";

// type Crop = AnalyzeClimateSuitabilityOutput['crops'][0];

// type CropCardProps = {
//   crop: Crop;
// };

// export function CropCard({ crop }: CropCardProps) {
//   return (
//     <Card className="overflow-hidden shadow-lg hover:shadow-primary/30 transition-all duration-300 flex flex-col h-full bg-secondary/40 border-border/60 hover:-translate-y-2">
//       <CardContent className="p-6 flex-grow flex flex-col justify-center items-center text-center">
//         <div className="p-4 bg-primary/20 rounded-full mb-4">
//             <Sprout className="h-10 w-10 text-primary" />
//         </div>
//         <CardTitle className="text-3xl font-bold font-headline mb-3 text-primary-foreground">{crop.name}</CardTitle>
//         <CardDescription className="text-base text-muted-foreground flex-grow">
//           {crop.description}
//         </CardDescription>
//       </CardContent>
//     </Card>
//   );
// }