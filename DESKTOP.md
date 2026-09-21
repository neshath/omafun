# Omafun desktop build

Omafun uses a two-layer architecture. The editor, Canvas renderer, runtime, marketplace, project format, and standalone HTML export remain the shared web engine. Tauri supplies only the Linux desktop shell and native file dialogs.

## Development modes

The browser development build remains unchanged:

```sh
npm start
# open http://127.0.0.1:4173
```

The desktop development build uses the same files inside a Tauri window:

```sh
npm install
npm run desktop:dev
```

The desktop build uses native open/save dialogs for projects and HTML exports. Browser mode keeps the existing file input and download fallbacks.

## Linux build requirements

A Linux build needs Node.js, npm, Rust/Cargo, the Tauri system dependencies, and WebKitGTK 4.1. On Arch/Omarchy, install the relevant development packages before running `npm run desktop:build`; the exact system package names can vary with the installed Omarchy/Arch release. The resulting binaries are emitted under `src-tauri/target/release/` and bundled artifacts under `src-tauri/target/release/bundle/`.

The included `packaging/PKGBUILD` builds the embedded desktop binary and installs it with an application launcher and icon. It is intended as a starting point for an Arch/AUR-style package, not as a claim that the package has already been accepted into the Omarchy marketplace.

## Compatibility boundary

The desktop shell does not change the Omafun project format or runtime. Tauri uses WebKitGTK on Linux rather than Chromium, so final validation should include Canvas rendering, keyboard shortcuts, drag/drop, file dialogs, PNG import/export, gamepad input, and the responsive editor layout under Wayland/Hyprland.

## Permissions

The Tauri capability file enables the dialog and filesystem plugins. The app only uses those permissions for user-selected project and export files. The marketplace's HTTPS catalog functionality remains application-level network access in the webview.
