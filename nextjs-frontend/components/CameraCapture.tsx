"use client";

import { Camera, ImageUp, Loader2, RotateCcw, ShieldCheck } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CameraCaptureProps = {
  onImageReady: (file: File, source: "camera" | "upload") => Promise<void> | void;
  loading?: boolean;
};

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_UPLOAD_SIZE_BYTES = 8 * 1024 * 1024;
const CAMERA_CAPTURE_CROP_RATIO = 0.85;

export function CameraCapture({ onImageReady, loading = false }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const handleCapture = useCallback(async () => {
    if (loading) {
      return;
    }

    const video = webcamRef.current?.video;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setCameraError("Kamera belum siap. Gunakan upload gambar jika izin kamera ditolak.");
      return;
    }

    setUploadError(null);
    try {
      const blob = await captureCroppedFrame(video, CAMERA_CAPTURE_CROP_RATIO);
      const file = new File([blob], `capture-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      await onImageReady(file, "camera");
    } catch (error) {
      setCameraError(
        error instanceof Error
          ? error.message
          : "Tidak dapat mengambil gambar dari kamera.",
      );
    }
  }, [loading, onImageReady]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || loading) {
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setUploadError("Format file tidak didukung. Gunakan JPG, PNG, atau WebP.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setUploadError("Ukuran gambar terlalu besar. Gunakan gambar yang lebih kecil.");
      event.target.value = "";
      return;
    }
    setUploadError(null);
    await onImageReady(file, "upload");
    event.target.value = "";
  };

  return (
    <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/75">
      <CardHeader className="border-b border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl text-slate-950 dark:text-slate-100">
              Scan Wajah
            </CardTitle>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Ambil foto langsung dari kamera atau upload gambar wajah untuk dianalisis.
            </p>
          </div>
          <ShieldCheck className="hidden h-8 w-8 text-emerald-600 dark:text-emerald-300 sm:block" />
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-inner dark:border-slate-800">
          {cameraError ? (
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 p-6 text-center text-sm text-slate-200">
              <Camera className="h-8 w-8 text-slate-400" />
              <span>{cameraError}</span>
            </div>
          ) : (
            <>
              {!cameraReady && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-950 text-sm text-slate-300">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Menyiapkan kamera...</span>
                </div>
              )}
              <Webcam
                ref={webcamRef}
                audio={false}
                mirrored
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "user" }}
                onUserMedia={() => setCameraReady(true)}
                onUserMediaError={() => {
                  setCameraReady(false);
                  setCameraError("Kamera tidak tersedia atau izin kamera ditolak.");
                }}
                className="aspect-[4/3] w-full object-cover"
              />
            </>
          )}
        </div>

        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
          <p>
            Posisikan wajah cukup dekat dan berada di tengah frame untuk hasil yang
            lebih stabil.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Kamera menggunakan mode slight zoom untuk menjaga wajah tetap proporsional.
          </p>
        </div>

        {uploadError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-200">
            {uploadError}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            onClick={handleCapture}
            disabled={loading || Boolean(cameraError)}
            aria-label="Scan wajah dari kamera"
            className="h-12 gap-2 rounded-xl bg-slate-950 text-white shadow-sm hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            {loading ? "Menganalisis..." : "Scan Sekarang"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            aria-label="Upload gambar wajah"
            className="h-12 gap-2 rounded-xl border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageUp className="h-4 w-4" />}
            {loading ? "Menganalisis..." : "Upload Gambar"}
          </Button>
        </div>

        {cameraError && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setCameraReady(false);
              setCameraError(null);
            }}
            className="w-full gap-2 rounded-xl text-slate-700 dark:text-slate-300"
          >
            <RotateCcw className="h-4 w-4" />
            Coba Kamera Lagi
          </Button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleUpload}
        />
      </CardContent>
    </Card>
  );
}

async function captureCroppedFrame(
  video: HTMLVideoElement,
  cropRatio = CAMERA_CAPTURE_CROP_RATIO,
): Promise<Blob> {
  const safeCropRatio = Math.min(1, Math.max(0.8, cropRatio));
  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;
  const cropWidth = videoWidth * safeCropRatio;
  const cropHeight = videoHeight * safeCropRatio;
  const sourceX = (videoWidth - cropWidth) / 2;
  const sourceY = (videoHeight - cropHeight) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = videoWidth;
  canvas.height = videoHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Tidak dapat menyiapkan frame kamera. Coba ulangi beberapa saat lagi.");
  }

  context.drawImage(
    video,
    sourceX,
    sourceY,
    cropWidth,
    cropHeight,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Tidak dapat mengambil gambar dari kamera."));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      0.92,
    );
  });
}
