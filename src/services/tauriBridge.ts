import { invoke, isTauri } from '@tauri-apps/api/core';
import { MoneybookEntry, StorageInfo } from '../types/moneybook';

export function initTauriBridge(): void {
  if (isTauri()) {
    window.tallyAPI = {
      loadData: async () => {
        try {
          return await invoke<{
            success: boolean;
            data: MoneybookEntry[] | null;
            filePath?: string;
            csvPath?: string;
            storageInfo?: StorageInfo;
          }>('load_data');
        } catch (err: any) {
          console.error('[Tauri] load_data error:', err);
          return { success: false, data: null };
        }
      },
      saveData: async (data: MoneybookEntry[]) => {
        try {
          return await invoke<{
            success: boolean;
            filePath?: string;
            csvPath?: string;
            storageInfo?: StorageInfo;
          }>('save_data', { data });
        } catch (err: any) {
          console.error('[Tauri] save_data error:', err);
          return { success: false };
        }
      },
      openDataFolder: async () => {
        try {
          return await invoke<{ success: boolean; filePath?: string; csvPath?: string }>('open_data_folder');
        } catch (err: any) {
          console.error('[Tauri] open_data_folder error:', err);
          return { success: false };
        }
      },
      openCsvFile: async () => {
        try {
          return await invoke<boolean>('open_csv_file');
        } catch (err: any) {
          console.error('[Tauri] open_csv_file error:', err);
          return false;
        }
      },
      getStorageInfo: async () => {
        try {
          return await invoke<StorageInfo>('get_storage_info');
        } catch (err: any) {
          console.error('[Tauri] get_storage_info error:', err);
          return null;
        }
      },
      chooseFolderDialog: async () => {
        try {
          return await invoke<string | null>('choose_folder_dialog');
        } catch (err: any) {
          console.error('[Tauri] choose_folder_dialog error:', err);
          return null;
        }
      },
      setStorageFolder: async (folder: string | null) => {
        try {
          return await invoke<{
            success: boolean;
            data: MoneybookEntry[] | null;
            filePath?: string;
            csvPath?: string;
            storageInfo?: StorageInfo;
          }>('set_storage_folder', { folder });
        } catch (err: any) {
          console.error('[Tauri] set_storage_folder error:', err);
          return { success: false, data: null };
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
