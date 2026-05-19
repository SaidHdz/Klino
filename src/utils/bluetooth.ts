import { BleManager, Device, State } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

class BluetoothService {
  private manager: BleManager;
  private connectedDevice: Device | null = null;

  constructor() {
    this.manager = new BleManager();
  }

  async requestPermissions() {
    if (Platform.OS === 'android') {
      const apiLevel = parseInt(Platform.Version.toString(), 10);

      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return (
          result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
        );
      }
    }
    return true; // iOS handles permissions via Info.plist / app.json plugin
  }

  async startScan(onDeviceFound: (device: Device) => void) {
    const isReady = await this.requestPermissions();
    if (!isReady) {
      console.warn('Bluetooth permissions not granted');
      return;
    }

    const state = await this.manager.state();
    if (state !== State.PoweredOn) {
      console.warn('Bluetooth is not powered on');
      return;
    }

    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Scan Error:', error);
        return;
      }
      if (device && device.name) {
        onDeviceFound(device);
      }
    });
  }

  stopScan() {
    this.manager.stopDeviceScan();
  }

  async connectToDevice(device: Device) {
    try {
      this.stopScan();
      const connected = await device.connect();
      const discovered = await connected.discoverAllServicesAndCharacteristics();
      this.connectedDevice = discovered;
      console.log('Connected to:', device.name);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Hardware Klino Conectado",
          body: `Se ha establecido un vínculo seguro con ${device.name}.`,
          data: { deviceId: device.id },
        },
        trigger: null,
      });

      return discovered;
    } catch (error) {
      console.error('Connection Error:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.connectedDevice) {
      await this.connectedDevice.cancelConnection();
      this.connectedDevice = null;
    }
  }

  async startMonitoring(serviceUUID: string, characteristicUUID: string, onDataReceived: (data: string) => void) {
    if (!this.connectedDevice) {
      console.warn('No device connected for monitoring');
      return;
    }

    this.connectedDevice.monitorCharacteristicForService(
      serviceUUID,
      characteristicUUID,
      async (error, characteristic) => {
        if (error) {
          console.error('Monitoring Error:', error);
          return;
        }
        if (characteristic?.value) {
          const decodedData = Buffer.from(characteristic.value, 'base64').toString('utf-8');
          onDataReceived(decodedData);

          // Notificación de Salud (Fase 16)
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Dato IoT Recibido",
              body: "El hardware Klino ha enviado nuevos datos médicos.",
              sound: true,
              priority: Notifications.AndroidPriority.HIGH,
            },
            trigger: null,
          });
        }
      }
    );
  }

  getManager() {
    return this.manager;
  }
}

export const bluetoothService = new BluetoothService();
