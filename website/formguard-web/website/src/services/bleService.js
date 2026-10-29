
const NORDIC_UART_SERVICE = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const NORDIC_UART_TX = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; // device -> phone (notify)
const NORDIC_UART_RX = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // phone -> device (write)
 
export class ESP32HardwareManager {
  constructor() {
    this.device = null;
    this.writeChar = null;
    this.notifyChar = null;
    this.isConnected = false;
    this.onDataCallback = null;
    this.onStatusChangeCallback = null;
    this.buffer = '';
    this.simTimer = null;
    this.handleNotification = this.handleNotification.bind(this);
  }
 
  onData(cb) { this.onDataCallback = cb; }
  onStatusChange(cb) { this.onStatusChangeCallback = cb; }
 
  emitData(payload) {
    if (typeof this.onDataCallback === 'function') this.onDataCallback(payload);
  }
 
  emitStatus(status, type, deviceName = '') {
    this.isConnected = status;
    if (typeof this.onStatusChangeCallback === 'function') {
      this.onStatusChangeCallback({ isConnected: status, type, deviceName });
    }
  }
 
  // Collect chunks and only parse complete lines (ending in \n)
  handleNotification(event) {
    const chunk = new TextDecoder('utf-8').decode(event.target.value);
    console.log('📡 CHUNK:', JSON.stringify(chunk));
    this.buffer += chunk;
 
    let idx;
    while ((idx = this.buffer.indexOf('\n')) !== -1) {
      const line = this.buffer.slice(0, idx).trim();
      this.buffer = this.buffer.slice(idx + 1);
      if (line) this.parseLine(line);
    }
  }
 
  parseLine(line) {
    console.log('📨 LINE:', line);
 
    const repMatch = line.match(/^CALIB_REP:(\d+)/);
    if (repMatch) {
      this.emitData({ calibRep: parseInt(repMatch[1], 10) });
      return;
    }
 
    if (line.startsWith('CALIB_DONE')) {
      this.emitData({ calibDone: true });
      return;
    }
 
    if (line.startsWith('{')) {
      try {
        this.emitData({ repData: JSON.parse(line) });
      } catch (e) {
        console.error('Bad JSON from ESP32:', line, e);
      }
      return;
    }
 
    if (line.startsWith('ACK:')) {
      console.log('✅ ESP32 acknowledged:', line);
      this.emitData({ ack: line.slice(4) });
    }
  }
 
  async connectBLE() {
    try {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'FormGuard' }, { namePrefix: 'ESP32' }],
        optionalServices: [NORDIC_UART_SERVICE],
      });
 
      this.device.addEventListener('gattserverdisconnected', () => {
        this.writeChar = null;
        this.notifyChar = null;
        this.buffer = '';
        this.emitStatus(false, 'none');
      });
 
      const server = await this.device.gatt.connect();
      const service = await server.getPrimaryService(NORDIC_UART_SERVICE);
 
      this.writeChar = await service.getCharacteristic(NORDIC_UART_RX);
      this.notifyChar = await service.getCharacteristic(NORDIC_UART_TX);
 
      await this.notifyChar.startNotifications();
      this.notifyChar.addEventListener('characteristicvaluechanged', this.handleNotification);
      console.log('🔗 BLE connected, notifications started');
 
      this.emitStatus(true, 'ble', this.device.name || 'ESP32');
      return true;
    } catch (err) {
      console.error('BLE Connect failed:', err);
      this.emitStatus(false, 'none');
      throw err;
    }
  }
 
  async sendCommand(command) {
    if (!this.writeChar) {
      console.error('❌ Not connected, cannot send:', command);
      return;
    }
    try {
      const data = new TextEncoder().encode(command + '\n');
      if (this.writeChar.properties.writeWithoutResponse) {
        await this.writeChar.writeValueWithoutResponse(data);
      } else {
        await this.writeChar.writeValue(data);
      }
      console.log('✅ SENT:', command);
    } catch (e) {
      console.error('❌ SEND FAILED:', e);
    }
  }
 
  // ---------- Fake ESP32 for testing the website without hardware ----------
  // Run in console:  hardwareManager.startSimulation('calib')  or  ('workout')
  startSimulation(mode = 'calib') {
    this.stopSimulation();
    let n = 0;
    if (mode === 'calib') {
      this.simTimer = setInterval(() => {
        n++;
        this.parseLine(`CALIB_REP:${n}`);
        if (n >= 3) {
          this.parseLine('CALIB_DONE');
          this.stopSimulation();
        }
      }, 1500);
    } else {
      this.simTimer = setInterval(() => {
        n++;
        const bad = n % 4 === 0;
        this.parseLine(
          JSON.stringify({
            rep: n,
            badReps: Math.floor(n / 4),
            flexion: bad ? 32.5 : 18.2,
            fatigue: Math.min(100, n * 3),
            badForm: bad,
            angle: 85.0,
            valgus: 18.2,
            tilt: 10.1,
          })
        );
      }, 2500);
    }
  }
 
  stopSimulation() {
    if (this.simTimer) clearInterval(this.simTimer);
    this.simTimer = null;
  }
 
  disconnect() {
    this.stopSimulation();
    if (this.device && this.device.gatt.connected) this.device.gatt.disconnect();
    this.emitStatus(false, 'none');
  }
}
 
export const hardwareManager = new ESP32HardwareManager();
 
// Handy for console testing
if (typeof window !== 'undefined') window.hardwareManager = hardwareManager;
 

