# File Converters

Convert documents between formats directly from VS Code — right-click any supported file and pick a target format.

## Supported Conversions

### From Markdown (.md)

| Target | Command | Key Features |
|--------|---------|--------------|
| **HTML** | Convert Markdown → HTML | Standalone HTML with embedded CSS, images, Mermaid diagrams, style presets |
| **Word** | Convert Markdown → Word | OOXML post-processing, cover page, TOC, style presets, Mermaid/SVG support |
| **PDF** | Convert Markdown → PDF | HTML or LaTeX engine, page sizes, style presets, Mermaid diagrams |
| **PowerPoint** | Convert Markdown → PowerPoint | Heading-based slides, reference templates, embedded images |
| **EPUB** | Convert Markdown → EPUB | E-book with metadata, cover image, TOC |
| **LaTeX** | Convert Markdown → LaTeX | Academic output with bibliography, document classes |
| **Email (.eml)** | Convert Markdown → Email | RFC 5322 format with YAML frontmatter for headers, CID images |
| **Plain Text** | Convert Markdown → Plain Text | Stripped formatting with configurable line wrapping |

### To Markdown

| Source | Command | Key Features |
|--------|---------|--------------|
| **Word (.docx)** | Convert Word → Markdown | Image extraction, pandoc quirk cleanup |
| **HTML (.html)** | Convert HTML → Markdown | Image extraction, GFM support, clean output |
| **PowerPoint (.pptx)** | Convert PowerPoint → Markdown | Slide-to-section mapping, image extraction |

## How to Use

### Right-Click Menu

1. Right-click any `.md`, `.docx`, `.html`, or `.pptx` file in the Explorer
2. Select a conversion option from the **Alex** menu group
3. A terminal opens and runs the conversion
4. The output file appears next to the source file

### Editor Tab Menu

1. Right-click the tab of an open file
2. Select a conversion option from the **Alex** menu group

### Command Palette

1. Press `Ctrl+Shift+P`
2. Type "Alex: Convert"
3. Select the conversion you want
4. The active file is converted

## Requirements

All converters require **pandoc** installed on your system:

| Platform | Install Command |
|----------|----------------|
| Windows | `winget install JohnMacFarlane.Pandoc` |
| macOS | `brew install pandoc` |
| Linux | `sudo apt install pandoc` |

### Optional Dependencies

| Tool | Required For | Install |
|------|-------------|---------|
| **mermaid-cli** | Mermaid diagram rendering | `npm install -g @mermaid-js/mermaid-cli` |
| **wkhtmltopdf** | PDF via HTML engine | `winget install wkhtmltopdf` |
| **MiKTeX / TeX Live** | PDF via LaTeX engine | `winget install MiKTeX.MiKTeX` |

## Converter Options

Each converter supports CLI flags for advanced use. Run any converter with `--help` or no arguments to see options.

### Markdown → Word

```bash
node .github/muscles/md-to-word.cjs README.md --style professional --toc --cover
```

| Flag | Description |
|------|-------------|
| `--style PRESET` | `professional`, `academic`, `course`, `creative` |
| `--toc` | Generate table of contents |
| `--cover` | Add cover page from H1 + metadata |
| `--page-size SIZE` | `letter`, `a4`, `6x9` |
| `--strip-frontmatter` | Remove YAML frontmatter |

### Markdown → PDF

```bash
node .github/muscles/md-to-pdf.cjs README.md --engine html --style professional
```

| Flag | Description |
|------|-------------|
| `--engine ENGINE` | `html` (default, needs wkhtmltopdf) or `latex` (needs MiKTeX) |
| `--style PRESET` | `professional`, `academic`, `minimal` |
| `--toc` | Generate table of contents |
| `--cover` | Add cover page |
| `--page-size SIZE` | `letter`, `a4`, `6x9` |

### Markdown → PowerPoint

```bash
node .github/muscles/md-to-pptx.cjs slides.md --slide-level 2
```

| Flag | Description |
|------|-------------|
| `--slide-level N` | Heading level that creates new slides (default: 2) |
| `--reference-doc PATH` | Custom PowerPoint template |

### Markdown → EPUB

```bash
node .github/muscles/md-to-epub.cjs book.md --toc --cover-image cover.png
```

| Flag | Description |
|------|-------------|
| `--title TITLE` | Book title |
| `--author AUTHOR` | Author name |
| `--cover-image PATH` | Cover image file |
| `--toc` | Generate table of contents |

### Markdown → LaTeX

```bash
node .github/muscles/md-to-latex.cjs paper.md --document-class article --bibliography refs.bib
```

| Flag | Description |
|------|-------------|
| `--document-class CLS` | `article`, `report`, `book`, `memoir` |
| `--font-size SIZE` | `10pt`, `11pt`, `12pt` |
| `--bibliography PATH` | BibTeX file |
| `--csl PATH` | Citation style file |

### Markdown → Email

```bash
node .github/muscles/md-to-eml.cjs newsletter.md
```

Uses YAML frontmatter for email headers:

```yaml
---
from: sender@example.com
to: recipient@example.com
subject: Weekly Update
---
```

### Markdown → Plain Text

```bash
node .github/muscles/md-to-txt.cjs README.md --wrap 80
```

| Flag | Description |
|------|-------------|
| `--wrap N` | Line width (default: 80, 0 = no wrap) |
| `--strip-mermaid` | Remove diagrams |
| `--strip-images` | Remove image references |

## Mermaid Diagram Support

Converters that produce visual output (Word, PDF, HTML, PowerPoint, EPUB) automatically render Mermaid diagrams to PNG images. This requires `mermaid-cli` (`mmdc`) to be installed.

Supported Mermaid diagram types include flowchart, sequence, class, state, ER, Gantt, pie, mindmap, timeline, quadrant, sankey, XY chart, block, architecture, and more (25+ types).

If `mmdc` is not available, diagrams are replaced with a placeholder note.

## Style Presets

The Word, PDF, and HTML converters support style presets that control typography, colors, and layout:

| Preset | Look & Feel |
|--------|-------------|
| **professional** | Segoe UI, blue accents, clean tables — business documents |
| **academic** | Times New Roman, double-spaced — papers and theses |
| **course** | Clean headers, structured sections — training materials |
| **creative** | Modern sans-serif, colorful — presentations and briefs |
| **minimal** | System font, minimal styling — plain output |

Not all presets are available in every converter. Check the converter's `--style` flag for supported options.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "pandoc not found" | Install pandoc: `winget install JohnMacFarlane.Pandoc` |
| "wkhtmltopdf not found" | Install for PDF HTML engine: `winget install wkhtmltopdf` |
| Mermaid diagrams show as placeholders | Install mermaid-cli: `npm i -g @mermaid-js/mermaid-cli` |
| PDF is blank or tiny | Try `--engine latex` instead of the default HTML engine |
| Images missing in output | Ensure images are in the same directory or use `--embed-images` |
| Word formatting looks wrong | Try a different `--style` preset |
