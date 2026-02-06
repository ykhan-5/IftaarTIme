'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Download, X, Check, Moon } from 'lucide-react';
import html2canvas from 'html2canvas';
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
  const cardRef = useRef<HTMLDivElement>(null);

  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = iftarTime ? formatTime(iftarTime, timezone) : '--:--';
  const location = country ? `${cityName}, ${country}` : cityName;

  const generateImage = async () => {
    if (!cardRef.current) return null;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2, // Higher resolution
        logging: false,
      });
      return canvas;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const canvas = await generateImage();
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `iftar-time-${cityName.toLowerCase()}-${date.toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleShare = async () => {
    const canvas = await generateImage();
    if (!canvas) return;

    // Convert canvas to blob
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png')
    );

    if (!blob) return;

    const file = new File([blob], 'iftar-time.png', { type: 'image/png' });

    // Try native share first
    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: `Iftar Time in ${location}`,
          text: `Today's iftar time in ${location} is ${formattedTime}`,
          files: [file],
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fall back to download
        if ((err as Error).name !== 'AbortError') {
          handleDownload();
        }
      }
    } else {
      // Fallback: copy text to clipboard
      const text = `Today's iftar time in ${location} is ${formattedTime} (${formattedDate})`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Share Today&apos;s Iftar Time
              </h3>

              {/* Preview Card */}
              <div
                ref={cardRef}
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
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4
                             bg-gray-100 dark:bg-gray-800 rounded-xl font-medium
                             text-gray-700 dark:text-gray-300 hover:bg-gray-200
                             dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShare}
                  disabled={isGenerating}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4
                             bg-theme-accent text-white rounded-xl font-medium
                             hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {copied ? (
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
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
