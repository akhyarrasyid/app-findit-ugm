"use client";

import { useMutation } from "@tanstack/react-query";
import { BrainCircuit, Database, Radar, ScanFace, ShieldCheck } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { CameraCapture } from "@/components/CameraCapture";
import {
  ResultCard,
  ResultEmptyState,
  ResultErrorState,
  ResultLoadingState,
} from "@/components/ResultCard";
import { TrustIndicatorCard } from "@/components/TrustIndicatorCard";
import { predictImage, type PredictResponse, type PredictSource } from "@/lib/api";

const INFO_CARDS = [
  {
    title: "Real-time Ready",
    description: "Capture dan upload memakai endpoint yang sama.",
    Icon: BrainCircuit,
  },
  {
    title: "Private by Default",
    description: "Gambar tidak disimpan ke database.",
    Icon: Database,
  },
  {
    title: "Model Active",
    description: "Inference berjalan melalui backend ONNX aktif.",
    Icon: Radar,
  },
];

const TRUST_ITEMS = [
  "Real-time inference",
  "ONNX model active",
  "Privacy-first",
];

export default function ScanPage() {
  const mutation = useMutation<
    PredictResponse,
    Error,
    { file: File; source: PredictSource }
  >({
    mutationFn: ({ file, source }) => predictImage(file, source),
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-950 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
      <AppHeader />

      <section className="border-b border-slate-200/80 bg-white/70 dark:border-slate-800/80 dark:bg-slate-950/40">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:py-8">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <ScanFace className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
              AI Liveness Verification
            </div>
            <h1 className="text-4xl font-semibold tracking-normal text-slate-950 dark:text-slate-100 md:text-5xl">
              Face Liveness Detection
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
              Verifikasi apakah wajah berasal dari orang asli atau indikasi spoofing
              seperti layar, cetakan, topeng, atau mannequin.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {TRUST_ITEMS.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
        <div className="space-y-6">
          <CameraCapture
            loading={mutation.isPending}
            onImageReady={async (file, source) => {
              await mutation.mutateAsync({ file, source });
            }}
          />
        </div>

        <div className="space-y-6">
          {mutation.isPending ? (
            <ResultLoadingState />
          ) : mutation.error ? (
            <ResultErrorState message={mutation.error.message} />
          ) : mutation.data ? (
            <ResultCard result={mutation.data} />
          ) : (
            <ResultEmptyState />
          )}

          <div className="grid gap-3">
            {INFO_CARDS.map(({ title, description, Icon }) => (
              <TrustIndicatorCard
                key={title}
                title={title}
                description={description}
                Icon={Icon}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
