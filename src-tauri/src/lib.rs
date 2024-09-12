#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
	::tauri::Builder::default()
	.plugin(tauri_plugin_fs::init())
	.plugin(tauri_plugin_window_state::Builder::default().build())
	.plugin(tauri_plugin_notification::init())
	.run(tauri::generate_context!())
	.expect("error while running tauri application");
}
