use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AppConfig {
    pub custom_storage_folder: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct StorageInfo {
    pub current_dir: String,
    pub is_custom: bool,
    pub json_path: String,
    pub csv_path: String,
}

#[derive(Serialize, Deserialize)]
pub struct LoadResponse {
    pub success: bool,
    pub data: Option<serde_json::Value>,
    #[serde(rename = "filePath", skip_serializing_if = "Option::is_none")]
    pub file_path: Option<String>,
    #[serde(rename = "csvPath", skip_serializing_if = "Option::is_none")]
    pub csv_path: Option<String>,
    #[serde(rename = "storageInfo", skip_serializing_if = "Option::is_none")]
    pub storage_info: Option<StorageInfo>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct SaveResponse {
    pub success: bool,
    #[serde(rename = "filePath", skip_serializing_if = "Option::is_none")]
    pub file_path: Option<String>,
    #[serde(rename = "csvPath", skip_serializing_if = "Option::is_none")]
    pub csv_path: Option<String>,
    #[serde(rename = "storageInfo", skip_serializing_if = "Option::is_none")]
    pub storage_info: Option<StorageInfo>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

fn get_default_tally_dir() -> Result<PathBuf, String> {
    let home = std::env::var("HOME").map_err(|e| e.to_string())?;
    let dir = PathBuf::from(home)
        .join("Library")
        .join("Application Support")
        .join("Tally");

    if !dir.exists() {
        fs::create_dir_all(&dir)
            .map_err(|e| format!("Failed to create directory {}: {}", dir.display(), e))?;
    }

    Ok(dir)
}

fn get_config_file_path() -> Result<PathBuf, String> {
    let dir = get_default_tally_dir()?;
    Ok(dir.join("config.json"))
}

fn load_app_config() -> AppConfig {
    if let Ok(config_path) = get_config_file_path() {
        if config_path.exists() {
            if let Ok(raw) = fs::read_to_string(&config_path) {
                if let Ok(config) = serde_json::from_str::<AppConfig>(&raw) {
                    return config;
                }
            }
        }
    }
    AppConfig {
        custom_storage_folder: None,
    }
}

fn save_app_config(config: &AppConfig) -> Result<(), String> {
    let config_path = get_config_file_path()?;
    let json = serde_json::to_string_pretty(config).map_err(|e| e.to_string())?;
    fs::write(config_path, json).map_err(|e| e.to_string())?;
    Ok(())
}

fn get_active_storage_dir() -> Result<(PathBuf, bool), String> {
    let config = load_app_config();
    if let Some(ref custom_path) = config.custom_storage_folder {
        let p = PathBuf::from(custom_path);
        if !p.exists() {
            if let Err(e) = fs::create_dir_all(&p) {
                eprintln!(
                    "[Storage] Custom folder create failed: {}, falling back to default",
                    e
                );
                return Ok((get_default_tally_dir()?, false));
            }
        }
        return Ok((p, true));
    }
    Ok((get_default_tally_dir()?, false))
}

fn get_storage_paths() -> Result<(PathBuf, PathBuf, StorageInfo), String> {
    let (dir, is_custom) = get_active_storage_dir()?;
    let json_path = dir.join("tally_data.json");
    let csv_path = dir.join("tally_transactions.csv");
    let info = StorageInfo {
        current_dir: dir.to_string_lossy().to_string(),
        is_custom,
        json_path: json_path.to_string_lossy().to_string(),
        csv_path: csv_path.to_string_lossy().to_string(),
    };
    Ok((json_path, csv_path, info))
}

fn csv_escape(s: &str) -> String {
    if s.contains(',') || s.contains('"') || s.contains('\n') || s.contains('\r') {
        format!("\"{}\"", s.replace('"', "\"\""))
    } else {
        s.to_string()
    }
}

fn generate_csv(entries: &[serde_json::Value]) -> String {
    let mut out = String::from("\u{FEFF}"); // UTF-8 BOM for Excel compatibility
    out.push_str("ID,날짜,구분,대분류,소분류,결제수단,사용처,금액,통화,메모,검토상태\n");

    for entry in entries {
        let id = entry.get("id").and_then(|v| v.as_str()).unwrap_or("");
        let date = entry.get("date").and_then(|v| v.as_str()).unwrap_or("");
        let entry_type = match entry.get("type").and_then(|v| v.as_str()) {
            Some("expense") => "지출",
            Some("income") => "수입",
            Some("transfer") => "이체",
            Some(other) => other,
            None => "",
        };
        let main_cat = entry.get("mainCategory").and_then(|v| v.as_str()).unwrap_or("");
        let sub_cat = entry.get("subCategory").and_then(|v| v.as_str()).unwrap_or("");
        let payment_method = entry.get("paymentMethod").and_then(|v| v.as_str()).unwrap_or("");
        let payee = entry.get("payee").and_then(|v| v.as_str()).unwrap_or("");
        let amount = entry.get("amount").and_then(|v| v.as_f64()).unwrap_or(0.0);
        let currency = entry.get("currency").and_then(|v| v.as_str()).unwrap_or("KRW");
        let memo = entry.get("memo").and_then(|v| v.as_str()).unwrap_or("");
        let reviewed = if entry.get("reviewed").and_then(|v| v.as_bool()).unwrap_or(false) {
            "검토완료"
        } else {
            "대기"
        };

        let row = format!(
            "{},{},{},{},{},{},{},{},{},{},{}\n",
            csv_escape(id),
            csv_escape(date),
            csv_escape(entry_type),
            csv_escape(main_cat),
            csv_escape(sub_cat),
            csv_escape(payment_method),
            csv_escape(payee),
            amount,
            csv_escape(currency),
            csv_escape(memo),
            csv_escape(reviewed),
        );
        out.push_str(&row);
    }
    out
}

#[tauri::command]
fn get_storage_info() -> Result<StorageInfo, String> {
    let (_, _, info) = get_storage_paths()?;
    Ok(info)
}

#[tauri::command]
fn choose_folder_dialog() -> Result<Option<String>, String> {
    #[cfg(target_os = "macos")]
    {
        let script = r#"POSIX path of (choose folder with prompt "Tally 가계부 저장 폴더를 선택하세요:")"#;
        let output = std::process::Command::new("osascript")
            .arg("-e")
            .arg(script)
            .output()
            .map_err(|e| e.to_string())?;

        if output.status.success() {
            let path_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !path_str.is_empty() {
                return Ok(Some(path_str));
            }
        }
        Ok(None)
    }
    #[cfg(not(target_os = "macos"))]
    {
        Ok(None)
    }
}

#[tauri::command]
fn set_storage_folder(folder: Option<String>) -> LoadResponse {
    let old_paths = match get_storage_paths() {
        Ok(p) => p,
        Err(e) => {
            return LoadResponse {
                success: false,
                data: None,
                file_path: None,
                csv_path: None,
                storage_info: None,
                error: Some(e),
            }
        }
    };

    let config = AppConfig {
        custom_storage_folder: folder,
    };

    if let Err(e) = save_app_config(&config) {
        return LoadResponse {
            success: false,
            data: None,
            file_path: None,
            csv_path: None,
            storage_info: None,
            error: Some(e),
        };
    }

    let (new_json_path, new_csv_path, _new_info) = match get_storage_paths() {
        Ok(p) => p,
        Err(e) => {
            return LoadResponse {
                success: false,
                data: None,
                file_path: None,
                csv_path: None,
                storage_info: None,
                error: Some(e),
            }
        }
    };

    // If new folder does not have tally_data.json, but old folder did, copy it over!
    if !new_json_path.exists() && old_paths.0.exists() {
        let _ = fs::copy(&old_paths.0, &new_json_path);
        let _ = fs::copy(&old_paths.1, &new_csv_path);
    }

    // Load data from active location
    load_data()
}

#[tauri::command]
fn load_data() -> LoadResponse {
    let (json_path, csv_path, info) = match get_storage_paths() {
        Ok(p) => p,
        Err(e) => {
            return LoadResponse {
                success: false,
                data: None,
                file_path: None,
                csv_path: None,
                storage_info: None,
                error: Some(e),
            }
        }
    };

    if !json_path.exists() {
        return LoadResponse {
            success: true,
            data: None,
            file_path: Some(json_path.to_string_lossy().to_string()),
            csv_path: Some(csv_path.to_string_lossy().to_string()),
            storage_info: Some(info),
            error: None,
        };
    }

    match fs::read_to_string(&json_path) {
        Ok(content) => match serde_json::from_str::<serde_json::Value>(&content) {
            Ok(json) => {
                // Ensure CSV also exists
                if !csv_path.exists() {
                    if let Some(arr) = json.as_array() {
                        let csv_str = generate_csv(arr);
                        let _ = fs::write(&csv_path, csv_str);
                    }
                }
                LoadResponse {
                    success: true,
                    data: Some(json),
                    file_path: Some(json_path.to_string_lossy().to_string()),
                    csv_path: Some(csv_path.to_string_lossy().to_string()),
                    storage_info: Some(info),
                    error: None,
                }
            }
            Err(e) => LoadResponse {
                success: false,
                data: None,
                file_path: Some(json_path.to_string_lossy().to_string()),
                csv_path: Some(csv_path.to_string_lossy().to_string()),
                storage_info: Some(info),
                error: Some(format!("Failed to parse JSON: {}", e)),
            },
        },
        Err(e) => LoadResponse {
            success: false,
            data: None,
            file_path: Some(json_path.to_string_lossy().to_string()),
            csv_path: Some(csv_path.to_string_lossy().to_string()),
            storage_info: Some(info),
            error: Some(format!("Failed to read file: {}", e)),
        },
    }
}

#[tauri::command]
fn save_data(data: serde_json::Value) -> SaveResponse {
    let (json_path, csv_path, info) = match get_storage_paths() {
        Ok(p) => p,
        Err(e) => {
            return SaveResponse {
                success: false,
                file_path: None,
                csv_path: None,
                storage_info: None,
                error: Some(e),
            }
        }
    };

    // 1. Atomically save tally_data.json
    let temp_path = json_path.with_extension("json.tmp");
    let json_bytes = match serde_json::to_string_pretty(&data) {
        Ok(s) => s,
        Err(e) => {
            return SaveResponse {
                success: false,
                file_path: None,
                csv_path: None,
                storage_info: Some(info),
                error: Some(format!("Failed to serialize data: {}", e)),
            }
        }
    };

    if let Err(e) = fs::write(&temp_path, json_bytes) {
        return SaveResponse {
            success: false,
            file_path: None,
            csv_path: None,
            storage_info: Some(info),
            error: Some(format!("Failed to write temp file: {}", e)),
        };
    }

    if let Err(e) = fs::rename(&temp_path, &json_path) {
        return SaveResponse {
            success: false,
            file_path: None,
            csv_path: None,
            storage_info: Some(info),
            error: Some(format!(
                "Failed to rename temp file to destination: {}",
                e
            )),
        };
    }

    // 2. Generate and write tally_transactions.csv with UTF-8 BOM
    if let Some(arr) = data.as_array() {
        let csv_content = generate_csv(arr);
        let temp_csv = csv_path.with_extension("csv.tmp");
        if fs::write(&temp_csv, csv_content).is_ok() {
            let _ = fs::rename(&temp_csv, &csv_path);
        }
    }

    SaveResponse {
        success: true,
        file_path: Some(json_path.to_string_lossy().to_string()),
        csv_path: Some(csv_path.to_string_lossy().to_string()),
        storage_info: Some(info),
        error: None,
    }
}

#[tauri::command]
fn open_data_folder() -> SaveResponse {
    let (json_path, csv_path, info) = match get_storage_paths() {
        Ok(p) => p,
        Err(e) => {
            return SaveResponse {
                success: false,
                file_path: None,
                csv_path: None,
                storage_info: None,
                error: Some(e),
            }
        }
    };

    if !json_path.exists() {
        let _ = fs::write(&json_path, "[]");
    }

    #[cfg(target_os = "macos")]
    {
        // Open the folder in Finder
        let _ = std::process::Command::new("open")
            .arg(&info.current_dir)
            .spawn();
    }

    SaveResponse {
        success: true,
        file_path: Some(json_path.to_string_lossy().to_string()),
        csv_path: Some(csv_path.to_string_lossy().to_string()),
        storage_info: Some(info),
        error: None,
    }
}

#[tauri::command]
fn open_csv_file() -> Result<bool, String> {
    let (_, csv_path, _) = get_storage_paths()?;
    if !csv_path.exists() {
        return Err("CSV file not found".to_string());
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&csv_path)
            .spawn()
            .map(|_| true)
            .map_err(|e| e.to_string())
    }
    #[cfg(not(target_os = "macos"))]
    {
        Ok(false)
    }
}

#[tauri::command]
fn open_external(url: String) -> bool {
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&url)
            .spawn()
            .is_ok()
    }
    #[cfg(not(target_os = "macos"))]
    {
        false
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            load_data,
            save_data,
            open_data_folder,
            open_csv_file,
            get_storage_info,
            choose_folder_dialog,
            set_storage_folder,
            open_external
        ])
        .run(tauri::generate_context!())
        .expect("error while building tauri application");
}
