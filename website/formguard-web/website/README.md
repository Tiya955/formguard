# FormGuard | Smart Wearable Exercise Form & Joint Guardian

> Wearable dual-IMU motion sensors that actively check your joint trajectory and exercise form in real time, preventing chronic injuries before they happen.

---

## 👥 Project Team
- **Nandana Sudheesh** (25BCE2135) - *Biomedical Systems & Hardware Lead*
- **Anugraha S.** (25BCE2139) - *Firmware & IMU Signal Processing*
- **Hemakshi Chauhan** (25BCE2162) - *Biomechanics & Algorithm Design*
- **Lead Innovator** - *Full-Stack Web & IoT Integration*

---

## 🌟 Features Included

1. **Main Landing Showcase**:
   - Modern brand aesthetics based on the FormGuard presentation slides (Teal, Dark Slate, and Orange).
   - Core Biomechanics: Bad Form (knee valgus, spine rounding), Joint Compensation, and Neuromuscular Fatigue.
   - Interactive live virtual 0.96" SSD1306 OLED mirror.

2. **Authentication & Medical Onboarding**:
   - User sign-up & sign-in with fast demo access.
   - Profile inputs: Height (cm), Weight (kg), Automatic BMI calculation.
   - Prior injury / medical condition questionnaire (e.g., ACL recovery, patellofemoral syndrome, lumbar back issues).
   - Dynamic safety engine categorizing **Safe exercises for you** vs **Exercises to avoid/modify** with personalized angular thresholds.

3. **OLED Screen Dictionary & Biomechanics Guide**:
   - Interactive 0.96" SSD1306 OLED screen visualizer.
   - Explains what every abbreviation indicates (`CALIB`, `REP: XX`, `VALGUS / KNEE IN`, `BACK ROUND / TILT`, `FATIGUE: HI`, `ASYM`, `BAT%`, `SYNC`).
   - Detailed corrective posture cues and audio buzzer simulation using Web Audio API.

4. **Sensor Placement & 3-Rep Calibration Protocol**:
   - Placement instructions for squats: Sensor 1 on thigh (or back) and Sensor 2 on lower leg/shank.
   - Biomechanical breakdown of why the first 3 reps are calibrated (neutral standing zero tare, personal comfortable parallel depth, lateral knee tracking corridor).

5. **Interactive 3-Rep Calibration Page**:
   - "Start Calibration" button.
   - Visual 3-rep progress stepper with real-time angle recording, audio chimes, and confetti celebration upon baseline lock.

6. **Live Workout & Rep Tracking with Real-Time Graphs**:
   - 60fps rolling real-time chart displaying Knee Flexion Angle (°), Valgus Inward Deviation (°), and Lumbar Spine Tilt (°).
   - Live rep counter with movement phase detection (Standing, Descending, Bottom Hold, Ascending).
   - Real-time fatigue index meter and form score gauge.
   - Instant visual haptic alert banner and audio buzzer warning when knees cave in or back rounds.
   - Built-in realistic hardware simulator with test error injection triggers (Knee Valgus, Back Round, Fatigue).
   - "End Session" action with comprehensive completion review.

7. **Session Summary & History Dashboard**:
   - Save session with custom personal notes into persistent `localStorage`.
   - Longitudinal progress graphs with multi-time filters: **3-4 Days**, **1 Week**, **1 Month**, **6 Months**, **1 Year**, **All Time**.
   - Form score evolution and rep volume bar charts.
   - Export history records to CSV.

8. **ESP32 Firmware Hub**:
   - Complete Arduino C++ sketch (`FormGuard_ESP32.ino`) ready to flash.
   - Wiring pinout diagram for ESP32, dual MPU6050 sensors, and SSD1306 OLED.
   - Bluetooth Low Energy (Web Bluetooth API) and Wi-Fi WebSocket streaming support.

---

## 🚀 Running the Web App

The server is already running:
- **Local Browser**: [http://localhost:5173/](http://localhost:5173/)
- **Mobile Device on Local Network**: [http://172.16.138.10:5173/](http://172.16.138.10:5173/)

To restart anytime:
```bash
cd formguard-web
npm run dev -- --host
```
