"use client";

import { useCallback, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { createClient } from "@/lib/supabase/client";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error("decode failed"));
    i.src = src;
  });
}

// Crop to a square and re-encode small + low quality.
async function cropToWebp(
  src: string,
  area: Area,
  size = 256,
  quality = 0.55
): Promise<Blob> {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, size, size);
  const blob = await new Promise<Blob | null>((res) =>
    canvas.toBlob(res, "image/webp", quality)
  );
  if (!blob) throw new Error("encode failed");
  return blob;
}

export function AvatarUploader({
  siteId,
  userId,
  value,
  isCustom,
  onChange,
}: {
  siteId: string;
  userId: string;
  value: string | null;
  isCustom: boolean;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onComplete = useCallback((_: Area, px: Area) => setArea(px), []);

  function pick(file: File) {
    setError(null);
    const fr = new FileReader();
    fr.onload = () => {
      setSrc(fr.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    fr.readAsDataURL(file);
  }

  async function confirm() {
    if (!src || !area) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await cropToWebp(src, area);
      const supabase = createClient();
      const path = `${userId}/${siteId}/avatar.webp`;
      const { error: upErr } = await supabase.storage
        .from("widget-assets")
        .upload(path, blob, {
          upsert: true,
          cacheControl: "3600",
          contentType: "image/webp",
        });
      if (upErr) {
        setError("Upload failed: " + upErr.message);
        setBusy(false);
        return;
      }
      const { data } = supabase.storage
        .from("widget-assets")
        .getPublicUrl(path);
      onChange(data.publicUrl + "?v=" + Date.now());
      setSrc(null);
    } catch {
      setError("Could not process that image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        title="Upload a custom avatar"
        className={
          "relative grid aspect-square place-items-center overflow-hidden rounded-lg border transition " +
          (isCustom
            ? "border-brand-500 ring-2 ring-brand-200"
            : "border-dashed border-slate-300 hover:border-brand-400 hover:bg-brand-50/40")
        }
      >
        {isCustom && value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Custom avatar" className="h-full w-full object-cover" />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="text-slate-400">
            <path d="M12 5v14M5 12h14" />
          </svg>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        aria-label="Upload avatar image"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])}
      />

      {src && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">
              Crop your avatar
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Drag to position, slide to zoom.
            </p>
            <div className="relative mt-4 h-64 overflow-hidden rounded-xl bg-slate-900">
              <Cropper
                image={src}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="rect"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onComplete}
              />
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="mt-4 w-full accent-brand-600"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setSrc(null)}
                disabled={busy}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={confirm}
                disabled={busy || !area}
                className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
              >
                {busy ? "Uploading..." : "Use photo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
