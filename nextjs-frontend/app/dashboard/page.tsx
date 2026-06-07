"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Clock3, History, Loader2, ScanFace, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { AppHeader } from "@/components/AppHeader";
import { SpoofingBadge } from "@/components/SpoofingBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getHistory } from "@/lib/api";

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-history"],
    queryFn: getHistory,
  });

  const summary = useMemo(() => {
    const items = data?.items ?? [];
    const total = items.length;
    const realCount = items.filter((item) => item.is_real).length;
    const spoofCount = total - realCount;
    const latest = items[0];

    return {
      total,
      realCount,
      spoofCount,
      latest,
    };
  }, [data]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-950 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
      <AppHeader />
      <section className="border-b border-slate-200/80 bg-white/70 dark:border-slate-800/80 dark:bg-slate-950/40">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
              Account Dashboard
            </div>
            <h1 className="text-3xl font-semibold text-slate-950 dark:text-slate-100">
              Ringkasan Aktivitas Verifikasi
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Halaman terlindungi ini merangkum hasil scan milik akun yang sedang login.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline" className="h-11 rounded-xl">
              <Link href="/history">
                <History className="h-4 w-4" />
                Lihat History
              </Link>
            </Button>
            <Button asChild className="h-11 rounded-xl bg-slate-950 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white">
              <Link href="/scan">
                <ScanFace className="h-4 w-4" />
                Scan Baru
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {isLoading ? (
          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/75">
            <CardContent className="flex items-center justify-center gap-3 p-10 text-sm text-slate-600 dark:text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              Memuat ringkasan dashboard...
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="rounded-2xl border-rose-200 bg-white shadow-sm dark:border-rose-900/50 dark:bg-slate-900/75">
            <CardContent className="p-6 text-sm text-rose-700 dark:text-rose-300">
              Tidak dapat memuat dashboard akun. Login ulang lalu coba kembali.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="grid gap-4 sm:grid-cols-3">
              <SummaryCard
                title="Total Scan"
                value={summary.total.toString()}
                description="Scan yang tersimpan saat akun aktif."
              />
              <SummaryCard
                title="Real Person"
                value={summary.realCount.toString()}
                description="Jumlah hasil yang berakhir sebagai wajah asli."
              />
              <SummaryCard
                title="Fake / Spoof"
                value={summary.spoofCount.toString()}
                description="Jumlah hasil yang mengarah ke indikasi spoofing."
              />
            </div>

            <Card className="rounded-2xl border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/75">
              <CardHeader className="border-b border-slate-200 dark:border-slate-800">
                <CardTitle className="text-lg text-slate-950 dark:text-slate-100">
                  Prediksi Terakhir
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {summary.latest ? (
                  <div className="space-y-4">
                    <SpoofingBadge label={summary.latest.label} />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {summary.latest.is_real
                        ? "Wajah terverifikasi sebagai orang asli."
                        : "Terdeteksi indikasi spoofing pada scan terakhir."}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Clock3 className="h-4 w-4" />
                      {new Intl.DateTimeFormat("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(summary.latest.created_at))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                    <div className="inline-flex rounded-full bg-emerald-50 p-3 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <p>Belum ada history scan pada akun ini.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/75">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold text-slate-950 dark:text-slate-100">
          {value}
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
