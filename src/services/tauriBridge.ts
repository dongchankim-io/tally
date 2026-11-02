import { invoke, isTauri } from '@tauri-apps/api/core';
import { MoneybookEntry } from '../types/moneybook';

export function initTauriBridge(): void {
  if (isTauri()) {
    window.tallyAPI = {
      loadData: async () => {
        try {
          return await invoke<{ success: boolean; data: MoneybookEntry[] | null; filePath?: string }>('load_data');
        } catch (err: any) {
          console.error('[Tauri] load_data error:', err);
          return { success: false, data: null };
        }
      },
      saveData: async (data: MoneybookEntry[]) => {
        try {
          return await invoke<{ success: boolean; filePath?: string }>('save_data', { data });
        } catch (err: any) {
          console.error('[Tauri] save_data error:', err);
          return { success: false };
        }
      },
      openDataFolder: async () => {
        try {
          return await invoke<{ success: boolean; filePath?: string }>('open_data_folder');
        } catch (err: any) {
          console.error('[Tauri] open_data_folder error:', err);
          return { success: false };
        }
      },
      openExternal: async (url: string) => {
        try {
          return await invoke<boolean>('open_external', { url });
        } catch {
          return false;
        }
      }
    };
  }
}
