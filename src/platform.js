/**
 * Small platform boundary shared by browser development mode and the Tauri build.
 * The editor, project format, renderer, and runtime do not depend on Tauri.
 */
export const isDesktop = Boolean(globalThis.__TAURI_INTERNALS__);

async function tauriModules() {
  const [{ open, save }, { readTextFile, writeTextFile }] = await Promise.all([
    import('@tauri-apps/plugin-dialog'),
    import('@tauri-apps/plugin-fs')
  ]);
  return { open, save, readTextFile, writeTextFile };
}

export async function openProjectFile(browserInput) {
  if (isDesktop) {
    const { open, readTextFile } = await tauriModules();
    const path = await open({
      multiple: false,
      directory: false,
      filters: [{ name: 'Omafun project', extensions: ['json', 'pixel.json'] }]
    });
    if (!path || Array.isArray(path)) return null;
    return { name: path.split(/[\\/]/).pop() || 'project.pixel.json', text: await readTextFile(path) };
  }
  browserInput.click();
  return null;
}

export async function saveProjectFile(data, suggestedName, mime = 'application/json') {
  if (isDesktop) {
    const { save, writeTextFile } = await tauriModules();
    const path = await save({
      defaultPath: suggestedName,
      filters: [{ name: mime === 'text/html' ? 'HTML game' : 'Omafun project', extensions: [mime === 'text/html' ? 'html' : 'pixel.json'] }]
    });
    if (!path) return false;
    await writeTextFile(path, data);
    return true;
  }
  const url = URL.createObjectURL(new Blob([data], { type: mime }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = suggestedName;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  return true;
}
