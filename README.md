# 🚕 CNG Ride

![Status](https://img.shields.io/badge/status-live-brightgreen)
![Platform](https://img.shields.io/badge/platform-web%20%7C%20android-blue)
![Made with](https://img.shields.io/badge/made%20with-Flutter%20%7C%20Supabase-orange)

**Ride-hailing app for CNG auto-rickshaws in Tangail, Bangladesh** — with a Bengali-first UI designed for real drivers and riders.

🔗 **Live demo:** https://imran-3478.github.io/CNG-RIDE-/

---

## ✨ Features

- 🔑 **Phone number + PIN login** — no email needed, built for low-literacy users
- 📍 **Live tracking** — drivers and riders see each other in real time (Supabase Realtime)
- 💰 **Fare estimate** — ৳20/km, shown before booking
- 🟢 **Driver Available/Busy toggle** — one tap to go on/off duty
- 🧾 **Ride history** — full trip records for riders and drivers
- 👛 **Wallet with recharge** — drivers top up via bKash/Nagad requests
- 🗺️ **Google Maps navigation** — deep links straight into the Maps app
- 🛰️ **Satellite view** — toggle map/satellite on tracking screens

## 📱 Native App (Flutter)

A full Flutter version with:
- 🔔 **FCM push notifications** — drivers get instant ride-request alerts, even with the app closed
- 📡 **Background location** — live position updates every 15s while on duty
- 🤖 Built via **GitHub Actions** (no local machine needed)

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend (web) | HTML, CSS, JavaScript |
| Backend | Supabase (Auth, Postgres, Realtime, Edge Functions) |
| Native app | Flutter / Dart |
| Push notifications | Firebase Cloud Messaging (FCM) |
| CI / builds | GitHub Actions |
| Maps | Google Maps deep links, satellite tiles |

## 📸 Screenshots

> Screenshots coming soon — try the [live demo](https://imran-3478.github.io/CNG-RIDE-/) on your phone.

## 🚀 Run Locally

The web app is a static site — no build step needed:
