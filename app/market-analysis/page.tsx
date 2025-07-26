import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DashboardEmbed() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
        {/* Back Button */}
        <div className="w-full flex justify-start mb-6">
          <Link href="/features">
            <button className="flex items-center px-4 py-2 bg-slate-800/50 border border-slate-600 text-white rounded-lg hover:bg-slate-700/70 hover:border-slate-500 transition-all duration-300 backdrop-blur-sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Features
            </button>
          </Link>
        </div>

        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent tracking-tight">
            Crop Price Dashboard
          </h1>
          <p className="text-lg text-slate-300 mt-2 max-w-2xl mx-auto">
            Live crop market insights powered by Google Looker Studio.
          </p>
        </header>

        {/* Embedded Looker Studio Dashboard */}
        <Card className="w-full shadow-2xl bg-slate-800/90 backdrop-blur-xl border-slate-600/50 animate-in fade-in-0">
          <CardHeader>
            <CardTitle className="text-white text-xl">
              Mandi Price Trends (Looker Studio)
            </CardTitle>
          </CardHeader>
          <CardContent className="aspect-video overflow-hidden rounded-xl">
            <iframe
              className="w-full h-full rounded-xl border border-slate-600"
              src="https://lookerstudio.google.com/embed/reporting/7d65487c-9541-4645-a407-8009a7913736/page/VHiSF"
              frameBorder="0"
              allowFullScreen
              title="Crop Price Dashboard"
            ></iframe>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}