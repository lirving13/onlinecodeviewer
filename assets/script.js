// assets/script.js
// Comprehensive script for Online Code Viewer

window.addEventListener("DOMContentLoaded", async () => {
  const { EditorView, basicSetup } = CM["@codemirror/basic-setup"];
  const htmlLang = CM["@codemirror/lang-html"].html();
  const cssLang = CM["@codemirror/lang-css"].css();
  const jsLang = CM["@codemirror/lang-javascript"].javascript();

  // Optional Emmet
  let emmet;
  try {
    emmet = await import("https://cdn.jsdelivr.net/npm/codemirror-emmet@1.2.3/dist/emmet.js");
  } catch { }

  // File tabs initial content
  const files = {
    "index.html": "<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset=\"UTF-8\">\n    <title>New Document</title>\n  </head>\n  <body>\n    Hello World\n  </body>\n</html>",
    "styles.css": "body { margin: 0; }",
    "script.js": "console.log(\"Hello, World!\");"
  };
  let currentFile = "index.html";

  // Create editor
  const editor = new EditorView({
    doc: files[currentFile],
    extensions: [
      basicSetup,
      htmlLang,
      cssLang,
      jsLang,
      emmet ? emmet.emmet() : [],
      EditorView.updateListener.of(updatePreview),
    ],
    parent: document.getElementById("editor"),
  });

  // Restore session
  const saved = localStorage.getItem("onlinecodeviewer-session");
  if (saved) {
    const session = JSON.parse(saved);
    Object.assign(files, session.files);
    currentFile = session.currentFile;
    editor.dispatch({
      changes: { from: 0, to: editor.state.doc.length, insert: files[currentFile] },
    });
  }
  window.addEventListener("beforeunload", () => {
    localStorage.setItem(
      "onlinecodeviewer-session",
      JSON.stringify({ files, currentFile })
    );
  });

  const previewFrame = document.getElementById("preview");
  function updatePreview() {
    const html = files["index.html"];
    const css = `<style>${files["styles.css"]}</style>`;
    const js = `<script>${files["script.js"]}<\/script>`;
    previewFrame.srcdoc = html.replace("</head>", css + "</head>").replace("</body>", js + "</body>");
  }
  updatePreview();

  // Pane docking & toolbar
  const container = document.getElementById("editor-container");
  document.querySelector(".editor-toolbar").addEventListener("click", (e) => {
    const action = e.target.dataset.action;
    switch (action) {
      case "dock-left": container.style.gridTemplateColumns = "200px 1fr"; break;
      case "dock-right": container.style.gridTemplateColumns = "1fr 200px"; break;
      case "fullscreen": container.classList.toggle("fullscreen"); break;
      case "reset": container.style.gridTemplateColumns = ""; container.classList.remove("fullscreen"); break;
      case "open-new": window.open().document.write(previewFrame.srcdoc); break;
    }
  });

  // FS Access API
  document.getElementById("open-file").addEventListener("click", async () => {
    try {
      const [handle] = await window.showOpenFilePicker();
      const file = await handle.getFile();
      const text = await file.text();
      files[currentFile] = text;
      editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: text } });
    } catch {}
  });
  document.getElementById("save-file").addEventListener("click", async () => {
    try {
      const handle = await window.showSaveFilePicker({ suggestedName: currentFile });
      const w = await handle.createWritable();
      await w.write(editor.state.doc.toString());
      await w.close();
    } catch {}
  });

  // ZIP import/export
  const JSZip = await import("https://cdn.jsdelivr.net/npm/jszip@3.7.1/dist/jszip.min.js");
  document.getElementById("export-zip").addEventListener("click", async () => {
    const zip = new JSZip();
    Object.entries(files).forEach(([name, content]) => zip.file(name, content));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "project.zip"; a.click();
  });
  document.getElementById("import-zip").addEventListener("change", async (e) => {
    const zip = await JSZip.loadAsync(e.target.files[0]);
    zip.forEach((path, file) => {
      zip.file(path).async("string").then((text) => { files[path] = text; });
    });
  });

  // URL-hash sharing
  const updateHash = () => {
    location.hash = btoa(JSON.stringify(files));
  };
  window.addEventListener("hashchange", () => {
    const loaded = JSON.parse(atob(location.hash.slice(1)));
    Object.assign(files, loaded);
    editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: files[currentFile] } });
  });
  setInterval(updateHash, 5000);

  // Clipboard & Web Share
  document.getElementById("copy-url").addEventListener("click", () => navigator.clipboard.writeText(location.href));
  document.getElementById("share").addEventListener("click", () => { if (navigator.share) navigator.share({ title: document.title, url: location.href }); });

  // Color picker
  document.getElementById("color-picker").addEventListener("input", (e) => {
    files["styles.css"] += `\nbody { background:${e.target.value} }`;
    editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: files["styles.css"] } });
  });

  // Live SEO snippet
  document.getElementById("seo-title").addEventListener("input", (e) => document.title = e.target.value);
  document.getElementById("seo-desc").addEventListener("input", (e) => {
    document.querySelector('meta[name="description"]').setAttribute("content", e.target.value);
  });

  // In-page console
  const origLog = console.log;
  const consolePane = document.getElementById("console");
  console.log = (...args) => {
    origLog(...args);
    const msg = document.createElement("div"); msg.textContent = args.join(" "); consolePane.appendChild(msg);
  };

  // Performance dashboard
  document.getElementById("show-perf").addEventListener("click", () => {
    const dash = document.getElementById("perf-dashboard");
    dash.innerHTML = "<pre>" + JSON.stringify(performance.getEntries(), null, 2) + "</pre>";
  });

  // Interactive tour (Shepherd.js)
  const tour = new Shepherd.Tour({ defaultStepOptions: { scrollTo: true } });
  tour.addStep("welcome", { text: "Welcome to Online Code Viewer!", attachTo: { element: ".site-header", on: "bottom" } });
  tour.addStep("editor", { text: "This is your code editor.", attachTo: { element: "#editor", on: "right" } });
  document.getElementById("start-tour").addEventListener("click", () => tour.start());

  // Shortcuts modal
  document.getElementById("shortcuts-btn").addEventListener("click", () => {
    document.getElementById("shortcuts-modal").classList.toggle("open");
  });
});
