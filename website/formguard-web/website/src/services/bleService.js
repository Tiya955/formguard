// FormGuard ESP32 Bluetooth Low Energy (BLE) & Wi-Fi WebSocket Service

const NORDIC_UART_SERVICE = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const NORDIC_UART_TX = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
const NORDIC_UART_RX = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';

export class ESP32HardwareManager {
  constructor() {
    this.device = null;
    this.server = null;
    this.txChar = null;
    this.rxChar = null;
    this.socket = null;
    this.isConnected = false;
    this.connectionType = 'none'; // 'ble' | 'wifi' | 'simulated'
    this.onDataCallback = null;
    this.onStatusChangeCallback = null;
    this.simulatorTimer = null;
    this.simulatedPhase = 'standing';
    this.simAngle = 0;
    this.simValgus = 0;
    this.simTilt = 0;
    this.simRepCount = 0;
    this.simErrorMode = null; // 'valgus' | 'back' | 'fatigue'
    
    // Tracks the latest rep count from ESP32
    this.lastRepCount = 0; 
  }

  isBleSupported() {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  onData(callback) {
    this.onDataCallback = callback;
  }

  onStatusChange(callback) {
    this.onStatusChangeCallback = callback;
  }

  emitStatus(status, type, meta = {}) {
    this.isConnected = status;
    this.connectionType = type;
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback({ isConnected: status, type, ...meta });
    }
  }

  emitData(payload) {
    if (this.onDataCallback) {
      this.onDataCallback(payload);
    }
  }

  // Connect via Web Bluetooth API to ESP32
  async connectBLE() {
    if (!this.isBleSupported()) {
      throw new Error("Web Bluetooth is not supported in this browser. Please use Google Chrome or MS Edge on Desktop or Android.");
    }

    try {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'FormGuard' },
          { namePrefix: 'ESP32' },
        ],
        optionalServices: [NORDIC_UART_SERVICE]
      });

      this.device.addEventListener('gattserverdisconnected', () => {
        this.emitStatus(false, 'none');
      });

      this.server = await this.device.gatt.connect();
      const service = await this.server.getPrimaryService(NORDIC_UART_SERVICE);
      this.txChar = await service.getCharacteristic(NORDIC_UART_TX);
      
      try {
        this.rxChar = await service.getCharacteristic(NORDIC_UART_RX);
      } catch (e) {
        console.log("RX characteristic optional");
      }

      await this.txChar.startNotifications();
      this.txChar.addEventListener('characteristicvaluechanged', (event) => {
        const value = event.target.value;
        const decoder = new TextDecoder('utf-8');
        const rawString = decoder.decode(value);
        this.parseIncomingHardwareData(rawString);
      });

      this.emitStatus(true, 'ble', { deviceName: this.device.name || 'FormGuard ESP32' });
      return true;
    } catch (err) {
      console.error("BLE Connect failed:", err);
      this.emitStatus(false, 'none');
      throw err;
    }
  }

  // Connect via Wi-Fi WebSocket
  connectWiFi(wsUrl = 'ws://192.168.4.1:81') {
    return new Promise((resolve, reject) => {
      try {
        if (this.socket) {
          this.socket.close();
        }
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          this.emitStatus(true, 'wifi', { url: wsUrl });
          resolve(true);
        };

        this.socket.onmessage = (event) => {
          this.parseIncomingHardwareData(event.data);
        };

        this.socket.onerror = (err) => {
          console.warn("WebSocket error:", err);
          this.emitStatus(false, 'none');
          reject(err);
        };

        this.socket.onclose = () => {
          this.emitStatus(false, 'none');
        };
      } catch (e) {
        this.emitStatus(false, 'none');
        reject(e);
      }
    });
  }

  // Parse incoming text stream from ESP32
  parseIncomingHardwareData(raw) {
    try {
      const clean = raw.trim();
      
      // 1. Check if ESP32 is sending a Rep Count update
      if (clean.includes('REP_COUNT:')) {
        const repNum = parseInt(clean.replace('REP_COUNT:', '').trim());
        if (!isNaN(repNum)) {
          this.lastRepCount = repNum;
        }
        return; // Stop processing, this packet was just a rep count
      }

      // 2. Check if we received your ESP32's specific text format
      // Example: "thigh:45.2 | back:12.1 | flexion:8.2"
      if (clean.includes('thigh:') && clean.includes('back:')) {
        
        const parts = clean.split('|');
        let thigh = 0, back = 0, flexion = 0;

        parts.forEach(part => {
          if (part.includes('thigh:')) thigh = parseFloat(part.replace('thigh:', '').trim()) || 0;
          if (part.includes('back:')) back = parseFloat(part.replace('back:', '').trim()) || 0;
          if (part.includes('flexion:')) flexion = parseFloat(part.replace('flexion:', '').trim()) || 0;
        });

        this.emitData({
          angle: thigh,
          valgus: flexion, // Map flexion to valgus for the UI warnings
          tilt: back,
          rep: this.lastRepCount, // Use the saved rep count
          phase: 'live',
          fatigue: 0, 
          isValgusError: false, 
          isTiltError: false,
          timestamp: Date.now(),
        });
        return;
      }

      // Fallback for JSON or CSV (in case you use the simulator or old code)
      if (clean.startsWith('{') && clean.endsWith('}')) {
        const parsed = JSON.parse(clean);
        this.emitData({
          angle: Number(parsed.ang || parsed.angle || 0),
          valgus: Number(parsed.valg || parsed.valgus || 0),
          tilt: Number(parsed.tilt || 0),
          rep: Number(parsed.rep || 0),
          phase: parsed.phase || 'live',
          fatigue: Number(parsed.fatigue || 0),
          isValgusError: Boolean(parsed.valgus_err),
          isTiltError: Boolean(parsed.tilt_err),
          timestamp: Date.now(),
        });
      } else {
        const parts = clean.split(',').map(Number);
        if (parts.length >= 3 && !isNaN(parts[0])) {
          this.emitData({
            angle: parts[0] || 0,
            valgus: parts[1] || 0,
            tilt: parts[2] || 0,
            rep: parts[3] || this.lastRepCount,
            fatigue: parts[4] || 0,
            timestamp: Date.now(),
          });
        }
      }
    } catch (e) {
      console.warn("Telemetry parsing error:", e, raw);
    }
  }

  // Start Built-in Realistic Hardware Simulator
  startSimulator() {
    this.stopSimulator();
    this.emitStatus(true, 'simulated', { deviceName: 'ESP32 Virtual IMU (Simulator)' });

    let t = 0;
    this.simAngle = 0;
    this.simRepCount = 0;

    this.simulatorTimer = setInterval(() => {
      t += 0.1;
      const cycleTime = t % 4.0;
      let phase = 'standing';
      let angle = 5;
      let valgus = (Math.random() - 0.5) * 2;
      let tilt = 10 + (Math.random() - 0.5) * 2;

      if (cycleTime < 1.8) {
        phase = 'descending';
        const progress = cycleTime / 1.8;
        angle = 5 + progress * 85; 
        tilt = 10 + progress * 15;
      } else if (cycleTime < 2.3) {
        phase = 'bottom';
        angle = 90 + Math.sin(t * 10) * 1.5;
        tilt = 25;
      } else if (cycleTime < 3.8) {
        phase = 'ascending';
        const progress = (cycleTime - 2.3) / 1.5;
        angle = 90 - progress * 85;
        tilt = 25 - progress * 15;
      } else {
        phase = 'standing';
        angle = 5;
        tilt = 10;
        if (Math.abs(cycleTime - 3.8) < 0.11) {
          this.simRepCount += 1;
        }
      }

      if (this.simErrorMode === 'valgus' && (phase === 'descending' || phase === 'ascending')) {
        valgus = 14 + Math.random() * 4;
      }
      if (this.simErrorMode === 'back' && phase !== 'standing') {
        tilt = 42 + Math.random() * 5; 
      }

      const fatigueVal = Math.min(95, Math.floor((this.simRepCount / 20) * 80 + (this.simErrorMode === 'fatigue' ? 35 : 0)));

      this.emitData({
        angle: Math.max(0, Math.round(angle * 10) / 10),
        valgus: Math.round(valgus * 10) / 10,
        tilt: Math.round(tilt * 10) / 10,
        rep: this.simRepCount,
        phase,
        fatigue: fatigueVal,
        isValgusError: Math.abs(valgus) > 10,
        isTiltError: tilt > 35,
        timestamp: Date.now(),
      });
    }, 100); 
  }

  setSimErrorMode(mode) {
    this.simErrorMode = mode;
  }

  stopSimulator() {
    if (this.simulatorTimer) {
      clearInterval(this.simulatorTimer);
      this.simulatorTimer = null;
    }
  }

  disconnect() {
    this.stopSimulator();
    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    if (this.socket) {
      this.socket.close();
    }
    this.emitStatus(false, 'none');
  }
}

export const hardwareManager = new ESP32HardwareManager();