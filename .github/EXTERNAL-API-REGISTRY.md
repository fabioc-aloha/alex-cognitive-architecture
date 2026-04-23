# External API Registry

Centralized source-of-truth for all external APIs, models, and services referenced in the brain.
When **Last Checked** is older than 30 days, visit the **Source URL** and update the relevant skill/instruction files.

> **Last full audit**: April 23, 2026 — live provider pages validated for Replicate (8 vendors), Microsoft, VS Code, CLI tools.

## Replicate Image Models

| Vendor | Latest Models (Apr 2026) | Source URL | Last Checked | Brain Files |
| --- | --- | --- | --- | --- |
| Black Forest Labs (FLUX 2) | `flux-2-max`, `flux-2-pro`, `flux-2-flex`, `flux-2-dev`, `flux-2-klein-9b/4b` (distilled fast variants), `flux-2-klein-*-base-lora` (training); legacy: `flux-1.1-pro-ultra`, `flux-kontext-max/pro/dev` | <https://replicate.com/black-forest-labs> | Apr 2026 | `skills/image-handling`, `skills/ai-generated-readme-banners`, `skills/ai-character-reference-generation`, `skills/flux-brand-finetune`, `instructions/image-handling`, `instructions/image-generation-guidelines` |
| Google (Imagen / Gemini Image) | `imagen-4`, `imagen-4-ultra`, `imagen-4-fast`, `nano-banana-2`, `nano-banana-pro`, `nano-banana` (Gemini 2.5), `gemini-2.5-flash-image` | <https://replicate.com/google> | Apr 2026 | `skills/image-handling`, `skills/ai-character-reference-generation`, `skills/ai-generated-readme-banners`, `skills/alex-character`, `skills/character-aging-progression`, `instructions/image-handling`, `instructions/image-generation-guidelines` |
| Ideogram | `ideogram-v3-quality`, `ideogram-v3-turbo`, `ideogram-v3-balanced`, `ideogram-character` (consistent character refs), `layerize` (text layer extraction) | <https://replicate.com/ideogram-ai> | Apr 2026 | `skills/image-handling`, `instructions/image-handling` |
| Recraft | `recraft-v4`, `recraft-v4-pro`, `recraft-v4-svg`, `recraft-v4-pro-svg`, `recraft-vectorize`, `recraft-remove-background`, `recraft-crisp-upscale`, `recraft-creative-upscale` | <https://replicate.com/recraft-ai> | Apr 2026 | `skills/image-handling`, `instructions/image-handling` |
| Stability AI | SDXL family (legacy, lower priority for new work) | <https://replicate.com/stability-ai> | Apr 2026 | `skills/image-handling` |
| ByteDance | `seedream-5-lite`, `seedream-4.5`, `seedream-4`, `dreamina-3.1`; character: `dreamactor-m2.0`, `omni-human-1.5`, `flux-pulid` | <https://replicate.com/bytedance> | Apr 2026 | `skills/image-handling` |
| Qwen (Alibaba) | `qwen-image-2-pro`, `qwen-image-2`, `qwen-image-2512`, `qwen-image-edit-2511`, `qwen-image-edit-plus`, `qwen-image-layered`, `qwen-edit-multiangle`, `qwen-image-lora-trainer` | <https://replicate.com/qwen> | Apr 2026 | `skills/image-handling` |
| OpenAI (GPT-Image) | `gpt-image-2` (latest), `gpt-image-1.5`, `gpt-image-1`, `gpt-image-1-mini`, `dall-e-3`, `dall-e-2` | <https://replicate.com/openai> | Apr 2026 | `skills/ai-generated-readme-banners`, `instructions/gamma-presentation` |

## Replicate Video Models

| Vendor | Latest Models (Apr 2026) | Source URL | Last Checked | Brain Files |
| --- | --- | --- | --- | --- |
| Google (Veo) | `veo-3.1`, `veo-3.1-fast`, `veo-3.1-lite` (cost-efficient), `veo-3`, `veo-3-fast`, `veo-2` | <https://replicate.com/google> | Apr 2026 | `skills/video-generation`, `skills/image-handling`, `instructions/video-generation`, `instructions/image-handling` |
| ByteDance (Seedance) | `seedance-2.0` (multimodal w/ native audio), `seedance-2.0-fast`, `seedance-1.5-pro`, `seedance-1-pro`, `seedance-1-lite` | <https://replicate.com/bytedance> | Apr 2026 | `skills/video-generation`, `skills/image-handling`, `instructions/video-generation`, `instructions/image-handling` |
| MiniMax (Hailuo) | `hailuo-2.3` (high-fidelity), `hailuo-2.3-fast`, `hailuo-02`, `hailuo-02-fast` | <https://replicate.com/minimax> | Apr 2026 | `skills/video-generation`, `instructions/video-generation`, `instructions/image-handling` |
| OpenAI (Sora) | `sora-2` (synced audio), `sora-2-pro` | <https://replicate.com/openai> | Apr 2026 | `skills/video-generation`, `instructions/video-generation`, `instructions/image-handling` |
| xAI (Grok) | Grok video models | <https://replicate.com/xai> | Apr 2026 | `instructions/image-handling` |
| Kuaishou (Kling) | Kling video models | <https://replicate.com/kwaivgi> | Apr 2026 | `instructions/image-handling` |
| Wan Video | Wan video models | <https://replicate.com/wan-video> | Apr 2026 | `instructions/image-handling` |

## Replicate TTS / Audio Models

| Vendor | Latest Models (Apr 2026) | Source URL | Last Checked | Brain Files |
| --- | --- | --- | --- | --- |
| MiniMax (Speech) | `speech-2.8-turbo` (40+ languages, voice cloning, emotion), `speech-2.8-hd` (studio-grade), `speech-2.6-hd`, `speech-2.6-turbo`, `voice-cloning` | <https://replicate.com/minimax> | Apr 2026 | `skills/text-to-speech`, `skills/audio-memory`, `instructions/text-to-speech`, `instructions/audio-memory` |
| Resemble AI (Chatterbox) | `chatterbox`, `chatterbox-pro`, `chatterbox-turbo` (fastest open-source TTS), `chatterbox-multilingual` (23 languages), `resemble-enhance`, `watermark` | <https://replicate.com/resemble-ai> | Apr 2026 | `skills/text-to-speech`, `skills/audio-memory`, `instructions/text-to-speech`, `instructions/audio-memory` |
| Qwen (TTS) | `qwen3-tts` (Voice / Clone / Design modes) | <https://replicate.com/qwen> | Apr 2026 | `skills/text-to-speech`, `skills/audio-memory`, `instructions/text-to-speech`, `instructions/audio-memory` |
| Google (Gemini TTS) | `gemini-3.1-flash-tts` (30 voices, 70+ languages) | <https://replicate.com/google> | Apr 2026 | `skills/text-to-speech` |
| OpenAI (Whisper / GPT-4o transcribe) | `whisper`, `gpt-4o-transcribe`, `gpt-4o-mini-transcribe` (STT, not TTS) | <https://replicate.com/openai> | Apr 2026 | `skills/text-to-speech` |

## Replicate Music Generation

| Vendor | Latest Models (Apr 2026) | Source URL | Last Checked | Brain Files |
| --- | --- | --- | --- | --- |
| Google (Lyria) | `lyria-3-pro` (full songs to 3 min), `lyria-3` (30s clips), `lyria-2` (48kHz stereo) | <https://replicate.com/google> | Apr 2026 | `skills/music-generation`, `instructions/music-generation` |
| MiniMax (Music) | `music-2.6`, `music-2.5`, `music-1.5` (full songs to 4 min), `music-01`, `music-cover` (style reimagining) | <https://replicate.com/minimax> | Apr 2026 | `skills/music-generation`, `instructions/music-generation` |

## Replicate LLMs (on-platform inference)

| Vendor | Latest Models (Apr 2026) | Source URL | Last Checked | Brain Files |
| --- | --- | --- | --- | --- |
| OpenAI (GPT) | `gpt-5.4` (flagship), `gpt-5.2`, `gpt-5.1`, `gpt-5-pro`, `gpt-5`, `gpt-5-mini`, `gpt-5-nano`, `gpt-5-structured`, `gpt-4.1`, `gpt-4o`, `gpt-oss-120b/20b` | <https://replicate.com/openai> | Apr 2026 | (referenced ad-hoc) |
| Google (Gemini) | `gemini-3.1-pro`, `gemini-3-pro`, `gemini-3-flash`, `gemini-2.5-flash` | <https://replicate.com/google> | Apr 2026 | (referenced ad-hoc) |

## Replicate Collections (Discovery)

| Collection | Source URL | Purpose |
| --- | --- | --- |
| Text to Image | <https://replicate.com/collections/text-to-image> | Discover new image gen models |
| Text to Speech | <https://replicate.com/collections/text-to-speech> | Discover new TTS models |
| Text to Video | <https://replicate.com/collections/text-to-video> | Discover new video gen models |
| Text to Music | <https://replicate.com/collections/text-to-music> | Discover new music gen models |

## Microsoft APIs

| Service | Source URL | Last Checked | Brain Files |
| --- | --- | --- | --- |
| Microsoft Graph v1.0 | <https://learn.microsoft.com/en-us/graph/api/overview> | Apr 2026 | `skills/microsoft-graph-api`, `skills/enterprise-integration`, `skills/msal-authentication`, `skills/entra-agent-id`, `instructions/microsoft-graph-api` |
| Microsoft Graph Beta | <https://learn.microsoft.com/en-us/graph/use-the-api> | Apr 2026 | `skills/entra-agent-id` |
| MSAL.js 2.x | <https://learn.microsoft.com/en-us/entra/msal/overview> | Apr 2026 | `skills/msal-authentication`, `skills/microsoft-graph-api`, `skills/enterprise-integration`, `skills/entra-agent-id`, `skills/distribution-security`, `instructions/msal-authentication` |
| Entra Agent ID | <https://learn.microsoft.com/en-us/entra/identity-platform/> | Apr 2026 | `skills/entra-agent-id`, `instructions/entra-agent-id` |
| Teams Manifest v1.19 | <https://learn.microsoft.com/en-us/microsoftteams/platform/resources/schema/manifest-schema> | Apr 2026 | `skills/teams-app-patterns`, `skills/m365-agent-debugging`, `instructions/teams-app-patterns`, `instructions/m365-agent-debugging` |
| Declarative Agent Schema v1.6 | <https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/declarative-agent-manifest> | Apr 2026 | `skills/teams-app-patterns`, `skills/m365-agent-debugging`, `skills/foundry-agent-platform`, `instructions/teams-app-patterns` |
| Microsoft Fabric REST API | <https://learn.microsoft.com/en-us/rest/api/fabric/> | Apr 2026 | `skills/microsoft-fabric`, `skills/fabric-notebook-publish`, `instructions/microsoft-fabric` |
| Azure Foundry / AI Studio | <https://learn.microsoft.com/en-us/azure/ai-studio/> | Apr 2026 | `skills/foundry-agent-platform` |
| Azure OpenAI Service | <https://learn.microsoft.com/en-us/azure/ai-services/openai/> | Apr 2026 | `skills/azure-openai-patterns`, `skills/content-safety-implementation`, `skills/sse-streaming` |
| Teams Developer Portal | <https://dev.teams.microsoft.com> | Apr 2026 | `skills/teams-app-patterns`, `instructions/release-process` |
| MCP SDK | <https://github.com/modelcontextprotocol/typescript-sdk/releases> | Apr 2026 | `skills/mcp-development`, `skills/mcp-builder`, `instructions/mcp-development`, `instructions/mcp-builder` |
| MCP Protocol Spec | <https://modelcontextprotocol.io> | Apr 2026 | `skills/mcp-development`, `skills/mcp-builder`, `skills/copilot-sdk`, `skills/chat-participant-patterns`, `instructions/mcp-development`, `instructions/mcp-builder` |

## VS Code APIs

| Service | Source URL | Last Checked | Brain Files |
| --- | --- | --- | --- |
| VS Code API (1.117+) | <https://code.visualstudio.com/updates> | Apr 2026 | `skills/vscode-extension-patterns`, `skills/chat-participant-patterns`, `skills/agent-debug-panel`, `skills/m365-agent-debugging`, `skills/teams-app-patterns` |
| Chat Participant API | <https://code.visualstudio.com/api/extension-guides/chat> | Apr 2026 | `skills/chat-participant-patterns`, `instructions/chat-participant-patterns`, `instructions/copilot-chat-buttons` |
| VS Code Marketplace | <https://marketplace.visualstudio.com/manage> | Apr 2026 | `skills/release-process`, `instructions/vscode-marketplace-publishing` |
| VSCE CLI | <https://github.com/microsoft/vscode-vsce> | Apr 2026 | `skills/release-process`, `skills/vscode-extension-patterns`, `instructions/release-process`, `instructions/release-management`, `instructions/automated-quality-gates`, `instructions/vscode-marketplace-publishing` |
| GitHub Copilot SDK | <https://github.com/github/copilot-sdk> | Apr 2026 | `skills/copilot-sdk` |

## Versioned CLI Tools

| Tool | Source URL | Last Checked | Brain Files |
| --- | --- | --- | --- |
| Pandoc (3.x+) | <https://pandoc.org/releases.html> | Apr 2026 | `skills/book-publishing`, `skills/docx-to-md`, `skills/md-to-word`, `skills/md-to-html`, `skills/md-to-eml`, `skills/converter-qa`, `instructions/docx-to-md` |
| Mermaid.js | <https://github.com/mermaid-js/mermaid/releases> | Apr 2026 | `skills/markdown-mermaid`, `instructions/markdown-mermaid`, `instructions/md-to-html` |
| Chart.js (4.x) | <https://www.chartjs.org/docs/latest/> | Apr 2026 | `skills/dashboard-design`, `skills/data-visualization`, `instructions/data-visualization` |
| PptxGenJS | <https://github.com/gitbrent/PptxGenJS/releases> | Apr 2026 | `skills/pptx-generation`, `skills/presentation-tool-selection` |
| Marp | <https://github.com/marp-team/marp/releases> | Apr 2026 | `skills/presentation-tool-selection` |

## Presentation & Document Generation

| Service | Capability | Source URL | Last Checked | Brain Files |
| --- | --- | --- | --- | --- |
| Gamma API (v0.2) | Text-to-presentation/document/social/webpage; PPTX & PDF export; 30+ AI image models (flux-2-klein → recraft-v4-pro); MCP server | <https://developers.gamma.app/> | Apr 2026 | `skills/gamma-presentation`, `instructions/gamma-presentation`, `muscles/md-to-gamma.cjs`, `muscles/gamma-generator.cjs`, `prompts/gamma` |
| Gamma Help / Cards | Card model, layout templates, agent chat refinement | <https://help.gamma.app/en/> | Apr 2026 | `skills/gamma-presentation` |
| Gamma Prompt Guide | Curated prompt patterns by role (consultants, marketers, educators, sales) | <https://gamma.app/prompts> | Apr 2026 | `skills/gamma-presentation` |

## Other Services

| Service | Source URL | Last Checked | Brain Files |
| --- | --- | --- | --- |
| Brandfetch (logos) | <https://brandfetch.com> | Apr 2026 | `skills/brand-asset-management` |
| Logo.dev (logos) | <https://logo.dev> | Apr 2026 | `skills/brand-asset-management` |
| Azure Bicep/AVM | <https://azure.github.io/Azure-Verified-Modules/> | Apr 2026 | `skills/bicep-avm-mastery`, `skills/infrastructure-as-code`, `skills/azure-architecture-patterns`, `skills/azure-deployment-operations`, `instructions/bicep-avm-mastery`, `instructions/infrastructure-as-code`, `instructions/azure-architecture-patterns` |
| Shields.io (badges) | <https://shields.io> | Apr 2026 | `skills/markdown-mermaid` |
| Replicate MCP | <https://replicate.com/docs/reference/mcp> | Apr 2026 | `instructions/mcp-development` |

## How to Run a Staleness Check

1. Open this file and find any row where **Last Checked** is older than 30 days
2. Visit the **Source URL** and look for new models, API changes, or deprecations
3. Update the **Latest Models** column and the **Brain Files** listed in that row with any changes
4. Update **Last Checked** in this file to the current month/year
5. Update the "Last full audit" date at the top if you did a comprehensive sweep
