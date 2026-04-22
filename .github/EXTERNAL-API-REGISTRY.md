# External API Registry

Centralized source-of-truth for all external APIs, models, and services referenced in the brain.
When **Last Checked** is older than 30 days, visit the **Source URL** and update the relevant skill/instruction files.

## Replicate Image Models

| Vendor | Source URL | Last Checked | Brain Files |
| --- | --- | --- | --- |
| Black Forest Labs (Flux) | <https://replicate.com/black-forest-labs> | Apr 2026 | `skills/image-handling`, `skills/ai-generated-readme-banners`, `skills/ai-character-reference-generation`, `skills/flux-brand-finetune`, `skills/gamma-presentations`, `instructions/image-handling` |
| Google (Imagen, Nano-Banana, Veo) | <https://replicate.com/google> | Apr 2026 | `skills/image-handling`, `skills/ai-character-reference-generation`, `skills/character-aging-progression`, `instructions/image-handling` |
| Ideogram | <https://replicate.com/ideogram-ai> | Apr 2026 | `skills/image-handling`, `instructions/image-handling` |
| Recraft | <https://replicate.com/recraft-ai> | Apr 2026 | `skills/image-handling`, `instructions/image-handling` |
| Stability AI | <https://replicate.com/stability-ai> | Apr 2026 | `skills/image-handling` |
| ByteDance (Seedream) | <https://replicate.com/bytedance> | Apr 2026 | `skills/image-handling` |
| Qwen (Image) | <https://replicate.com/qwen> | Apr 2026 | `skills/image-handling` |
| OpenAI (GPT-Image) | <https://replicate.com/openai> | Apr 2026 | `skills/ai-generated-readme-banners`, `skills/gamma-presentations` |

## Replicate Video Models

| Vendor | Source URL | Last Checked | Brain Files |
| --- | --- | --- | --- |
| Google (Veo) | <https://replicate.com/google> | Apr 2026 | `skills/image-handling`, `instructions/image-handling` |
| xAI (Grok) | <https://replicate.com/xai> | Apr 2026 | `instructions/image-handling` |
| Kuaishou (Kling) | <https://replicate.com/kwaivgi> | Apr 2026 | `instructions/image-handling` |
| OpenAI (Sora) | <https://replicate.com/openai> | Apr 2026 | `instructions/image-handling` |
| Wan Video | <https://replicate.com/wan-video> | Apr 2026 | `instructions/image-handling` |

## Replicate TTS/Audio Models

| Vendor | Source URL | Last Checked | Brain Files |
| --- | --- | --- | --- |
| MiniMax (Speech 2.8) | <https://replicate.com/minimax> | Apr 2026 | `skills/text-to-speech`, `skills/audio-memory`, `skills/image-handling`, `instructions/image-handling` |
| Resemble AI (Chatterbox) | <https://replicate.com/resemble-ai> | Apr 2026 | `skills/text-to-speech`, `skills/audio-memory`, `skills/image-handling`, `instructions/image-handling` |
| Qwen (TTS) | <https://replicate.com/qwen> | Apr 2026 | `skills/text-to-speech`, `skills/audio-memory`, `skills/image-handling`, `instructions/image-handling` |

## Replicate Collections (Discovery)

| Collection | Source URL | Purpose |
| --- | --- | --- |
| Text to Image | <https://replicate.com/collections/text-to-image> | Discover new image gen models |
| Text to Speech | <https://replicate.com/collections/text-to-speech> | Discover new TTS models |
| Text to Video | <https://replicate.com/collections/text-to-video> | Discover new video gen models |

## Microsoft APIs

| Service | Source URL | Last Checked | Brain Files |
| --- | --- | --- | --- |
| Microsoft Graph v1.0 | <https://learn.microsoft.com/en-us/graph/api/overview> | Feb 2026 | `skills/microsoft-graph-api`, `skills/enterprise-integration`, `instructions/microsoft-graph-api` |
| Microsoft Graph Beta | <https://learn.microsoft.com/en-us/graph/use-the-api> | Apr 2026 | `skills/entra-agent-id` |
| MSAL.js 2.x | <https://learn.microsoft.com/en-us/entra/msal/overview> | Feb 2026 | `skills/msal-authentication`, `skills/enterprise-integration` |
| Entra Agent ID | <https://learn.microsoft.com/en-us/entra/identity-platform/> | Apr 2026 | `skills/entra-agent-id`, `instructions/entra-agent-id` |
| Teams Manifest v1.19 | <https://learn.microsoft.com/en-us/microsoftteams/platform/resources/schema/manifest-schema> | Feb 2026 | `skills/teams-app-patterns`, `skills/m365-agent-debugging` |
| Declarative Agent Schema v1.6 | <https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/declarative-agent-manifest> | Apr 2026 | `instructions/teams-app-patterns` |
| Microsoft Fabric REST API | <https://learn.microsoft.com/en-us/rest/api/fabric/> | Apr 2026 | `skills/microsoft-fabric` |
| Azure Foundry / AI Studio | <https://learn.microsoft.com/en-us/azure/ai-studio/> | Apr 2026 | `skills/foundry-agent-platform` |
| Azure OpenAI Service | <https://learn.microsoft.com/en-us/azure/ai-services/openai/> | Apr 2026 | `skills/azure-openai-patterns` |
| Teams Developer Portal | <https://dev.teams.microsoft.com> | Apr 2026 | `skills/teams-app-patterns`, `instructions/release-management` |
| MCP SDK | <https://github.com/modelcontextprotocol/typescript-sdk/releases> | Feb 2026 | `skills/mcp-development`, `instructions/mcp-development` |
| MCP Protocol Spec | <https://modelcontextprotocol.io> | Apr 2026 | `skills/mcp-development`, `skills/mcp-builder`, `skills/copilot-sdk` |

## VS Code APIs

| Service | Source URL | Last Checked | Brain Files |
| --- | --- | --- | --- |
| VS Code API (1.111+) | <https://code.visualstudio.com/updates> | Mar 2026 | `skills/vscode-extension-patterns`, `skills/chat-participant-patterns` |
| Chat Participant API | <https://code.visualstudio.com/api/extension-guides/chat> | Mar 2026 | `skills/chat-participant-patterns`, `instructions/chat-participant-patterns` |
| VS Code Marketplace | <https://marketplace.visualstudio.com/manage> | Apr 2026 | `skills/release-process`, `instructions/vscode-marketplace-publishing` |
| VSCE CLI | <https://github.com/microsoft/vscode-vsce> | Apr 2026 | `skills/release-process`, `instructions/release-management` |
| GitHub Copilot SDK | <https://github.com/github/copilot-sdk> | Apr 2026 | `skills/copilot-sdk` |

## Versioned CLI Tools

| Tool | Source URL | Last Checked | Brain Files |
| --- | --- | --- | --- |
| Pandoc (3.x+) | <https://pandoc.org/releases.html> | Apr 2026 | `skills/book-publishing`, `skills/docx-to-md`, `skills/md-to-word`, `skills/md-to-html`, `skills/md-to-eml` |
| Mermaid.js | <https://github.com/mermaid-js/mermaid/releases> | Apr 2026 | `skills/markdown-mermaid`, `instructions/md-to-html` |
| Chart.js (4.x) | <https://www.chartjs.org/docs/latest/> | Apr 2026 | `skills/dashboard-design`, `skills/data-visualization`, `instructions/data-visualization` |
| PptxGenJS | <https://github.com/gitbrent/PptxGenJS/releases> | Apr 2026 | `skills/pptx-generation`, `skills/presentation-tool-selection` |
| Marp | <https://github.com/marp-team/marp/releases> | Apr 2026 | `skills/presentation-tool-selection` |

## Other Services

| Service | Source URL | Last Checked | Brain Files |
| --- | --- | --- | --- |
| Gamma (presentations) | <https://gamma.app> | Feb 2026 | `instructions/gamma-presentation`, `skills/gamma-presentations` |
| Brandfetch (logos) | <https://brandfetch.com> | Feb 2026 | Extension: VSCODE-BRAIN-INTEGRATION.md |
| Logo.dev (logos) | <https://logo.dev> | Feb 2026 | Extension: VSCODE-BRAIN-INTEGRATION.md |
| Azure Bicep/AVM | <https://azure.github.io/Azure-Verified-Modules/> | Feb 2026 | `skills/bicep-avm-mastery` |
| Shields.io (badges) | <https://shields.io> | Apr 2026 | `skills/markdown-mermaid` |
| Replicate MCP | <https://replicate.com/docs/reference/mcp> | Apr 2026 | `instructions/mcp-development` |

## How to Run a Staleness Check

1. Open this file and find any row where **Last Checked** is older than 30 days
2. Visit the **Source URL** and look for new models, API changes, or deprecations
3. Update the **Brain Files** listed in that row with any changes
4. Update **Last Checked** in this file to the current month/year
