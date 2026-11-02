import React, { useState } from 'react';
import { 
  X, 
  Folder, 
  FolderOpen, 
  FileSpreadsheet, 
  HardDrive, 
  Cloud, 
  RotateCcw, 
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { StorageInfo } from '../types/moneybook';

interface StorageSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  storageInfo: StorageInfo | null;
  onStorageInfoChange: (info: StorageInfo) => void;
  onReloadEntries: () => void;
}

export const StorageSettingsModal: React.FC<StorageSettingsModalProps> = ({
  isOpen,
  onClose,
  storageInfo,
  onStorageInfoChange,
  onReloadEntries,
}) => {
  const [isChanging, setIsChanging] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChooseFolder = async () => {
    if (!window.tallyAPI) return;
    setIsChanging(true);
    setStatusMessage(null);
    try {
      const selected = await window.tallyAPI.chooseFolderDialog();
      if (selected) {
        const res = await window.tallyAPI.setStorageFolder(selected);
        if (res.success && res.storageInfo) {
          onStorageInfoChange(res.storageInfo);
          onReloadEntries();
          setStatusMessage('저장 폴더가 성공적으로 변경되었습니다. 가계부 데이터와 엑셀 파일이 새 위치로 동기화되었습니다.');
        }
      }
    } catch (err: any) {
      console.error('Failed to change storage folder:', err);
      setStatusMessage('폴더 변경 중 오류가 발생했습니다.');
    } finally {
      setIsChanging(false);
    }
  };

  const handleResetDefault = async () => {
    if (!window.tallyAPI) return;
    setIsChanging(true);
    setStatusMessage(null);
    try {
      const res = await window.tallyAPI.setStorageFolder(null);
      if (res.success && res.storageInfo) {
        onStorageInfoChange(res.storageInfo);
        onReloadEntries();
        setStatusMessage('기본 저장 폴더로 초기화되었습니다.');
      }
    } catch (err: any) {
      console.error('Failed to reset folder:', err);
    } finally {
      setIsChanging(false);
    }
  };

  const handleOpenFolder = async () => {
    if (window.tallyAPI) {
      await window.tallyAPI.openDataFolder();
    }
  };

  const handleOpenCsv = async () => {
    if (window.tallyAPI) {
      const success = await window.tallyAPI.openCsvFile();
      if (!success) {
        alert('엑셀(CSV) 파일을 아직 찾을 수 없습니다. 장부 내역이 저장되면 자동으로 생성됩니다.');
      }
    }
  };

  const currentDir = storageInfo?.current_dir || '~/Library/Application Support/Tally';
  const isCustom = storageInfo?.is_custom || false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-2xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF]">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                로컬 저장소 & 엑셀(CSV) 설정
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                가계부 파일 저장 위치를 직접 지정하고 엑셀에서 확인하세요.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-neutral-600 dark:text-neutral-300">
          {/* Current Path Card */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-200 flex items-center gap-1.5">
                {isCustom ? (
                  <>
                    <Cloud className="w-3.5 h-3.5 text-[#007AFF]" />
                    사용자 지정 폴더
                  </>
                ) : (
                  <>
                    <HardDrive className="w-3.5 h-3.5 text-neutral-500" />
                    기본 로컬 저장소
                  </>
                )}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-black/[0.04] dark:bg-white/[0.06] text-neutral-500">
                {isCustom ? 'Custom Dir' : 'Default macOS AppData'}
              </span>
            </div>
            <p className="font-mono text-[11px] text-neutral-800 dark:text-neutral-100 break-all select-all bg-white dark:bg-black/20 p-2 rounded-lg border border-black/[0.04] dark:border-white/[0.04]">
              {currentDir}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleChooseFolder}
                disabled={isChanging}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[#007AFF] hover:bg-[#0071E3] transition-colors cursor-pointer disabled:opacity-50"
              >
                <Folder className="w-3.5 h-3.5" />
                <span>폴더 변경...</span>
              </button>

              {isCustom && (
                <button
                  onClick={handleResetDefault}
                  disabled={isChanging}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>기본 위치로 복원</span>
                </button>
              )}
            </div>
          </div>

          {/* Excel / CSV Live Sync Section */}
          <div className="space-y-2.5">
            <h3 className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#34C759]" />
              자동 생성되는 실시간 엑셀 파일 (CSV)
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
              가계부를 작성하거나 수정할 때마다 저장 폴더에 <strong>Microsoft Excel 호환 UTF-8 BOM CSV 파일</strong>(<code className="font-mono text-[10px] bg-black/[0.04] dark:bg-white/[0.06] px-1 py-0.5 rounded">tally_transactions.csv</code>)이 실시간으로 동기화됩니다.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleOpenCsv}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] hover:bg-black/[0.02] dark:hover:bg-white/[0.04] text-neutral-800 dark:text-neutral-100 font-medium transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#34C759]" />
                <span>엑셀로 바로 열기</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </button>

              <button
                onClick={handleOpenFolder}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] hover:bg-black/[0.02] dark:hover:bg-white/[0.04] text-neutral-800 dark:text-neutral-100 font-medium transition-colors cursor-pointer"
              >
                <FolderOpen className="w-4 h-4 text-[#007AFF]" />
                <span>Finder에서 보기</span>
              </button>
            </div>
          </div>

          {/* Cloud Sync Tip Box */}
          <div className="p-3.5 rounded-xl bg-[#5856D6]/5 dark:bg-[#5856D6]/10 border border-[#5856D6]/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#5856D6] dark:text-[#7A79E8] font-medium text-[11px]">
              <Cloud className="w-3.5 h-3.5" />
              <span>무료 클라우드 자동 동기화 팁</span>
            </div>
            <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed">
              <strong>iCloud Drive</strong>(예: <code className="font-mono text-[10px]">~/Library/Mobile Documents/com~apple~CloudDocs/Tally</code>) 또는 <strong>Dropbox, Google Drive</strong> 동기화 폴더를 저장 위치로 지정하시면, 별도 유료 클라우드 구독 없이도 여러 대의 Mac이나 모바일에서 가계부와 엑셀 파일을 항상 최신 상태로 열어보실 수 있습니다.
            </p>
          </div>

          {statusMessage && (
            <div className="p-2.5 rounded-lg bg-[#34C759]/10 text-[#34C759] text-[11px] flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-neutral-50 dark:bg-white/[0.02] border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
