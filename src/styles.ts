export const styles = `
.pp-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #5f6368);
  cursor: pointer;
}
.pp-trigger:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.06));
  color: var(--dsw-alias-label-primary, #202124);
}
.pp-trigger[aria-expanded="true"] {
  background: var(--dsw-alias-interactive-bg-active, rgba(0, 0, 0, 0.1));
  color: var(--dsw-alias-label-primary, #202124);
}
.pp-panel {
  position: fixed;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  width: min(380px, calc(100vw - 24px));
  max-height: min(560px, calc(100vh - 24px));
  overflow: hidden;
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.12));
  border-radius: 12px;
  background: var(--dsw-alias-bg-base, #fff);
  color: var(--dsw-alias-label-primary, #202124);
  box-shadow: var(--dsw-elevation-panel, 0 12px 32px rgba(0, 0, 0, 0.18));
  font: 14px/1.5 var(--dsw-font-family, system-ui, sans-serif);
}
.pp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.08));
}
.pp-header strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
}
.pp-header-actions {
  display: flex;
  flex: none;
  gap: 2px;
}
.pp-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #5f6368);
  cursor: pointer;
}
.pp-icon:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.06));
  color: var(--dsw-alias-label-primary, #202124);
}
.pp-icon:focus-visible,
.pp-pick:focus-visible,
.pp-button:focus-visible,
.pp-tag:focus-visible,
.pp-search:focus-visible {
  outline: 2px solid var(--dsw-alias-button-primary-fill, #4d6bfe);
  outline-offset: 1px;
}
.pp-search {
  margin: 8px 12px;
  padding: 8px 10px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.12));
  border-radius: 8px;
  background: var(--dsw-alias-bg-module-platform, transparent);
  color: inherit;
  font: inherit;
  outline: none;
}
.pp-search:focus {
  border-color: var(--dsw-alias-button-primary-fill, #4d6bfe);
}
.pp-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 12px 8px;
}
.pp-tag {
  max-width: 100%;
  padding: 2px 8px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.12));
  border-radius: 999px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #5f6368);
  font: 12px/20px inherit;
  cursor: pointer;
}
.pp-tag[data-active="true"] {
  border-color: transparent;
  background: var(--dsw-alias-button-primary-fill, #4d6bfe);
  color: #fff;
}
.pp-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  margin: 0;
  padding: 0 4px 4px;
  list-style: none;
}
.pp-row {
  display: flex;
  align-items: stretch;
  gap: 2px;
}
.pp-pick {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
}
.pp-pick:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.05));
}
.pp-pick:disabled {
  cursor: default;
  opacity: 0.55;
}
.pp-row-title {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-weight: 600;
}
.pp-row-title-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pp-badge {
  flex: none;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--dsw-alias-markdown-tag, rgba(0, 0, 0, 0.06));
  color: var(--dsw-alias-label-tertiary, #777);
  font-size: 11px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px;
}
.pp-row-body {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--dsw-alias-label-secondary, #5f6368);
  font-size: 13px;
}
.pp-row-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 2px;
}
.pp-row-tags span {
  padding: 0 6px;
  border-radius: 999px;
  background: var(--dsw-alias-markdown-tag, rgba(0, 0, 0, 0.06));
  color: var(--dsw-alias-label-tertiary, #777);
  font-size: 11px;
}
.pp-row-actions {
  display: flex;
  flex: none;
  align-items: center;
}
.pp-empty {
  margin: 16px;
  color: var(--dsw-alias-label-tertiary, #777);
  text-align: center;
}
.pp-footer {
  padding: 6px 12px;
  border-top: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.08));
  color: var(--dsw-alias-label-tertiary, #777);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.pp-footer[data-full='true'] {
  color: var(--dsw-alias-state-error-primary, #d93025);
}
.pp-error {
  margin: 0 12px 8px;
  color: var(--dsw-alias-state-error-primary, #d93025);
  font-size: 12px;
}
.pp-confirm {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 12px;
}
.pp-confirm p {
  margin: 0;
}
.pp-confirm footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.pp-button {
  padding: 5px 10px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.12));
  border-radius: 6px;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.pp-button:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.06));
}
.pp-primary {
  border-color: transparent;
  background: var(--dsw-alias-button-primary-fill, #4d6bfe);
  color: #fff;
}
.pp-primary:hover {
  background: var(--dsw-alias-button-primary-hover, #3d5be0);
}
.pp-danger {
  color: var(--dsw-alias-state-error-primary, #d93025);
}
.pp-editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  overflow: auto;
}
.pp-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--dsw-alias-label-secondary, #5f6368);
  font-size: 12px;
}
.pp-field-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}
.pp-counter {
  color: var(--dsw-alias-label-tertiary, #777);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}
.pp-counter[data-over='true'] {
  color: var(--dsw-alias-state-error-primary, #d93025);
}
.pp-field-error {
  margin: 0;
  color: var(--dsw-alias-state-error-primary, #d93025);
  font-size: 12px;
}
.pp-field input,
.pp-field textarea {
  padding: 8px 10px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.12));
  border-radius: 8px;
  background: var(--dsw-alias-bg-base, #fff);
  color: var(--dsw-alias-label-primary, #202124);
  font: inherit;
  outline: none;
}
.pp-field textarea {
  min-height: 180px;
  resize: vertical;
}
.pp-field input:focus,
.pp-field textarea:focus {
  border-color: var(--dsw-alias-button-primary-fill, #4d6bfe);
}
.pp-hint {
  color: var(--dsw-alias-label-tertiary, #777);
  font-size: 11px;
}
.pp-editor-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
@media (prefers-color-scheme: dark) {
  .pp-panel {
    background: var(--dsw-alias-bg-base, #1c1c1e);
    color: var(--dsw-alias-label-primary, #f2f2f2);
  }
  .pp-field input,
  .pp-field textarea {
    background: var(--dsw-alias-bg-base, #1c1c1e);
  }
}
`
