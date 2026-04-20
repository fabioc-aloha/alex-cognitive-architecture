# Tutorial: Markdown to PDF

*15 minutes · Beginner*

---

## What You'll Build

A professional PDF document from a Markdown source file, with proper formatting, headers, and optional styling.

After this tutorial, you'll be able to convert any Markdown document to a shareable PDF.

---

## 📋 Prerequisites

- Alex installed in VS Code
- A Markdown file you want to convert
- Pandoc installed (Alex will help if it's missing)

---

## Why Markdown to PDF?

Markdown is great for writing — clean, readable, version-controllable. But sometimes you need to share with people who don't use Markdown:

- Sending a report to stakeholders
- Submitting a paper or proposal
- Creating a printable document
- Sharing with non-technical colleagues

---

## 📍 Steps

### Step 1: Prepare Your Markdown

Make sure your document has proper structure:

```markdown
# Document Title

## Introduction

Your content here...

## Section Two

More content...

### Subsection

Details...
```

✅ **Checkpoint**: Your document should have clear heading hierarchy (# for title, ## for sections, ### for subsections).

---

### Step 2: Ask Alex to Convert

Open your Markdown file and ask:

```
Convert this document to PDF
```

Alex will:
1. Check if Pandoc is installed
2. Suggest installation if needed
3. Generate the PDF with sensible defaults

---

### Step 3: Customize the Output (Optional)

If you want more control, specify options:

```
Convert to PDF with:
- A4 paper size
- 1-inch margins
- Table of contents
- Page numbers
```

Alex translates these to Pandoc flags automatically.

---

### Step 4: Review and Iterate

Open the generated PDF. Common adjustments:

- **Too cramped?** Ask for larger margins
- **Missing TOC?** Request table of contents
- **Wrong fonts?** Specify a font family
- **Code looks bad?** Ask for syntax highlighting

```
Regenerate the PDF with larger margins and syntax highlighting
```

---

## 💡 Tips

### Adding a Cover Page

```
Add a cover page with:
- Title: My Report
- Author: Your Name
- Date: Today
```

### Including Images

Images in your Markdown are automatically included:

```markdown
![Architecture Diagram](./images/architecture.png)
```

Make sure paths are relative to the Markdown file.

### Handling Tables

Markdown tables convert cleanly:

```markdown
| Feature | Status |
|---------|--------|
| Auth    | Done   |
| API     | WIP    |
```

---

## ⚠️ Common Issues

### "Pandoc not found"

Alex will offer to help install Pandoc. On Windows:
```
winget install JohnMacFarlane.Pandoc
```

### Images Not Appearing

Check that image paths are correct. Use relative paths from the Markdown file's location.

### Fonts Look Wrong

Pandoc uses system fonts. Specify a common font:
```
Use Arial or Helvetica for the body text
```

---

## What's Next?

- [Writing a Technical Document](TUTORIAL-Technical-Writing.md) — Structure content before converting
- [Your First Custom Instruction](TUTORIAL-First-Instruction.md) — Set default PDF options for your project

---

*Skills used: md-to-word, book-publishing, doc-hygiene*
