---
type: skill
lifecycle: stable
name: "md-to-eml"
description: "Convert Markdown to RFC 5322 email (.eml) with inline CSS and CID images"
tier: extended
inheritance: inheritable
applyTo: '**/*.eml,**/*email*,**/*newsletter*'
muscle: .github/muscles/md-to-eml.cjs
currency: 2026-04-22
---

# Markdown to Email Conversion

> Write in Markdown, send as professional email — works in any email client

> **Staleness Watch**: See [EXTERNAL-API-REGISTRY.md](../../EXTERNAL-API-REGISTRY.md) for source URLs and recheck cadence

Convert Markdown documents with YAML frontmatter into RFC 5322-compliant `.eml` files ready for governance, newsletter, and stakeholder communication workflows.

---

## When to Use

- Sending formatted content via email clients (Outlook, Thunderbird, etc.)
- Newsletter or governance communication from Markdown sources
- Generating test emails for review before batch sending
- Converting documentation into distributable email format
- Creating email templates with consistent branding
- Stakeholder updates with embedded charts or diagrams

---

## Supported Formatting

| Format | Status | Notes |
|--------|--------|-------|
| **Headings** | ✅ | H1-H6 with inline styles |
| **Bold/Italic** | ✅ | Standard emphasis |
| **Links** | ✅ | Clickable hyperlinks |
| **Images** | ✅ | CID embedded as attachments |
| **Code blocks** | ✅ | Monospace, gray background |
| **Inline code** | ✅ | Highlighted |
| **Tables** | ✅ | HTML tables with borders |
| **Blockquotes** | ✅ | Indented with border |
| **Lists** | ✅ | Ordered and unordered |
| **Mermaid diagrams** | ⚠️ | Table fallback (no JS in email) |
| **Emoji** | ✅ | Unicode preserved |
| **Horizontal rules** | ✅ | Styled dividers |

---

## Key Features

| Feature | Details |
|---------|---------|
| YAML frontmatter | Maps to RFC 5322 headers (To, From, Subject, CC, Reply-To) |
| Email-safe HTML | Inline CSS with table-based layout (no `<style>` blocks) |
| Mermaid fallback | Diagrams converted to ASCII table representation (email-safe) |
| CID images | Local images embedded as base64 multipart MIME attachments |
| Emoji preservation | Subject and body emoji render correctly across clients |
| Test mode | `--test` flag overrides recipients for safe preview |

---

## Usage

```bash
# Basic conversion
node .github/muscles/md-to-eml.cjs newsletter.md

# With test recipient override (safe preview)
node .github/muscles/md-to-eml.cjs newsletter.md --test --test-to me@example.com

# Embed images as CID attachments
node .github/muscles/md-to-eml.cjs update.md --inline-images

# Debug mode (saves intermediate HTML)
node .github/muscles/md-to-eml.cjs update.md --debug
```

---

## Options Reference

| Option | Default | Description |
|--------|---------|-------------|
| `--test` | off | Override recipients for safe preview |
| `--test-to ADDRESS` | frontmatter from | Custom test recipient email |
| `--inline-images` | off | Embed images as base64 CID attachments |
| `--debug` | off | Save intermediate HTML for inspection |

---

## Frontmatter Format

The YAML frontmatter maps directly to RFC 5322 email headers:

```yaml
---
to: team@example.com
from: sender@example.com
subject: 📊 Weekly Update - Sprint 42
cc: manager@example.com
reply-to: noreply@example.com
---
```

| Field | RFC 5322 Header | Required | Notes |
|-------|-----------------|----------|-------|
| `to` | To | ✅ | Primary recipient(s), comma-separated |
| `from` | From | ✅ | Sender address |
| `subject` | Subject | ✅ | Supports emoji |
| `cc` | Cc | ❌ | Carbon copy recipients |
| `reply-to` | Reply-To | ❌ | Reply address if different from From |

---

## Email Client Compatibility

| Client | HTML | Images | Tables | Emoji |
|--------|------|--------|--------|-------|
| **Outlook (Windows)** | ✅ | ✅ CID | ✅ | ✅ |
| **Outlook (Mac)** | ✅ | ✅ CID | ✅ | ✅ |
| **Gmail (Web)** | ✅ | ✅ CID | ✅ | ✅ |
| **Apple Mail** | ✅ | ✅ CID | ✅ | ✅ |
| **Thunderbird** | ✅ | ✅ CID | ✅ | ✅ |
| **Mobile (iOS/Android)** | ✅ | ⚠️ varies | ✅ | ✅ |

---

## Test Mode Workflow

1. **Write** your newsletter/update in Markdown with frontmatter
2. **Convert** with `--test --test-to your@email.com`
3. **Open** the .eml file in your email client
4. **Review** formatting, images, links
5. **Convert again** without `--test` for production
6. **Send** via your email client or automation

---

## Mermaid Diagrams in Email

Email clients cannot execute JavaScript, so Mermaid diagrams are converted to text-based table representations:

```
┌─────────────────┐
│ Original Mermaid │ → Table Fallback
└─────────────────┘

flowchart LR    →   | Step | Description |
  A --> B           | A    | Start       |
  B --> C           | B    | Process     |
                    | C    | End         |
```

For high-fidelity diagrams, pre-render to PNG and include as images.

---

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| "pandoc not found" | pandoc not installed | `winget install pandoc` |
| Images not showing | CID not supported | Use `--inline-images` flag |
| Formatting broken | Client strips styles | Use simpler formatting |
| Large file size | Too many images | Link images instead of embedding |
| Subject truncated | Too long | Keep under 60 characters |
| Emoji not showing | Old email client | Use text alternatives |

---

## Limitations

- Email clients cannot execute JavaScript — Mermaid diagrams use table fallback
- Complex CSS layouts may render differently across clients (Outlook vs Gmail vs Apple Mail)
- Inline images add to email size — consider linking for large image sets
- Some clients strip CSS — design for graceful degradation

---

## Requirements

- Node.js 18+
- pandoc (for Markdown to HTML conversion)
- Shared modules: `markdown-preprocessor.cjs`, `mermaid-pipeline.cjs`

---

## Muscle Script

`.github/muscles/md-to-eml.cjs` (v1.0.0)

---

## Related Skills

- **md-to-html** — Sister converter for web page output
- **md-to-word** — Sister converter for Word document output
- **md-scaffold** — Generate email templates with correct frontmatter
- **lint-clean-markdown** — Pre-validate markdown before conversion

---

*Skill version: 2.0.0 | Last updated: 2026-04-14 | Category: document-conversion*
