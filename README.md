# Tuval Studio MCP Server 🎨
### The Graphic Design MCP, AI Design MCP & PDF Generator MCP for AI Agents

[![npm version](https://img.shields.io/npm/v/@ariferol01/tuval-studio-mcp.svg)](https://www.npmjs.com/package/@ariferol01/tuval-studio-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Registry-purple.svg)](https://modelcontextprotocol.io)

**Tuval Studio MCP** is the official **MCP server** for **Tuval Studio** ([tuval.site](https://tuval.site)).

It empowers desktop **AI agents** — including **Claude Desktop**, **Cursor**, **Codex**, **Antigravity**, **Windsurf**, **Cline**, **Roo-Code**, and **OpenCode** — with an autonomous, vision-guided design engine for:
- 🎨 **Graphic Design MCP & AI Design MCP:** Automated vector composition, typography, mesh gradients, and smart layout audits.
- 📄 **PDF Generator MCP & Catalog Generator:** Multi-page PDF catalog generation, magazine layouts, brochures, and pitch decks.
- 📊 **Presentation Generator & Slide Decks:** High-resolution multi-page slide creation with synchronized typography and consistent visual branding.
- 📱 **Social Media Design:** 1-click marketing banners, Instagram stories, YouTube thumbnails, and ads with zero text overflow.

> Looking for a **design MCP**, **PDF MCP**, **catalog MCP**, or **graphic design MCP**? Tuval Studio MCP connects your AI agent directly to an interactive, client-side browser canvas with 100% privacy and real-time visual feedback!

---

## 🌟 Core Features

- **🚀 Zero-Cloud & 100% Private:** Operates entirely in your local browser through a high-speed local WebSocket bridge (`ws://127.0.0.1:8765`). Zero account or server storage required.
- **📚 Multi-Page PDF Catalog Engine:** Autonomous creation, management, and export of multi-page magazines, lookbooks, product brochures, and pitch decks with `pdf_export_catalog`.
- **👁️ Multimodal Vision-in-the-Loop:** Every action returns high-res visual snapshots (Base64 PNG) and layer coordinates so AI agents inspect, critique, and perfect their designs visually.
- **🛡️ Zero-Overflow & Boundary Guard:** Built-in validation protocol ensuring all typography, buttons, and badges maintain safe margins (min 50px) with no clipping.
- **✨ Full Graphic Suite:** Multi-layer vector manipulation, custom Google Fonts (Sora, Inter, Playfair, Cinzel, Syne, etc.), mesh gradients, geometric pattern textures, and 1-click AI background removal.
- **💻 Local File Loading:** Load and composite any local photo, asset, or logo from your computer hard drive directly onto the canvas.

---

## ⚡ Quick Setup for AI Agents

Add the configuration below to your AI agent's MCP settings file:

### 1. Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "tuval-studio": {
      "command": "npx",
      "args": ["-y", "@ariferol01/tuval-studio-mcp@latest"]
    }
  }
}
```

### 2. Cursor, Codex, Antigravity, Windsurf, Cline & Roo-Code
```json
{
  "mcpServers": {
    "tuval-studio": {
      "command": "npx",
      "args": ["-y", "@ariferol01/tuval-studio-mcp@latest"]
    }
  }
}
```

> **How it works:** Open [Tuval Studio](https://tuval.site/editor) in your browser tab. When your AI agent executes design commands, it connects instantly to your active canvas tab!

---

## 🛠️ Complete MCP Tool Catalog

### 1. Document & Multi-Page PDF Engine
| Tool | Description |
| :--- | :--- |
| `pages_list` | Lists all pages in the document with indices, dimensions, and active status. |
| `pages_add` | Creates a new page (blank or cloned template) for catalog & brochure workflows. |
| `pages_switch` | Switches the active canvas viewport to a specific page index (`0, 1, 2...`). |
| `pages_duplicate` | Clones the current page layout and all layers to maintain visual consistency. |
| `pages_delete` | Deletes a page from the document. |
| `pdf_export_catalog` | Compiles all pages into a print-ready, high-resolution multi-page PDF document. |

### 2. Canvas & Artboard Setup
| Tool | Description |
| :--- | :--- |
| `studio_check_status` | Checks connection status and instructs agent to open `https://tuval.site/editor`. |
| `canvas_create_new` | Initializes a blank canvas with custom width, height, and background color. |
| `canvas_set_dimensions` | Applies standard dimensions or social presets (`1080x1080`, `1080x1920`, `1280x720`, `1200x630`). |
| `canvas_set_background` | Sets solid background color, alpha transparency, or full-bleed background textures. |
| `canvas_set_gradient` | Applies mesh gradients (`cyber`, `sunset`, `emerald`, `space`, `gold`, `candy`, `noir`). |
| `canvas_set_pattern` | Applies geometric textures (`dots`, `grid`, `carbon`, `isometric`, `topography`, `circuit`). |
| `canvas_load_template` | Loads curated design templates (`neon-sale-story`, `social-launch`, `youtube-thumbnail`). |
| `canvas_clear` | Clears all objects from the current canvas. |

### 3. Typography & Vector Shapes
| Tool | Description |
| :--- | :--- |
| `text_add` | Adds text with Google Fonts (`Sora`, `Inter`, `Playfair Display`, `Bebas Neue`, `Cinzel`, `Syne`). |
| `text_update_style` | Updates font family, font size, color, letter spacing, line height, text align, and content. |
| `shape_add` | Inserts geometric shapes (`rect`, `circle`, `triangle`, `star`, `hexagon`, `heart`, `pill`, `badge`). |
| `shape_update_style` | Modifies shape fill color, border stroke, corner radius (`rx/ry`), opacity, and shadow. |
| `svg_add` | Places curated badges, trust stickers, flares, stars, and callouts onto the canvas. |

### 4. Images, Media & Local Assets
| Tool | Description |
| :--- | :--- |
| `assets_load_from_path` | Reads an image from the user's local hard drive and converts it for instant canvas placement. |
| `assets_list_local` | Scans and lists local images and logos available in the workspace. |
| `image_add` | Inserts an image from URL, local file path, or Base64 (supports `{ isBackground: true }`). |
| `image_crop` | Crops images by bounding box coordinates or aspect ratio. |
| `image_remove_bg_auto` | 1-click client-side background remover. |
| `image_remove_bg_magic` | Magic wand background extraction with configurable color tolerance. |
| `filter_apply_preset` | Applies aesthetic color grading (`Warm Film`, `Cyberpunk`, `Moody Noir`, `Vivid HDR`, `Film Grain`). |

### 5. Layer Management, Layout Audit & Vision Inspection
| Tool | Description |
| :--- | :--- |
| `design_audit_layout` | Automated zero-overflow and collision audit across all text and image layers. |
| `studio_get_view` | Captures high-res canvas snapshot (Base64 PNG) & layer tree for visual AI audit. |
| `layer_reorder` | Moves layers in stack (`bring_to_front`, `send_to_back`, `bring_forward`, `send_backward`). |
| `layer_align` | Aligns layers to canvas center, left, right, top, or bottom. |
| `layer_transform` | Adjusts rotation angle, flip X/Y, opacity, drop shadow, and blend modes. |
| `layer_duplicate` / `layer_delete` | Duplicates or removes specific layers. |
| `studio_batch_actions` | Executes sequential multi-step commands in a single atomic call. |
| `project_set_title` | Renames the design project. |
| `project_export_download` | Triggers browser download for PNG, JPG, WebP, or SVG graphics. |

---

## 🎯 Example Prompts for AI Agents (Claude, Cursor, Codex, Antigravity)

### 1. Multi-Page Product Catalog & PDF Generation
> *"Use Tuval Studio MCP to create a 4-page modern Scandinavian furniture catalog. Design an editorial cover on Page 1, a product grid with pricing on Pages 2 and 3, and contact/order details on Page 4. Inspect each page with vision audit for safe margins and export the final multi-page PDF."*

### 2. Social Media Design & Banner Generation
> *"Design a high-contrast Cyberpunk social media ad banner (1080x1080) for a product launch. Apply dark gradient backgrounds, bold typography, neon callout badges, and verify with design_audit_layout that no text overflows boundaries."*

### 3. Presentation Generator & Pitch Decks
> *"Build a 5-slide pitch deck presentation in Tuval Studio. Maintain brand colors, modern typography hierarchy, clean card layouts, and export the entire deck as a print-ready PDF."*

---

## 🔍 Tags & Keywords
`Tuval Studio MCP` · `MCP server` · `graphic design MCP` · `AI design MCP` · `PDF generator MCP` · `PDF MCP` · `design MCP` · `catalog MCP` · `catalog generator` · `presentation generator` · `social media design` · `AI agents` · `Claude` · `Cursor` · `Codex` · `Antigravity`

---

## 📄 License

MIT © [Tuval Studio](https://tuval.site)
