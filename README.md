# 📖 Quran & Islamic Companion App

A beautifully designed, feature-rich React Native (Expo) application providing Muslims with a seamless ad-free experience for reading the Quran, tracking daily prayers, reading Adkar (supplications), and managing their personal progress.

## ✨ Features

- **📖 Complete Holy Quran:**
  - Read by Surah or Juz.
  - Switch smoothly between immersive **Reading Mode** (Arabic text only) and **Translation Mode** (with detailed English translations).
  - Clean and easily readable typography tailored for long reading sessions.

- **🕋 Accurate Prayer Times & Live Countdown:**
  - Automatically fetches the location to deliver accurate daily prayer timings based on standardized calculation methods.
  - A real-time countdown to the next prayer prominently displayed on the Home screen.

- **📿 Adkar & Duas (Supplications):**
  - Dedicated sections for Morning and Evening Adkar.
  - Essential Qur'anic Duas easily accessible (e.g., Ayatul Kursi, Amana Rasul), which map directly to isolated Ayat reading views to preserve context.

- **📅 Islamic Features & Quick Actions:**
  - **Hijri Calendar Integration:** Displays the current Islamic date (auto-syncs daily).
  - **Ayat of the Day:** A curated verse on the main dashboard to keep the user inspired.
  - **Notifications Hub:** A dedicated center for welcoming users and tracking challenge milestones.
  - **Quick Actions:** Instant access to Qibla Finder, Bookmarks, and Zakat calculation.

- **🎨 Premium UI & Experience:**
  - **Custom Glassmorphic Alerts:** Replaced all native system alerts with a high-fidelity, themed `CustomAlert` component for a unified premium feel.
  - **Adaptive Feedback:** Color-coded visual cues (Red/Yellow/Green) for errors, warnings, and success states within the custom modal system.

- **📈 Profile & Goals Tracking:**
  - Gamified progression system tracking your "Quran Time", "Streaks", and "Verses Read" this week.
  - Set and manage Active Challenges (e.g., "Khatm in 30 Days").
  - **Customizable Avatar:** Upload your real life profile photo straight from your device using `expo-image-picker` or use generated avatar seeds, saved entirely locally via `AsyncStorage`.

## 🛠 Tech Stack

- **Framework:** React Native + [Expo](https://expo.dev/) (Expo Router for navigation).
- **Language:** TypeScript.
- **Styling:** NativeWind (Tailwind CSS for React Native).
- **Icons:** `lucide-react-native`.
- **Local Storage:** `@react-native-async-storage/async-storage` for persisting user settings, profile data, and bookmarks without needing a backend server.
- **Data & Calculations:** `adhan` for prayer times, `dayjs` for reliable date mutations.
- **Media:** `expo-image-picker` for profile photo handling.

## 🚀 Getting Started

### Prerequisites

- Node.js installed on your machine.
- iOS Simulator, Android Studio, or the Expo Go app on your physical device.

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd quran-app/client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npx expo start
   ```

4. Press `i` to open in iOS simulator, `a` for Android emulator, or scan the QR code with the Expo Go app on your physical iOS/Android device.

## 📱 Screenshots & UI

_This app focuses heavily on modern, minimalist dark UI principles with vibrant green (#10b981) accents, blurred overlays, rounded corners, large interactive typography, and card-based data tracking to ensure an aesthetic that acts as a tranquil companion tailored for spiritual focus._

## 🛡 Privacy & Transparency

- **Offline First:** Most spiritual reading aspects are available without constant connectivity.
- **Location:** Used uniquely for an initial fetch of Prayer Timings and Hijri conversion. 
- **Storage:** Account details, profile images, and progress records are stored locally on-device.

---

**Assalamu Alaikum!** May this application help you achieve consistency in your worship and Quranic journey. 
