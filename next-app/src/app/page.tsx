"use client";

import { useState, useRef, useCallback } from "react";

type AppState = "idle" | "loading" | "result" | "error";

// ============ Components ============

function DropZone({
  onFileSelect,
  disabled,
}: {
  onFileSelect: (file: File) => void;
  disabled: boolean;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) onFileSelect(file);
    },
    [disabled, onFileSelect]
  );

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); !disabled && setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
        transition-all duration-200 select-none
        ${isDragOver
          ? "border-primary bg-indigo-50 scale-[1.02]"
          : "border-slate-200 bg-white hover:border-primary hover:bg-slate-50"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <div className="text-5xl mb-4">📤</div>
      <p className="text-lg font-semibold text-slate-800">
        {isDragOver ? "Drop it!" : "Drag & drop your image here"}
      </p>
      <p className="text-sm text-slate-500 mt-1">or click to browse</p>
      <p className="text-xs text-slate-400 mt-3">JPG, PNG, WebP · Max 10MB</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
      />
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-14 h-14 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
      <p className="mt-4 text-slate-600 font-medium">Removing background...</p>
    </div>
  );
}

function ImagePreview({
  originalUrl,
  resultUrl,
  resultBlob,
}: {
  originalUrl: string;
  resultUrl: string;
  resultBlob: Blob;
}) {
  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = "result.png";
    a.click();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        {/* Original */}
        <div className="p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Original
          </p>
          <div className="bg-slate-100 rounded-xl overflow-hidden min-h-48 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={originalUrl}
              alt="Original"
              className="max-h-72 object-contain"
            />
          </div>
        </div>

        {/* Result */}
        <div className="p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Result
          </p>
          <div className="rounded-xl overflow-hidden min-h-48 flex items-center justify-center checkerboard">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resultUrl}
              alt="Result"
              className="max-h-72 object-contain"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 p-4 border-t border-slate-100">
        <button
          onClick={handleDownload}
          className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-xl transition-colors cursor-pointer"
        >
          ⬇️ Download PNG
        </button>
      </div>
    </div>
  );
}

function ErrorDisplay({
  message,
  onReset,
}: {
  message: string;
  onReset: () => void;
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
      <div className="text-4xl mb-3">⚠️</div>
      <p className="text-red-600 font-medium mb-4">{message}</p>
      <button
        onClick={onReset}
        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-6 rounded-xl transition-colors cursor-pointer"
      >
        🔄 Try Again
      </button>
    </div>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-lg z-50 animate-fade-in">
      {message}
    </div>
  );
}

// ============ Main Page ============

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [resultUrl, setResultUrl] = useState<string>("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [toastMsg, setToastMsg] = useState<string>("");

  const processFile = async (file: File) => {
    // Validate
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg("Unsupported file type. Please use JPG, PNG, or WebP.");
      setState("error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File too large. Max 10MB.");
      setState("error");
      return;
    }

    const original = URL.createObjectURL(file);
    setOriginalUrl(original);
    setState("loading");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/remove-bg", { method: "POST", body: formData });

      if (!res.ok) {
        let errMsg = "Something went wrong. Please try again.";
        try {
          const data = await res.json();
          errMsg = data.error || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultBlob(blob);
      setState("result");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Network error. Please check your connection.");
      setState("error");
    }
  };

  const handleReset = () => {
    setState("idle");
    setOriginalUrl("");
    setResultUrl("");
    setResultBlob(null);
    setErrorMsg("");
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 flex-1 flex flex-col">
      {/* Header */}
      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">🎯 BG Remover</h1>
        <p className="text-slate-500">
          Remove image backgrounds in one click — free, fast, no storage.
        </p>
      </header>

      {/* Main */}
      <main className="flex-1">
        {state === "idle" && (
          <DropZone onFileSelect={processFile} disabled={false} />
        )}

        {state === "loading" && <LoadingSpinner />}

        {state === "result" && originalUrl && resultUrl && resultBlob && (
          <ImagePreview
            originalUrl={originalUrl}
            resultUrl={resultUrl}
            resultBlob={resultBlob}
          />
        )}

        {state === "result" && (
          <div className="mt-4 text-center">
            <button
              onClick={handleReset}
              className="text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors cursor-pointer bg-transparent border-0"
            >
              🔄 Try another image
            </button>
          </div>
        )}

        {state === "error" && (
          <ErrorDisplay message={errorMsg} onReset={handleReset} />
        )}
      </main>

      {/* Footer */}
      <footer className="text-center mt-12 pt-6 border-t border-slate-200">
        <p className="text-slate-400 text-sm">
          Powered by{" "}
          <a
            href="https://www.remove.bg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Remove.bg
          </a>{" "}
          + Cloudflare Workers
        </p>
      </footer>

      {/* Toast */}
      {toastMsg && <Toast message={toastMsg} />}
    </div>
  );
}
