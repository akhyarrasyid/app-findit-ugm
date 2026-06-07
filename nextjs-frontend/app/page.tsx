import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Activity, ArrowRight, ScanFace, ShieldCheck } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-950 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
      <AppHeader />
      <section className="border-b border-slate-200/80 bg-white/70 dark:border-slate-800/80 dark:bg-slate-950/40">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1fr_380px] md:items-center lg:py-16">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Activity className="h-4 w-4" />
              ONNX Face Spoofing Detection
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold text-slate-950 dark:text-slate-100 md:text-5xl">
              Face Liveness Detection
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
              Verifikasi wajah berbasis AI untuk membedakan orang asli dari indikasi
              spoofing seperti layar, cetakan, topeng, mannequin, dan pola tidak dikenal.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="h-11 gap-2 rounded-xl bg-slate-950 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white">
                <Link href="/scan">
                  <ScanFace className="h-4 w-4" />
                  Scan Sekarang
                </Link>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-lg shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/95 text-slate-950 shadow-sm">
              <ShieldCheck className="h-10 w-10 text-emerald-600" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-normal text-emerald-300">
              Production demo
            </p>
            <p className="mt-3 text-2xl font-semibold">FastAPI + Next.js + ONNX Runtime</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Capture dari webcam, fallback upload gambar, dan hasil prediksi langsung dari
              endpoint inference yang sama.
            </p>
            <div className="mt-6 grid gap-3">
              {["Real-time inference", "Privacy-first", "Production API"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-200">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  {item}
                </div>
              ))}
            </div>
            <Button asChild variant="secondary" className="mt-6 w-full gap-2 rounded-xl">
              <Link href="/scan">
                <ArrowRight className="h-4 w-4" />
                Mulai Demo Scan
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
