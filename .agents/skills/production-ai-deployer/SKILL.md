---
name: production-ai-deployer
description: >-
  Deploy, monitor, scale, and secure production AI applications and microservices.
  Activate when configuring production builds, Docker containers, Vercel deployments,
  Supabase/PostgreSQL setups, Stripe subscription billing, Redis background queues,
  or setting up automated CI/CD workflows.
---

# Production AI Deployer (Wdrażanie Produkcyjne & Skalowanie)

Procedury wdrożeniowe, provisioning infrastruktury i konfiguracja środowisk produkcyjnych.

## 1. Architektura Produkcyjna (Production Topology)

* **Hosting & Edge**: Vercel / Cloudflare dla frontendu Next.js i Edge Functions.
* **Baza Danych & Pamięć Wektorowa**: Supabase (PostgreSQL + rozszerzenie `pgvector`).
* **Zadania Asynchroniczne & Kolejki Proaktywne**: Upstash Redis (QStash) do wyzwalania porannych i wieczornych wiadomości od Przyjaciela.
* **Płatności & Subskrypcje**: Stripe Billing (Webhooks + Checkout Session dla planów 19 zł i 39 zł/mc).

---

## 2. Lista Kontrolna Przed Wdrożeniem (Pre-Deployment Checklist)

- [ ] `npm run build` przechodzi w 100% bez ostrzeżeń TypeScript.
- [ ] Wszystkie zmienne środowiskowe (`.env.local` / `.env.production`) są zdefiniowane i zabezpieczone.
- [ ] Webhooki Stripe mają włączoną weryfikację sygnatur (`stripe-signature`).
- [ ] Wyłączono logowanie wrażliwych danych użytkownika w konsoli produkcyjnej.
- [ ] Skonfigurowano rekordy DNS dla domeny `dobryprzyjaciel.pl` (A / CNAME / SSL).
