'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Download, X, Check, Moon, Loader2 } from 'lucide-react';
import { formatTime } from '@/lib/prayer-times';

interface ShareCardProps {
  cityName: string;
  country: string;
  iftarTime: Date | null;
  timezone: string;
  date?: Date;
}

export function ShareCard({
  cityName,
  country,
  iftarTime,
  timezone,
  date = new Date(),
}: ShareCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = iftarTime ? formatTime(iftarTime, timezone) : '--:--';
  const location = country ? `${cityName}, ${country}` : cityName;

  // Generate image using Canvas API directly (more reliable than html2canvas)
  const generateImage = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Set canvas size (2x for retina)
    const width = 600;
    const height = 400;
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#2D1B69');
    gradient.addColorStop(1, '#1A1A3E');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Moon icon (simple circle)
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.arc(width / 2 - 50, 60, 12, 0, Math.PI * 2);
    ctx.fill();

    // "Iftar Time" header
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '600 14px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('IFTAR TIME', width / 2 + 10, 65);

    // Location
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '400 16px Inter, system-ui, sans-serif';
    ctx.fillText(location, width / 2, 110);

    // Main time
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 72px "JetBrains Mono", monospace';
    ctx.fillText(formattedTime, width / 2, 200);

    // Date
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '400 16px Inter, system-ui, sans-serif';
    ctx.fillText(formattedDate, width / 2, 250);

    // Divider line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, 310);
    ctx.lineTo(width - 100, 310);
    ctx.stroke();

    // Branding
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '400 12px Inter, system-ui, sans-serif';
    ctx.fillText('iftartimer.vercel.app', width / 2, 350);

    return canvas;
  }, [location, formattedTime, formattedDate]);

  const handleDownload = useCallback(async () => {
    setIsGenerating(true);
    try {
      // Small delay to show loading state
      await new Promise((r) => setTimeout(r, 100));

      const canvas = generateImage();
      if (!canvas) {
        console.error('Failed to generate canvas');
        return;
      }

      const link = document.createElement('a');
      link.download = `iftar-time-${cityName.toLowerCase().replace(/\s+/g, '-')}-${date.toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [generateImage, cityName, date]);

  const handleShare = useCallback(async () => {
    setIsGenerating(true);
    try {
      const canvas = generateImage();
      if (!canvas) {
        console.error('Failed to generate canvas');
        return;
      }

      // Convert canvas to blob
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      );

      if (!blob) {
        console.error('Failed to create blob');
        return;
      }

      const file = new File([blob], 'iftar-time.png', { type: 'image/png' });

      // Try native share first (works on mobile)
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            title: `Iftar Time in ${location}`,
            text: `Today's iftar time in ${location} is ${formattedTime}`,
            files: [file],
          });
          return;
        } catch (err) {
          // User cancelled - that's okay
          if ((err as Error).name === 'AbortError') {
            return;
          }
        }
      }

      // Fallback: copy text to clipboard
      const text = `Today's iftar time in ${location} is ${formattedTime} (${formattedDate}) - iftartimer.vercel.app`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Share failed:', err);
      // Final fallback: just copy
      try {
        const text = `Today's iftar time in ${location} is ${formattedTime}`;
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        console.error('Clipboard failed too');
      }
    } finally {
      setIsGenerating(false);
    }
  }, [generateImage, location, formattedTime, formattedDate]);

  return (
    <>
      {/* Share Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full
                   bg-theme-accent/20 hover:bg-theme-accent/30
                   text-theme-text text-sm font-medium transition-colors"
      >
        <Share2 className="w-4 h-4" />
        <span>Share Today&apos;s Iftar</span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Share Today&apos;s Iftar Time
              </h3>

              {/* Preview Card */}
              <div
                className="rounded-xl overflow-hidden mb-6"
                style={{
                  background: 'linear-gradient(135deg, #2D1B69 0%, #1A1A3E 100%)',
                }}
              >
                <div className="p-6 text-center text-white">
                  {/* Header */}
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Moon className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm font-medium text-white/80 uppercase tracking-wider">
                      Iftar Time
                    </span>
                  </div>

                  {/* Location */}
                  <p className="text-white/70 text-sm mb-4">{location}</p>

                  {/* Time */}
                  <p className="text-5xl font-bold font-mono mb-2">{formattedTime}</p>

                  {/* Date */}
                  <p className="text-white/60 text-sm">{formattedDate}</p>

                  {/* Branding */}
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <p className="text-xs text-white/40">iftartimer.vercel.app</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4
                             bg-gray-100 dark:bg-gray-800 rounded-xl font-medium
                             text-gray-700 dark:text-gray-300 hover:bg-gray-200
                             dark:hover:bg-gray-700 transition-colors disabled:opacity-50
                             active:scale-95"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>Download</span>
                </button>

                <button
                  onClick={handleShare}
                  disabled={isGenerating}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4
                             bg-teal-600 text-white rounded-xl font-medium
                             hover:bg-teal-700 transition-colors disabled:opacity-50
                             active:scale-95"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
