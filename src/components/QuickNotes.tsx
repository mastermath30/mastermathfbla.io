"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StickyNote, X, Plus, Trash2, Pin, PinOff } from "lucide-react";
import { useTranslations } from "./LanguageProvider";

interface Note {
  id: string;
  content: string;
  color: string;
  pinned: boolean;
  createdAt: number;
}

// Color definitions (names will be translated in component)
const getNoteColors = (t: (key: string) => string) => [
  { bg: "bg-yellow-100 dark:bg-yellow-900/40", border: "border-yellow-300 dark:border-yellow-700", name: t("Yellow") },
  { bg: "bg-pink-100 dark:bg-pink-900/40", border: "border-pink-300 dark:border-pink-700", name: t("Pink") },
  { bg: "bg-blue-100 dark:bg-blue-900/40", border: "border-blue-300 dark:border-blue-700", name: t("Blue") },
  { bg: "bg-green-100 dark:bg-green-900/40", border: "border-green-300 dark:border-green-700", name: t("Green") },
  { bg: "bg-purple-100 dark:bg-purple-900/40", border: "border-purple-300 dark:border-purple-700", name: t("Purple") },
  { bg: "bg-orange-100 dark:bg-orange-900/40", border: "border-orange-300 dark:border-orange-700", name: t("Orange") },
];

export function QuickNotes() {
  const { t } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const noteColors = getNoteColors(t);

  // Load notes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("mathmaster-notes");
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load notes");
      }
    }
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem("mathmaster-notes", JSON.stringify(notes));
  }, [notes]);

  // Keyboard shortcut: Alt + N
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Separate effect for handling the custom event (no dependencies to avoid re-registering)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-quick-notes", handleOpen);
    return () => {
      window.removeEventListener("open-quick-notes", handleOpen);
    };
  }, []);

  const addNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      content: "",
      color: noteColors[selectedColor].bg,
      pinned: false,
      createdAt: Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveNote(newNote.id);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const updateNote = (id: string, content: string) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, content } : note))
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
    if (activeNote === id) setActiveNote(null);
  };

  const togglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, pinned: !note.pinned } : note))
    );
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.createdAt - a.createdAt;
  });

  const getColorClasses = (colorBg: string) => {
    const color = noteColors.find((c) => c.bg === colorBg);
    return color || noteColors[0];
  };

  return (
    <>
      {/* Notes Panel - No floating button, accessed via Tools Menu */}
      <AnimatePresence>
        {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-4 top-4 bottom-4 z-[101] w-[90%] max-w-md"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-yellow-400 to-amber-500">
                  <div className="flex items-center gap-2">
                    <StickyNote className="w-5 h-5 text-white" />
                    <span className="font-semibold text-white">{t("Quick Notes")}</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-white">
                      {notes.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded hover:bg-white/20 text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Add Note Bar */}
                <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                  {/* Color Picker */}
                  <div className="flex gap-1">
                    {noteColors.map((color, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedColor(i)}
                        className={`w-6 h-6 rounded-full ${color.bg} ${color.border} border-2 transition-transform ${
                          selectedColor === i ? "scale-110 ring-2 ring-offset-1 ring-slate-400" : ""
                        }`}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <button
                    onClick={addNote}
                    className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t("Add Note")}
                  </button>
                </div>

                {/* Notes List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {sortedNotes.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <StickyNote className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{t("No notes yet")}</p>
                      <p className="text-sm">{t('Click "Add Note" to get started')}</p>
                    </div>
                  ) : (
                    sortedNotes.map((note) => {
                      const colorClasses = getColorClasses(note.color);
                      return (
                        <motion.div
                          key={note.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={`${colorClasses.bg} ${colorClasses.border} border rounded-xl p-3 relative group`}
                        >
                          {/* Actions */}
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => togglePin(note.id)}
                              className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                              title={note.pinned ? t("Unpin") : t("Pin")}
                            >
                              {note.pinned ? (
                                <PinOff className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                              ) : (
                                <Pin className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                              )}
                            </button>
                            <button
                              onClick={() => deleteNote(note.id)}
                              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                              title={t("Delete")}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>

                          {/* Pin indicator */}
                          {note.pinned && (
                            <Pin className="absolute -top-1 -left-1 w-4 h-4 text-amber-600 dark:text-amber-400 rotate-45" />
                          )}

                          {/* Content */}
                          <textarea
                            ref={activeNote === note.id ? textareaRef : null}
                            value={note.content}
                            onChange={(e) => updateNote(note.id, e.target.value)}
                            placeholder={t("Write your note...")}
                            className="w-full bg-transparent border-none resize-none focus:outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 min-h-[60px]"
                            rows={3}
                          />

                          {/* Timestamp */}
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>

                {/* Footer hint */}
                <div className="p-2 text-center text-xs text-slate-500 border-t border-slate-200 dark:border-slate-700">
                  {t("Notes are saved automatically")} • Press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-xs">Esc</kbd> to close
                </div>
              </div>
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
