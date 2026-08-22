"use client";

import React, { useState } from "react";
import { X, KeyRound, Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { saveAccessCode, VALID_ACCESS_CODE } from "@/lib/storage";

interface AccessGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AccessGateModal: React.FC<AccessGateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === VALID_ACCESS_CODE) {
      saveAccessCode(password.trim());
      setError(false);
      onSuccess();
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cream-950/45 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-cream-300 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-cream-500 hover:text-cream-800 bg-cream-100 hover:bg-cream-200 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-sun-100 text-sun-700 border border-sun-300 mb-3.5 shadow-sm">
            <Lock size={24} />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-cream-950 font-normal tracking-tight mb-2">
            Dostęp do wersji testowej
          </h2>
          <p className="font-sans text-xs text-cream-600 max-w-xs mx-auto leading-relaxed">
            Aplikacja znajduje się obecnie w fazie zamkniętych testów. Wprowadź hasło robocze, aby odblokować rozmowy na żywo z modelem AI.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              placeholder="Wpisz hasło dostępu..."
              autoFocus
              className={`w-full bg-cream-50 border ${
                error ? "border-rose-400 focus:border-rose-500 ring-2 ring-rose-400/20" : "border-cream-300 focus:border-sun-400 focus:ring-2 focus:ring-sun-400/20"
              } rounded-2xl px-4 py-3 text-sm font-sans text-cream-950 focus:outline-none pr-11 transition-all`}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cream-500 hover:text-cream-800 p-1"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <p className="text-xs text-rose-600 font-sans text-center">
              Nieprawidłowe hasło dostępu. Spróbuj ponownie.
            </p>
          )}

          <button
            type="submit"
            disabled={!password.trim()}
            className="hearth-button w-full py-3.5 rounded-full font-sans font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-sun-500/20 disabled:opacity-50"
          >
            <span>Odblokuj i wejdź</span>
            <ArrowRight size={15} />
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-cream-200 text-center">
          <span className="text-[11px] text-cream-500 font-sans flex items-center justify-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>Zabezpieczenie przed nieautoryzowanym zużyciem API</span>
          </span>
        </div>
      </div>
    </div>
  );
};
