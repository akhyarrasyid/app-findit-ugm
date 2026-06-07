import {
  AlertCircle,
  AlertTriangle,
  Camera,
  CheckCircle2,
  FlaskConical,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { ClassScoreBar } from "@/components/ClassScoreBar";
import {
  SpoofingBadge,
  getLabelName,
  normalizePredictionLabel,
} from "@/components/SpoofingBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PredictResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

const EXPLANATIONS: Record<string, string> = {
  real_person: "Wajah terverifikasi sebagai orang asli.",
  fake_mask: "Terdeteksi indikasi spoofing berbasis masker atau wajah tiruan.",
  fake_screen: "Terdeteksi indikasi spoofing berbasis layar atau replay.",
  fake_printed: "Terdeteksi indikasi spoofing berbasis media cetak.",
  fake_mannequin: "Terdeteksi indikasi spoofing berbasis mannequin atau dummy face.",
  fake_unknown: "Terdeteksi indikasi spoofing yang tidak termasuk kategori utama.",
};

export function ResultCard({ result }: { result: PredictResponse }) {
  const sortedScores = Object.entries(result.all_scores).sort((a, b) => b[1] - a[1]);
  const confidence = Math.round(result.confidence * 100);
  const isReal = result.is_real;
  const normalizedLabel = normalizePredictionLabel(result.label);
  const displayLabel = getLabelName(result.label);
  const isLowConfidence = result.confidence < 0.7;

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900/75",
        isReal ? "border-t-4 border-t-emerald-500" : "border-t-4 border-t-rose-500",
      )}
    >
      <CardHeader className="border-b border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl text-slate-950 dark:text-slate-100">
              Hasil Analisis
            </CardTitle>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              {isReal
                ? "Wajah terverifikasi sebagai orang asli."
                : `Prediksi model: ${displayLabel}. Gunakan sebagai indikasi awal untuk verifikasi.`}
            </p>
          </div>
          <SpoofingBadge label={result.label} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div
          className={cn(
            "flex items-center justify-between gap-4 rounded-2xl border p-4",
            isReal
              ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/70 dark:bg-emerald-950/30"
              : "border-rose-200 bg-rose-50 dark:border-rose-900/70 dark:bg-rose-950/30",
          )}
        >
          <div className="flex items-center gap-3">
            {isReal ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-rose-600 dark:text-rose-300" />
            )}
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Status
              </p>
              <p className="text-lg font-semibold text-slate-950 dark:text-slate-100">
                {isReal ? "Real Person" : "Fake / Spoof"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Confidence
            </p>
            <p className="text-3xl font-semibold text-slate-950 dark:text-slate-100">
              {confidence}%
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">
            {isLowConfidence
              ? `Indikasi ${displayLabel} dengan confidence sedang`
              : isReal
                ? "Wajah terverifikasi sebagai orang asli"
                : `${displayLabel} terdeteksi`}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {EXPLANATIONS[normalizedLabel] ?? "Hasil analisis tersedia untuk ditinjau."}
            {isLowConfidence
              ? " Pertimbangkan scan ulang dengan pencahayaan lebih stabil."
              : ""}
          </p>
        </div>

        {result.mock && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-200">
            <FlaskConical className="mt-0.5 h-5 w-5 flex-none" />
            <span>Mode demo: model ONNX belum terhubung.</span>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-100">
              Class Scores
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Prediksi utama: {getLabelName(result.label)}
            </span>
          </div>
          <div className="space-y-3">
            {sortedScores.map(([label, score]) => (
              <ClassScoreBar key={label} label={label} score={score} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ResultEmptyState() {
  return (
    <Card className="rounded-2xl border-dashed border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
      <CardContent className="flex min-h-[320px] flex-col items-center justify-center p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h2 className="mt-5 text-lg font-semibold text-slate-950 dark:text-slate-100">
          Belum ada hasil analisis
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-400">
          Ambil foto atau upload gambar untuk mulai melakukan verifikasi wajah.
        </p>
      </CardContent>
    </Card>
  );
}

export function ResultLoadingState() {
  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/75">
      <CardContent className="min-h-[320px] space-y-6 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">
              Menganalisis citra wajah...
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Model sedang memproses gambar yang dikirim.
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          <div className="h-3 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
          <div className="h-3 w-5/6 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
          <div className="h-3 w-4/6 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ResultErrorState({ message }: { message?: string }) {
  return (
    <Card className="rounded-2xl border-rose-200 bg-white shadow-sm dark:border-rose-900/70 dark:bg-slate-900/75">
      <CardContent className="flex min-h-[320px] flex-col justify-center p-6">
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-200">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-none" />
          <div>
            <h2 className="font-semibold">Analisis gagal</h2>
            <p className="mt-1 text-sm leading-6">
              {message ??
                "Tidak dapat terhubung ke server inference. Coba ulangi beberapa saat lagi."}
            </p>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
          <Camera className="h-4 w-4" />
          <span>Pastikan file berupa JPG, PNG, atau WebP dengan ukuran wajar.</span>
        </div>
      </CardContent>
    </Card>
  );
}
