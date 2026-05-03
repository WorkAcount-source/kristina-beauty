"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Accessibility,
  X,
  Type,
  Contrast,
  Link2,
  Heading,
  Pause,
  MousePointer2,
  Droplet,
  RotateCcw,
  AlignJustify,
  Image as ImageIcon,
  Volume2,
} from "lucide-react";

const STORAGE_KEY = "a11y-prefs-v1";

type Prefs = {
  fontSize: number;        // 0..4   (0 = default, each step +12.5%)
  letterSpacing: number;   // 0..3
  lineHeight: number;      // 0..3
  contrast: "" | "high" | "dark" | "light" | "monochrome";
  highlightLinks: boolean;
  highlightHeadings: boolean;
  readableFont: boolean;
  stopAnimations: boolean;
  bigCursor: boolean;
  hideImages: boolean;
  textAlign: "" | "right" | "center" | "left" | "justify";
  saturation: "" | "high" | "low";
};

const DEFAULTS: Prefs = {
  fontSize: 0,
  letterSpacing: 0,
  lineHeight: 0,
  contrast: "",
  highlightLinks: false,
  highlightHeadings: false,
  readableFont: false,
  stopAnimations: false,
  bigCursor: false,
  hideImages: false,
  textAlign: "",
  saturation: "",
};

function applyToDom(p: Prefs) {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  el.dataset.a11yFontSize = String(p.fontSize);
  el.dataset.a11yLetterSpacing = String(p.letterSpacing);
  el.dataset.a11yLineHeight = String(p.lineHeight);
  el.dataset.a11yContrast = p.contrast;
  el.dataset.a11yHighlightLinks = p.highlightLinks ? "1" : "";
  el.dataset.a11yHighlightHeadings = p.highlightHeadings ? "1" : "";
  el.dataset.a11yReadableFont = p.readableFont ? "1" : "";
  el.dataset.a11yStopAnimations = p.stopAnimations ? "1" : "";
  el.dataset.a11yBigCursor = p.bigCursor ? "1" : "";
  el.dataset.a11yHideImages = p.hideImages ? "1" : "";
  el.dataset.a11yTextAlign = p.textAlign;
  el.dataset.a11ySaturation = p.saturation;
}

function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

function savePrefs(p: Prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function AccessibilityWidget() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const p = loadPrefs();
    setPrefs(p);
    applyToDom(p);
    setMounted(true);
  }, []);

  useEffect(() => {
    applyToDom(prefs);
    savePrefs(prefs);
  }, [prefs]);

  // Close on Escape, focus trap basics
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    // focus the panel heading
    const t = setTimeout(() => panelRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open]);

  const update = useCallback(<K extends keyof Prefs>(k: K, v: Prefs[K]) => {
    setPrefs((p) => ({ ...p, [k]: v }));
  }, []);

  const reset = useCallback(() => setPrefs(DEFAULTS), []);

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Floating trigger */}
      <button
        ref={triggerRef}
        type="button"
        aria-label="פתח תפריט נגישות"
        aria-expanded={open}
        aria-controls="a11y-panel"
        onClick={() => setOpen((o) => !o)}
        className="fixed z-[60] bottom-4 left-4 size-14 rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/40 flex items-center justify-center hover:bg-rose-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-300 transition-colors"
      >
        <Accessibility className="size-7" aria-hidden="true" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[59] bg-black/30 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        id="a11y-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="a11y-title"
        hidden={!open}
        className="fixed z-[60] bottom-20 left-4 right-4 sm:right-auto sm:w-[22rem] max-h-[80vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-rose-100 p-5"
      >
        <div className="flex items-start justify-between mb-4">
          <h2
            id="a11y-title"
            data-autofocus
            tabIndex={-1}
            className="font-display text-xl font-bold flex items-center gap-2 outline-none"
          >
            <Accessibility className="size-5 text-rose-600" aria-hidden="true" />
            תפריט נגישות
          </h2>
          <button
            type="button"
            onClick={() => { setOpen(false); triggerRef.current?.focus(); }}
            aria-label="סגור תפריט נגישות"
            className="p-1 rounded-md hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          ההגדרות נשמרות במכשיר זה ויחולו בכל הביקורים הבאים.
        </p>

        {/* Text size */}
        <Group label="גודל טקסט" icon={<Type className="size-4" />}>
          <Stepper
            label="גודל טקסט"
            value={prefs.fontSize}
            min={0}
            max={4}
            onChange={(v) => update("fontSize", v)}
            display={`${100 + prefs.fontSize * 12.5}%`}
          />
        </Group>

        <Group label="רווח בין אותיות" icon={<AlignJustify className="size-4" />}>
          <Stepper
            label="רווח בין אותיות"
            value={prefs.letterSpacing}
            min={0}
            max={3}
            onChange={(v) => update("letterSpacing", v)}
            display={prefs.letterSpacing === 0 ? "רגיל" : `+${prefs.letterSpacing}`}
          />
        </Group>

        <Group label="מרווח שורות" icon={<AlignJustify className="size-4" />}>
          <Stepper
            label="מרווח שורות"
            value={prefs.lineHeight}
            min={0}
            max={3}
            onChange={(v) => update("lineHeight", v)}
            display={prefs.lineHeight === 0 ? "רגיל" : `+${prefs.lineHeight}`}
          />
        </Group>

        {/* Contrast */}
        <Group label="ניגודיות וצבע" icon={<Contrast className="size-4" />}>
          <ChoiceRow
            label="ניגודיות"
            options={[
              { v: "", l: "רגיל" },
              { v: "high", l: "גבוהה" },
              { v: "dark", l: "כהה" },
              { v: "light", l: "בהיר" },
              { v: "monochrome", l: "מונוכרום" },
            ]}
            value={prefs.contrast}
            onChange={(v) => update("contrast", v as Prefs["contrast"])}
          />
          <ChoiceRow
            label="רוויית צבע"
            options={[
              { v: "", l: "רגיל" },
              { v: "high", l: "גבוהה" },
              { v: "low", l: "נמוכה" },
            ]}
            value={prefs.saturation}
            onChange={(v) => update("saturation", v as Prefs["saturation"])}
          />
        </Group>

        <Group label="הדגשות" icon={<Link2 className="size-4" />}>
          <ToggleRow
            label="הדגשת קישורים"
            checked={prefs.highlightLinks}
            onChange={(v) => update("highlightLinks", v)}
            icon={<Link2 className="size-4" />}
          />
          <ToggleRow
            label="הדגשת כותרות"
            checked={prefs.highlightHeadings}
            onChange={(v) => update("highlightHeadings", v)}
            icon={<Heading className="size-4" />}
          />
        </Group>

        <Group label="קריאות" icon={<Type className="size-4" />}>
          <ToggleRow
            label="גופן קריא"
            checked={prefs.readableFont}
            onChange={(v) => update("readableFont", v)}
            icon={<Type className="size-4" />}
          />
          <ChoiceRow
            label="יישור טקסט"
            options={[
              { v: "", l: "רגיל" },
              { v: "right", l: "ימין" },
              { v: "center", l: "מרכז" },
              { v: "left", l: "שמאל" },
              { v: "justify", l: "מלא" },
            ]}
            value={prefs.textAlign}
            onChange={(v) => update("textAlign", v as Prefs["textAlign"])}
          />
        </Group>

        <Group label="תנועה ומדיה" icon={<Pause className="size-4" />}>
          <ToggleRow
            label="עצירת אנימציות"
            checked={prefs.stopAnimations}
            onChange={(v) => update("stopAnimations", v)}
            icon={<Pause className="size-4" />}
          />
          <ToggleRow
            label="הסתרת תמונות"
            checked={prefs.hideImages}
            onChange={(v) => update("hideImages", v)}
            icon={<ImageIcon className="size-4" />}
          />
          <ToggleRow
            label="סמן מוגדל"
            checked={prefs.bigCursor}
            onChange={(v) => update("bigCursor", v)}
            icon={<MousePointer2 className="size-4" />}
          />
        </Group>

        <div className="mt-5 flex flex-col gap-2 pt-4 border-t border-rose-100">
          <button
            type="button"
            onClick={reset}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-rose-50 text-rose-700 font-medium hover:bg-rose-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            איפוס כל ההגדרות
          </button>
          <a
            href="/accessibility"
            className="w-full text-center text-sm text-rose-700 underline hover:text-rose-800 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 rounded"
          >
            הצהרת הנגישות המלאה
          </a>
        </div>
      </div>
    </>,
    document.body
  );
}

/* ---------- helpers ---------- */

function Group({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="mb-4">
      <legend className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
        <span aria-hidden="true">{icon}</span>
        {label}
      </legend>
      <div className="space-y-1.5">{children}</div>
    </fieldset>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
  icon,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${
        checked
          ? "bg-rose-600 text-white border-rose-600"
          : "bg-white text-foreground border-rose-100 hover:bg-rose-50"
      }`}
    >
      <span className="flex items-center gap-2">
        {icon ? <span aria-hidden="true">{icon}</span> : null}
        {label}
      </span>
      <span aria-hidden="true" className="text-xs">
        {checked ? "פעיל" : "כבוי"}
      </span>
    </button>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  display: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-rose-100 bg-white">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={`הקטן ${label}`}
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="size-8 rounded-md border border-rose-100 hover:bg-rose-50 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        >
          −
        </button>
        <span className="min-w-[3rem] text-center text-xs tabular-nums" aria-live="polite">
          {display}
        </span>
        <button
          type="button"
          aria-label={`הגדל ${label}`}
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="size-8 rounded-md border border-rose-100 hover:bg-rose-50 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        >
          +
        </button>
      </div>
    </div>
  );
}

function ChoiceRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { v: string; l: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="px-3 py-2 rounded-lg border border-rose-100 bg-white">
      <div className="text-xs text-muted-foreground mb-1.5">{label}</div>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button
            key={o.v}
            type="button"
            role="radio"
            aria-checked={value === o.v}
            onClick={() => onChange(o.v)}
            className={`px-2.5 py-1 rounded-md text-xs border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${
              value === o.v
                ? "bg-rose-600 text-white border-rose-600"
                : "bg-white border-rose-100 hover:bg-rose-50"
            }`}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

// silence unused import eslint
void Volume2;
void Droplet;
