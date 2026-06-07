"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Clock3, History, Loader2, ScanFace } from "lucide-react";
import Link from "next/link";

import { AppHeader } from "@/components/AppHeader";
import { SpoofingBadge } from "@/components/SpoofingBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getHistory } from "@/lib/api";

export default function HistoryPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["prediction-history"],
    queryFn: getHistory,
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-950 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
      <AppHeader />
      <section className="border-b border-slate-200/80 bg-white/70 dark:border-slate-800/80 dark:bg-slate-950/40">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <History className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
              Prediction History
            </div>
            <h1 className="text-3xl font-semibold text-slate-950 dark:text-slate-100">
              Riwayat Scan
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Data ini hanya menampilkan hasil milik akun yang sedang login.
            </p>
          </div>
          <Button asChild className="h-11 gap-2 rounded-xl bg-slate-950 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white">
            <Link href="/scan" className="gap-2">
              <ScanFace className="h-4 w-4" />
              Scan Baru
            </Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/75">
          <CardHeader className="border-b border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/60">
            <CardTitle className="text-xl text-slate-950 dark:text-slate-100">
              Log Prediksi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading && (
              <div className="flex items-center justify-center gap-3 p-10 text-sm text-slate-600 dark:text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                Memuat riwayat...
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 p-6 text-sm text-rose-700 dark:text-rose-300">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-none" />
                <span>
                  {error instanceof Error
                    ? error.message
                    : "Gagal memuat history. Login terlebih dahulu lalu coba lagi."}
                </span>
              </div>
            )}

            {data && data.items.length === 0 && (
              <div className="p-10 text-center">
                <Clock3 className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500" />
                <h2 className="mt-4 text-lg font-semibold text-slate-950 dark:text-slate-100">
                  Belum ada riwayat
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Scan yang dilakukan saat login akan muncul di halaman ini.
                </p>
              </div>
            )}

            {data && data.items.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-normal text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Waktu</th>
                      <th className="px-5 py-3 font-semibold">Label</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">Confidence</th>
                      <th className="px-5 py-3 font-semibold">File</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.items.map((item) => (
                      <tr key={item.id} className="bg-white dark:bg-slate-900/60">
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                          {new Intl.DateTimeFormat("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(item.created_at))}
                        </td>
                        <td className="px-5 py-4">
                          <SpoofingBadge label={item.label} />
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">
                          {item.is_real ? "Real" : "Fake / Spoof"}
                        </td>
                        <td className="px-5 py-4 tabular-nums text-slate-700 dark:text-slate-300">
                          {Math.round(item.confidence * 100)}%
                        </td>
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                          {item.image_filename ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
