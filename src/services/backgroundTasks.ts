import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { bluetoothService } from '../utils/bluetooth';

// Nombre de la tarea para el procesamiento de datos IoT
export const BACKGROUND_IOT_TASK = 'KLINO_IOT_LISTENER_TASK';

/**
 * Define la tarea que se ejecutará en segundo plano.
 * Esta tarea es despertada por el sistema operativo.
 */
if (Platform.OS !== 'web') {
  TaskManager.defineTask(BACKGROUND_IOT_TASK, async () => {
    try {
      console.log('[Background] Ejecutando verificación de estado IoT...');
      
      const manager = bluetoothService.getManager();
      const state = await manager.state();

      if (state !== 'PoweredOn') {
        return BackgroundFetch.BackgroundFetchResult.NoData;
      }

      // Aquí iría la lógica para reconectar si se perdió la conexión
      // o para procesar una cola local de mensajes pendientes.
      
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
      console.error('[Background] Error en tarea IoT:', error);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
}

/**
 * Registra la tarea en el sistema operativo.
 */
export async function registerBackgroundTasks() {
  if (Platform.OS === 'web') {
    console.log('[Background] Tareas en segundo plano no soportadas en Web. Omitiendo registro.');
    return;
  }

  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_IOT_TASK);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_IOT_TASK, {
        minimumInterval: 15 * 60, // 15 minutos (mínimo permitido por Android/iOS)
        stopOnTerminate: false,   // Mantener viva si la app se cierra
        startOnBoot: true,        // Iniciar al reiniciar el teléfono
      });
      console.log('[Background] Tarea IoT registrada con éxito.');
    }
  } catch (err) {
    console.error('[Background] Error al registrar tarea:', err);
  }
}
