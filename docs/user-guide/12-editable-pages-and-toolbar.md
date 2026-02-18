# 12 Editable Pages and Toolbar (Admin)

Some pages on the CowboyLogic website support **in-place content editing** using an editor toolbar (similar to a lightweight CMS).

## Who can edit

Only users with these roles can edit page content:

- **Admin**
- **Super Admin**

Everyone else will only see the published content.

## How to edit a page

1. Open a page that supports editing.
2. Click **Edit Page** (near the page title).
3. The page switches into **editing mode**:
   - A rich-text **toolbar** appears above the editor area.
   - The content becomes editable.

## Drafts vs published content

The editor works with two versions of content:

- **Draft**: automatically saved while you work.
- **Published**: the live version everyone sees.

### Auto-save draft

While you type, the editor **auto-saves a draft** after you stop typing for about **1 second**.

When a draft is being saved, you may see a banner like:

- “Saving draft…”

### Manual Save Draft

In editing mode, you can also click **Save Draft** to save immediately.

### Draft banners

Depending on state, the page may show banners such as:

- Draft exists (draft differs from published)
- Previewing draft
- Previewing published

## Preview mode

While editing, click **Preview** to see how the content will look when displayed normally.

- In preview mode the toolbar is hidden.
- Use **Back to edit** to return to editing.

## Publish changes

When you are ready to go live:

1. Click **Publish**.
2. The page validates that the content is not empty.
3. If publish succeeds, the page exits editing/preview and the published version updates.

If the content is empty (no visible text), publishing is blocked and an error message is shown.

## Cancel / discard changes

- Click **Cancel** to exit editing.
- If you have unsaved changes, you will be asked to confirm discarding them.
- Discarding changes restores the last published version and resets the draft back to the published content.

If you try to close/reload the browser tab with unsaved changes, the browser will warn you before leaving.

---

## Toolbar reference

The toolbar actions apply to the current cursor position or selection.

### Text formatting

- **Bold**
- **Italic**
- **Underline**
- **Strikethrough**
- **Superscript**
- **Subscript**

### Alignment

- **Align left**
- **Align center**
- **Align right**

### Font size

Use the **Font size** dropdown to apply sizes like:

- Small
- Normal
- Large
- Huge

(Internally, sizes are converted to consistent inline `font-size` styles.)

### Headings / blocks

Use the **Heading** dropdown:

- Paragraph
- Heading 1 (H1)
- Heading 2 (H2)
- Heading 3 (H3)
- Blockquote
- Preformatted (PRE)

### Lists and tables

- **Bullet list**
- **Numbered list**
- **Insert table** (opens a modal and inserts a table into the content)

### Insert link

- Click **Insert link** and enter a URL.
- If you selected text first, that text becomes the link label.
- If nothing is selected, the URL itself is inserted as the link text.
- If you enter a domain without `http/https`, the editor will prepend `https://`.

For security and consistency:

- Links are forced to open in a new tab (`target="_blank"`) with `rel="noopener noreferrer"`.
- Unsafe links like `javascript:` are removed.

### Insert image

- Click **Insert image** to open the image insert modal.
- You can insert:
  - an image by **URL**, or
  - a **local file upload** (the editor uploads it to the server and inserts the returned URL).
- Optional width/height can be applied (the image also keeps `max-width: 100%` for responsiveness).

### Horizontal line

- **Insert line** adds a horizontal divider (`<hr />`).

### Text color and highlight

- **Text color** (paintbrush icon): sets the text color for selection.
- **Highlight** (highlighter icon): sets the background highlight color for selection.

The available palette is limited to a small set (for consistent styling).

### Undo / redo

- **Undo**
- **Redo**

### Clear formatting vs clear all

- **Clear formatting**: removes formatting from the selection and resets the block to paragraph.
- **Clear all**: clears the entire editor content (requires confirmation).

---

## Pasting content (important)

When you paste content from Word/Google Docs/web pages, the editor sanitizes it:

- Removes scripts, event handlers, and other unsafe content.
- Removes obvious inline colors/backgrounds (to avoid messy styling).
- Preserves only a safe set of tags (text, lists, headings, links, images, tables, etc.).
- Links are normalized to open safely in a new tab.

This keeps the published pages consistent and safer to display.
