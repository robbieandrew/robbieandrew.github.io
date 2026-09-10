import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, FileText, ExternalLink } from 'lucide-react';
import {
  EASINGS,
  interactiveHover,
  interactiveTap,
} from '../constants/motionConfig';

export default function ChangelogModal({ isOpen, onClose }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    fetch('/webupdates.json')
      .then((res) => {
        if (!res.ok) throw new Error('Network response not ok');
        return res.text();
      })
      .then((text) => {
        const lines = text.trim().split('\n').filter(Boolean);
        const parsed = lines
          .map((l) => {
            try {
              return JSON.parse(l);
            } catch (e) {
              return null;
            }
          })
          .filter(Boolean)
          .reverse()
          .slice(0, 20); // Top 20 most recent
        setUpdates(parsed);
        setLoading(false);
      })
      .catch(() => {
        // Fallback sample data if webupdates.json not reachable
        setUpdates([
          {
            timestamp: '2026-09-05T07:14:04+02:00',
            event: 'Files updated',
            folder: 'carsales',
            files: ['carsales/data/all_carsales_monthly.csv'],
            URL: 'https://robbieandrew.github.io/carsales',
          },
          {
            timestamp: '2026-09-05T07:13:52+02:00',
            event: 'Files updated',
            folder: 'carsales',
            files: ['carsales/img/finlandincludingused_carsales_monthly.svg'],
            URL: 'https://robbieandrew.github.io/carsales',
          },
          {
            timestamp: '2026-09-05T07:08:46+02:00',
            event: 'Files updated',
            folder: 'country',
            files: ['country/img/USA/us_gasoline_price.svg'],
            URL: 'https://robbieandrew.github.io/country',
          },
        ]);
        setLoading(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASINGS.gentleDeceleration }}
          onClick={onClose}
          className="fixed inset-0 bg-[#11181c]/40 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.35, ease: EASINGS.materialEntrance }}
          className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-[#ffffff] rounded-[12px] border border-[#e6e8eb] soft-card-shadow overflow-hidden z-10"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#f0f1f3] flex items-center justify-between bg-[#f8f9fa]">
            <div>
              <span className="text-xs font-semibold text-[#0066FF] uppercase tracking-wider">
                Automated Pipeline Log
              </span>
              <h2 className="text-lg font-bold text-[#11181c] mt-0.5">
                Recent Portal Updates
              </h2>
            </div>
            <motion.button
              onClick={onClose}
              whileHover={interactiveHover}
              whileTap={interactiveTap}
              className="p-1.5 rounded-[8px] text-[#687076] hover:text-[#11181c] hover:bg-[#ffffff] border border-transparent hover:border-[#e6e8eb] transition-colors cursor-pointer"
            >
              <X size={18} />
            </motion.button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loading ? (
              <div className="py-12 text-center text-xs text-[#687076]">
                One moment… loading changelog feed
              </div>
            ) : updates.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#687076]">
                No recent updates found.
              </div>
            ) : (
              updates.map((item, idx) => {
                const dateStr = item.timestamp
                  ? new Date(item.timestamp).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Recent';

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-[8px] bg-[#f8f9fa] border border-[#f0f1f3] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-[#687076]">
                        <Calendar size={12} />
                        <span>{dateStr}</span>
                        {item.folder && (
                          <span className="px-1.5 py-0.5 rounded-[4px] bg-[#e6e8eb] text-[11px] font-medium text-[#11181c]">
                            {item.folder}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#11181c] font-medium">
                        <FileText size={13} className="text-[#0066FF]" />
                        <span>
                          {item.files && item.files.length > 0
                            ? item.files[0].split('/').pop()
                            : item.event}
                        </span>
                      </div>
                    </div>
                    {item.URL && (
                      <motion.a
                        href={item.URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={interactiveHover}
                        whileTap={interactiveTap}
                        className="self-start sm:self-center inline-flex items-center gap-1 text-xs font-semibold text-[#0066FF] hover:underline"
                      >
                        <span>View</span>
                        <ExternalLink size={12} />
                      </motion.a>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-[#f8f9fa] border-t border-[#f0f1f3] text-right">
            <motion.button
              onClick={onClose}
              whileHover={interactiveHover}
              whileTap={interactiveTap}
              className="px-4 py-1.5 text-xs font-medium text-[#687076] hover:text-[#11181c] rounded-[8px] bg-[#ffffff] border border-[#e6e8eb] transition-colors cursor-pointer"
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
