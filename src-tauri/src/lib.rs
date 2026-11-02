use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Serialize, Deserialize)]
pub struct LoadResponse {
    pub success: bool,
    pub data: Option<serde_json::Value>,
    #[serde(rename = "filePath", skip_serializing_if = "Option::is_none")]
    pub file_path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct SaveResponse {
    pub success: bool,
    #[serde(rename = "filePath", skip_serializing_if = "Option::is_none")]
    pub file_path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

fn get_data_file_path() -> Result<PathBuf, String> {
    let home = std::env::var("HOME").map_err(|e| e.to_string())?;
    let dir = PathBuf::from(home)
        .join("Library")
        .join("Application Support")
        .join("Tally");

    if !dir.exists() {
        fs::create_dir_all(&dir)
            .map_err(|e| format!("Failed to create directory {}: {}", dir.display(), e))?;
    }

    Ok(dir.join("tally_data.json"))
}

#[tauri::command]
fn load_data() -> LoadResponse {
    let path = match get_data_file_path() {
        Ok(p) => p,
        Err(e) => {
            return LoadResponse {
                success: false,
                data: None,
                file_path: None,
                error: Some(e),
            }
        }
    };

    if !path.exists() {
        return LoadResponse {
            success: true,
            data: None,
            file_path: Some(path.to_string_lossy().to_string()),
            error: None,
        };
    }

    match fs::read_to_string(&path) {
        Ok(content) => match serde_json::from_str::<serde_json::Value>(&content) {
            Ok(json) => LoadResponse {
                success: true,
                data: Some(json),
                file_path: Some(path.to_string_lossy().to_string()),
                error: None,
            },
            Err(e) => LoadResponse {
                success: false,
                data: None,
                file_path: Some(path.to_string_lossy().to_string()),
                error: Some(format!("Failed to parse JSON: {}", e)),
            },
        },
        Err(e) => LoadResponse {
            success: false,
            data: None,
            file_path: Some(path.to_string_lossy().to_string()),
            error: Some(format!("Failed to read file: {}", e)),
        },
    }
}

#[tauri::command]
fn save_data(data: serde_json::Value) -> SaveResponse {
    let path = match get_data_file_path() {
        Ok(p) => p,
        Err(e) => {
            return SaveResponse {
                success: false,
                file_path: None,
                error: Some(e),
            }
        }
    };

    let temp_path = path.with_extension("json.tmp");
    let json_bytes = match serde_json::to_string_pretty(&data) {
        Ok(s) => s,
        Err(e) => {
            return SaveResponse {
                success: false,
                file_path: None,
                error: Some(format!("Failed to serialize data: {}", e)),
            }
        }
    };

    if let Err(e) = fs::write(&temp_path, json_bytes) {
        return SaveResponse {
            success: false,
            file_path: None,
            error: Some(format!("Failed to write temp file: {}", e)),
        };
    }

    if let Err(e) = fs::rename(&temp_path, &path) {
        return SaveResponse {
            success: false,
            file_path: None,
            error: Some(format!(
                "Failed to rename temp file to destination: {}",
                e
            )),
        };
    }

    SaveResponse {
        success: true,
        file_path: Some(path.to_string_lossy().to_string()),
        error: None,
    }
}

#[tauri::command]
fn open_data_folder() -> SaveResponse {
    let path = match get_data_file_path() {
        Ok(p) => p,
        Err(e) => {
            return SaveResponse {
                success: false,
                file_path: None,
                error: Some(e),
            }
        }
    };

    if !path.exists() {
        let _ = fs::write(&path, "[]");
    }

    #[cfg(target_os = "macos")]
    {
        let _ = std::process::Command::new("open")
            .arg("-R")
            .arg(&path)
            .spawn();
    }

    SaveResponse {
        success: true,
        file_path: Some(path.to_string_lossy().to_string()),
        error: None,
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
            open_external
        ])
        .run(tauri::generate_context!())
        .expect("error while building tauri application");
}
