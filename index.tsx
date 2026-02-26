
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const ICON_MARKUP: Record<string, string> = {
  add: `<path d="M12 5v14M5 12h14"/>`,
  add_photo_alternate: `<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="m21 15-4.5-4.5L8 19"/>`,
  admin_panel_settings: `<path d="M12 2l7 3v6c0 5-3.5 9-7 11-3.5-2-7-6-7-11V5l7-3z"/><path d="m9.5 12.5 1.7 1.7 3.4-3.4"/>`,
  arrow_back: `<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>`,
  arrow_forward: `<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>`,
  auto_awesome: `<path d="M12 3l1.6 3.7L17 8.3l-3.4 1.6L12 13.6l-1.6-3.7L7 8.3l3.4-1.6z"/><path d="m5 14 1 2.3L8.3 17 6 18l-1 2.3L4 18l-2.3-1L4 16.3z"/><path d="m19 14 1 2.3 2.3.7L20 18l-1 2.3-1-2.3-2.3-.7 2.3-.7z"/>`,
  auto_fix: `<path d="m4 20 4-1 10-10-3-3L5 16l-1 4z"/><path d="m14 6 3 3"/>`,
  auto_stories: `<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16h-13A2.5 2.5 0 0 0 4.5 21H4z"/><path d="M8 7h8M8 11h8M8 15h5"/>`,
  battery_full: `<rect x="2" y="8" width="18" height="8" rx="2"/><path d="M22 10v4"/><rect x="4.5" y="10.5" width="13" height="3" rx="1" fill="currentColor" stroke="none"/>`,
  bookmark: `<path d="M7 4h10v16l-5-3-5 3z"/>`,
  bookmark_add: `<path d="M7 4h10v16l-5-3-5 3z"/><path d="M12 8v5M9.5 10.5h5"/>`,
  bookmark_added: `<path d="M7 4h10v16l-5-3-5 3z"/><path d="m9.5 10.5 1.8 1.8 3.2-3.2"/>`,
  calendar_month: `<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 9h18"/>`,
  check_circle: `<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.2 2.2L15.5 9.5"/>`,
  chevron_left: `<path d="m15 6-6 6 6 6"/>`,
  chevron_right: `<path d="m9 6 6 6-6 6"/>`,
  church: `<path d="M12 3v18"/><path d="M8 7h8"/><path d="M5 21V11l7-4 7 4v10z"/>`,
  close: `<path d="m6 6 12 12M18 6 6 18"/>`,
  dark_mode: `<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>`,
  database: `<ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v12c0 1.7 3.1 3 7 3s7-1.3 7-3V5"/><path d="M5 11c0 1.7 3.1 3 7 3s7-1.3 7-3"/>`,
  delete: `<path d="M4 7h16"/><path d="M9 7V4h6v3"/><rect x="6.5" y="7" width="11" height="13" rx="1.5"/>`,
  edit_square: `<path d="M4 20h4l10-10-4-4L4 16z"/><path d="M14 6l4 4"/>`,
  error: `<circle cx="12" cy="12" r="9"/><path d="M12 7v6"/><circle cx="12" cy="16.5" r="1" fill="currentColor" stroke="none"/>`,
  explore: `<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 6-6 2 2-6z"/>`,
  forum: `<path d="M21 15a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`,
  format_quote: `<path d="M8.5 8.5A3.5 3.5 0 0 0 5 12v4h4v-4H7.5"/><path d="M16.5 8.5A3.5 3.5 0 0 0 13 12v4h4v-4h-1.5"/>`,
  group: `<circle cx="9" cy="9" r="3"/><circle cx="16.5" cy="10" r="2.5"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M14 19a4.5 4.5 0 0 1 7 0"/>`,
  help: `<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.7 2.7 0 1 1 4.6 1.9c-.8.7-1.4 1.1-1.4 2.2"/><circle cx="12" cy="17" r="1" fill="currentColor" stroke="none"/>`,
  history: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`,
  history_edu: `<path d="M4 19h12"/><path d="M5 17V5a2 2 0 0 1 2-2h11v12a2 2 0 0 1-2 2z"/><path d="M8 7h6M8 11h4"/>`,
  home: `<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/>`,
  image: `<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="m21 15-4.5-4.5L8 19"/>`,
  image_edit_auto: `<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m14 8 1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/>`,
  inventory_2: `<path d="M4 8h16l-1.2 11a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8z"/><path d="M3 8l2-4h14l2 4"/><path d="M10 12h4"/>`,
  light_mode: `<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>`,
  lightbulb: `<path d="M9 18h6"/><path d="M10 21h4"/><path d="M8 13a4 4 0 1 1 8 0c0 1.5-.8 2.5-1.7 3.3-.7.6-1.3 1.2-1.3 1.7h-2c0-.5-.6-1.1-1.3-1.7C8.8 15.5 8 14.5 8 13z"/>`,
  logout: `<path d="M15 17l5-5-5-5"/><path d="M20 12H9"/><path d="M11 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>`,
  mark_email_read: `<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/><path d="m9.5 13.5 1.6 1.6 3-3"/>`,
  menu_book: `<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16h-13A2.5 2.5 0 0 0 4.5 21H4z"/><path d="M8 7h8M8 11h8M8 15h5"/>`,
  military_tech: `<path d="m12 3 2.3 4.7L19.5 8l-3.8 3.7.9 5.3L12 14.9 7.4 17l.9-5.3L4.5 8l5.2-.3z"/><path d="M9 18h6"/><path d="M10 21h4"/>`,
  more_vert: `<circle cx="12" cy="6" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="18" r="1.6" fill="currentColor" stroke="none"/>`,
  movie: `<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 5v14M16 5v14M3 10h18M3 14h18"/>`,
  movie_edit: `<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m14 9 1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z"/>`,
  notifications: `<path d="M6 15V11a6 6 0 1 1 12 0v4l2 2H4z"/><path d="M10 19a2 2 0 0 0 4 0"/>`,
  person: `<circle cx="12" cy="8" r="3.2"/><path d="M5 20a7 7 0 0 1 14 0"/>`,
  person_off: `<circle cx="12" cy="8" r="3.2"/><path d="M5 20a7 7 0 0 1 14 0"/><path d="m4 4 16 16"/>`,
  play_arrow: `<path d="M8 6v12l10-6z"/>`,
  playlist_add_check: `<path d="M4 6h10M4 11h10M4 16h6"/><path d="m15.5 15.5 1.8 1.8 3.2-3.2"/>`,
  psychology: `<path d="M12 3a7 7 0 0 0-7 7c0 2.2 1.1 3.5 2 4.5.7.8 1 1.2 1 2V18h8v-1.5c0-.8.3-1.2 1-2 1-1 2-2.3 2-4.5a7 7 0 0 0-7-7z"/><path d="M10 18v2m4-2v2"/>`,
  refresh: `<path d="M20 6v5h-5"/><path d="M4 18v-5h5"/><path d="M19 11a7 7 0 0 0-12-4M5 13a7 7 0 0 0 12 4"/>`,
  search: `<circle cx="11" cy="11" r="6"/><path d="m20 20-3.5-3.5"/>`,
  search_off: `<circle cx="11" cy="11" r="6"/><path d="m20 20-3.5-3.5"/><path d="M4 4l16 16"/>`,
  send: `<path d="M3 20 21 12 3 4l2 7 8 1-8 1z"/>`,
  settings: `<circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a7.8 7.8 0 0 0 .1-6l2-1.2-2-3.4-2.2 1a8 8 0 0 0-5.1-2l-.6-2.4h-4l-.6 2.4a8 8 0 0 0-5.1 2l-2.2-1-2 3.4 2 1.2a7.8 7.8 0 0 0 .1 6l-2 1.2 2 3.4 2.2-1a8 8 0 0 0 5.1 2l.6 2.4h4l.6-2.4a8 8 0 0 0 5.1-2l2.2 1 2-3.4z"/>`,
  share: `<circle cx="18" cy="5" r="2.2"/><circle cx="6" cy="12" r="2.2"/><circle cx="18" cy="19" r="2.2"/><path d="m8 11 7.7-4.6M8 13l7.7 4.6"/>`,
  signal_cellular_4_bar: `<path d="M4 20h2v-3H4zM8 20h2v-6H8zM12 20h2v-9h-2zM16 20h2v-12h-2z"/>`,
  spark: `<path d="M12 3l1.6 3.7L17 8.3l-3.4 1.6L12 13.6l-1.6-3.7L7 8.3l3.4-1.6z"/>`,
  sync: `<path d="M20 6v5h-5"/><path d="M4 18v-5h5"/><path d="M19 11a7 7 0 0 0-12-4M5 13a7 7 0 0 0 12 4"/>`,
  undo: `<path d="M9 7 4 12l5 5"/><path d="M20 12H6"/>`,
  unfold_more: `<path d="m8 10 4-4 4 4M8 14l4 4 4-4"/>`,
  verified: `<path d="m9.5 12.5 1.8 1.8 3.2-3.2"/><circle cx="12" cy="12" r="9"/>`,
  wifi: `<path d="M3.5 9.5a12 12 0 0 1 17 0"/><path d="M6.5 12.5a8 8 0 0 1 11 0"/><path d="M9.5 15.5a4 4 0 0 1 5 0"/><circle cx="12" cy="19" r="1.4" fill="currentColor" stroke="none"/>`,
};

const createIconSvg = (name: string) => {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('material-symbols-svg');
  svg.innerHTML = ICON_MARKUP[name] || ICON_MARKUP.help;
  return svg;
};

const localizeIcons = (root: ParentNode) => {
  const icons = root.querySelectorAll?.('span.material-symbols-outlined');
  if (!icons) return;
  icons.forEach((node) => {
    const current = (node.textContent || '').trim();
    if (!current) return;
    const previous = node.getAttribute('data-icon-name');
    if (previous === current && node.querySelector('svg')) return;
    node.textContent = '';
    node.appendChild(createIconSvg(current));
    node.setAttribute('aria-label', current.replace(/_/g, ' '));
    node.setAttribute('data-icon-name', current);
  });
};

if (document.body) localizeIcons(document);
const iconObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    mutation.addedNodes.forEach((node) => {
      if (node instanceof HTMLElement) {
        localizeIcons(node);
      }
    });
    if (mutation.type === 'characterData' && mutation.target.parentElement) {
      localizeIcons(mutation.target.parentElement);
    }
  }
});
iconObserver.observe(document.body, { childList: true, subtree: true, characterData: true });

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element to mount to");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
