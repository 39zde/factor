// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
	::tauri::Builder::default()
	.plugin(tauri_plugin_fs::init())
	.plugin(tauri_plugin_window_state::Builder::default().build())
	.plugin(tauri_plugin_notification::init())
	.plugin(tauri_plugin_shell::init())
	.run(tauri::generate_context!())
	.expect("error while running tauri application");
}
