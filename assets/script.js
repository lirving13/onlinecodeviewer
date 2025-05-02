// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
  // 1. CodeMirror 6 Init
  const { EditorView, basicSetup } = CM["@codemirror/basic-setup"];
  const htmlLang = CM["@codemirror/lang-html"].html();

  const editorView = new EditorView({
    doc: '<!-- Start coding HTML here -->',
    extensions: [basicSetup, htmlLang],
    parent: document.getElementById('editor')
  });

  const preview = document.getElementById('preview');
  const updatePreview = () => preview.srcdoc = editorView.state.doc.toString();
  editorView.dispatch({
    effects: EditorView.updateListener.of(updatePreview)
  });
  updatePreview();

  // 2. Mobile Nav Toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');
  navToggle.addEventListener('click', () => navList.classList.toggle('open'));

  // 3. Dark/Light Theme Toggle
  const themeToggle = document.querySelector('.theme-toggle');
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  if (saved) root.className = saved;

  themeToggle.addEventListener('click', () => {
    const next = root.classList.contains('light-theme') ? 'dark-theme' : 'light-theme';
    root.className = next;
    localStorage.setItem('theme', next);
  });

  // 4. Editor Toolbar Actions
  document.querySelectorAll('.editor-toolbar button').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const container = document.getElementById('editor-container');
      switch(action) {
        case 'dock-left': container.style.gridTemplateColumns = '200px 1fr'; break;
        case 'dock-right': container.style.gridTemplateColumns = '1fr 200px'; break;
        case 'fullscreen': container.classList.toggle('fullscreen'); break;
        case 'reset': container.style.gridTemplateColumns = ''; container.classList.remove('fullscreen'); break;
      }
    });
  });
});
