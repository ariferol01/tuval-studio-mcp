#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { WebSocketServer } from 'ws';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ASSETS_DIR = path.resolve(__dirname, '../workspace-assets');

// Ensure workspace assets directory exists
if (!fs.existsSync(DEFAULT_ASSETS_DIR)) {
  fs.mkdirSync(DEFAULT_ASSETS_DIR, { recursive: true });
}

/**
 * Automatically resolves any relative or absolute computer file path to a base64 data URL
 * so browser security restrictions never block local images or logos.
 */
function resolveAssetToBase64(filePathOrSrc) {
  if (!filePathOrSrc || typeof filePathOrSrc !== 'string') return filePathOrSrc;
  if (filePathOrSrc.startsWith('data:') || filePathOrSrc.startsWith('http://') || filePathOrSrc.startsWith('https://')) {
    return filePathOrSrc;
  }
  const candidates = [
    filePathOrSrc,
    path.resolve(filePathOrSrc),
    path.join(DEFAULT_ASSETS_DIR, filePathOrSrc),
    path.join(DEFAULT_ASSETS_DIR, path.basename(filePathOrSrc))
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) {
      const ext = path.extname(c).toLowerCase().replace('.', '') || 'png';
      const mime = ext === 'svg' ? 'image/svg+xml' : ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
      const buf = fs.readFileSync(c);
      return `data:${mime};base64,${buf.toString('base64')}`;
    }
  }
  return filePathOrSrc;
}

/* ----------------------------------------------------
   1. LOCAL WEBSOCKET BRIDGE (Browser <-> MCP)
   ---------------------------------------------------- */
const BRIDGE_PORT = 8765;
let browserSocket = null;
const pendingRequests = new Map();
let requestIdCounter = 1;

const wss = new WebSocketServer({ port: BRIDGE_PORT, host: '127.0.0.1' });

wss.on('connection', (ws) => {
  browserSocket = ws;
  console.error(`[Tuval MCP] 🟢 Browser Studio connected on port ${BRIDGE_PORT}`);

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.id && pendingRequests.has(msg.id)) {
        const { resolve } = pendingRequests.get(msg.id);
        pendingRequests.delete(msg.id);
        resolve(msg);
      }
    } catch (err) {
      console.error('[Tuval MCP] Error parsing browser message:', err);
    }
  });

  ws.on('close', () => {
    if (browserSocket === ws) {
      browserSocket = null;
      console.error('[Tuval MCP] ⚪ Browser Studio disconnected');
    }
  });
});

/**
 * Sends a command to the active browser editor tab and waits for the execution result & screenshot
 */
function sendToBrowser(method, params = {}, timeoutMs = 20000) {
  return new Promise(async (resolve, reject) => {
    // If browser is not connected yet, wait up to 15 seconds for browser WebSocket to connect
    if (!browserSocket || browserSocket.readyState !== 1) {
      console.error(`[Tuval MCP] Waiting for browser tab to connect on ws://127.0.0.1:${BRIDGE_PORT}...`);
      let waited = 0;
      while ((!browserSocket || browserSocket.readyState !== 1) && waited < 15000) {
        await new Promise(r => setTimeout(r, 250));
        waited += 250;
      }
    }

    if (!browserSocket || browserSocket.readyState !== 1) {
      reject(new Error(
        'Tuval Studio is not connected! The Tuval editor must be open in the browser at https://tuval.site/editor. If the user does not have this page open, the desktop AI agent must open https://tuval.site/editor in the browser (e.g. using a browser tool or system command such as `start https://tuval.site/editor` or `open https://tuval.site/editor`). Once the tab is loaded, the WebSocket bridge connects automatically.'
      ));
      return;
    }

    const id = `req_${requestIdCounter++}_${Date.now()}`;
    const timer = setTimeout(() => {
      pendingRequests.delete(id);
      reject(new Error(`Timeout waiting for browser execution (${method})`));
    }, timeoutMs);

    pendingRequests.set(id, {
      resolve: (res) => {
        clearTimeout(timer);
        resolve(res);
      }
    });

    browserSocket.send(JSON.stringify({ id, method, params }));
  });
}

/* ----------------------------------------------------
   2. MCP SERVER & TOOL CATALOG
   ---------------------------------------------------- */
const mcpServer = new Server(
  {
    name: 'tuval-studio-mcp',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {},
      prompts: {}
    }
  }
);

/**
 * Define Prompt Templates for AI Agents with Mandatory Quality Control
 */
mcpServer.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: 'design_graphic_pro',
        description: 'Professional visual design workflow with mandatory zero-overflow verification and visual inspection.',
        arguments: [
          {
            name: 'topic',
            description: 'Topic, product, or theme of the design (e.g. "Minimalist Coffee Ad", "YouTube Tech Thumbnail")',
            required: true
          },
          {
            name: 'dimensions',
            description: 'Canvas format/size (e.g. "1080x1080", "1080x1350", "1280x720", "1080x1920")',
            required: false
          }
        ]
      },
      {
        name: 'verify_and_polish_design',
        description: 'Audits the current live canvas, checks all text boundaries and margins, and fixes any clipped or overflowing layers.',
        arguments: []
      },
      {
        name: 'design_multi_page_catalog',
        description: 'Guided multi-page workflow for creating professional product catalogs, corporate brochures, lookbooks, and pitch decks with PDF export.',
        arguments: [
          {
            name: 'catalogTopic',
            description: 'Catalog subject, industry, or product line (e.g. "Minimalist Furniture Collection", "SaaS Pitch Deck", "Fashion Lookbook")',
            required: true
          },
          {
            name: 'pageCount',
            description: 'Number of pages to generate (e.g. 4)',
            required: false
          }
        ]
      }
    ]
  };
});

mcpServer.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'design_graphic_pro') {
    const topic = args?.topic || 'Modern Graphic Design';
    const dim = args?.dimensions || '1080x1080';
    return {
      description: `Professional design workflow for ${topic}`,
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `You are a world-class graphic designer using Tuval Studio MCP.\n\n` +
                  `TASK: Design a stunning, professional graphic for: "${topic}" in ${dim} resolution.\n\n` +
                  `PREREQUISITE:\n` +
                  `0. Tuval Studio must be open in the browser at https://tuval.site/editor. If the bridge is not connected, open https://tuval.site/editor in the user's browser first (e.g. using a system command like "start https://tuval.site/editor" or "open https://tuval.site/editor").\n\n` +
                  `CRITICAL QUALITY & VERIFICATION RULES (MANDATORY):\n` +
                  `1. HIERARCHY & COMPOSITION: Use clean typography, harmonious color palette, high contrast, and balanced negative space.\n` +
                  `2. SAFE MARGINS & BOUNDARY CHECK: Maintain at least a 5-8% safe margin (min 50px-60px padding) from all canvas edges. NO text, headlines, badges, or shapes may ever overflow or touch canvas borders.\n` +
                  `3. TEXT WRAPPING: If headlines or body text are long, reduce fontSize or break into multiple short lines so width fits comfortably.\n` +
                  `4. VISUAL INSPECTION (VISION-IN-THE-LOOP): After executing actions, carefully inspect the returned snapshot image. If you notice any clipping, misaligned elements, or overflow, immediately call "text_update_style" or "layer_transform" to correct them.\n` +
                  `5. FINAL CONFIRMATION: Confirm that the design is 100% verified, perfectly centered, and ready for publication.`
          }
        }
      ]
    };
  }

  if (name === 'verify_and_polish_design') {
    return {
      description: 'Audit and polish the open canvas design',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please audit the current Tuval canvas by calling "studio_get_view".\n` +
                  `Inspect the snapshot image and layer tree:\n` +
                  `1. Check if any text layer extends outside canvas boundaries or touches the border.\n` +
                  `2. Check font size readability, letter contrast against the background, and alignment.\n` +
                  `3. Automatically fix any issues using "text_update_style", "layer_align", or "layer_transform".`
          }
        }
      ]
    };
  }

  if (name === 'design_multi_page_catalog') {
    const topic = args?.catalogTopic || 'Product Catalog';
    const count = parseInt(args?.pageCount || '4') || 4;
    return {
      description: `Multi-Page Catalog Design Workflow for ${topic}`,
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `You are an elite editorial graphic designer and publication specialist creating a multi-page PDF catalog on Tuval Studio.\n\n` +
                  `TASK: Design a complete, cohesive ${count}-page PDF catalog for: "${topic}".\n\n` +
                  `STEP-BY-STEP WORKFLOW:\n` +
                  `0. PREREQUISITE: Tuval Studio must be open in the browser at https://tuval.site/editor. If disconnected, open https://tuval.site/editor in the browser first.\n` +
                  `1. PAGE 1 (Cover Page): Set project title with "project_set_title". Design an eye-catching magazine/catalog cover with bold headline, editorial subhead, brand mark, and high-impact background/imagery.\n` +
                  `2. PAGES 2 to ${count - 1} (Content / Product Showcase): Use "pages_add" to create each subsequent page. Switch to the new page using "pages_switch". Design structured product cards, feature lists, pricing grids, and spec badges.\n` +
                  `3. PAGE ${count} (Back Cover / Contact / CTA): Call "pages_add", design a clean closing page with call-to-action, website, and contact information.\n` +
                  `4. QUALITY AUDIT: Inspect each page for zero-overflow and safe margins (min 50px from all canvas edges).\n` +
                  `5. EXPORT MULTI-PAGE PDF: Call "pdf_export_catalog" with { allPages: true, filename: "${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-catalog" } to deliver the final PDF document to the user.`
          }
        }
      ]
    };
  }

  throw new Error(`Prompt not found: ${name}`);
});

/**
 * Define all 30+ 1:1 UI-parity tools
 */
mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'studio_check_status',
        description: 'Checks whether Tuval Studio is open in the browser and connected to the local WebSocket bridge. If not connected, instructs the AI agent to open https://tuval.site/editor in the user\'s browser.',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'studio_get_view',
        description: 'Captures the current live canvas graphic and layer hierarchy. Returns an image for visual inspection and critique by vision AI models.',
        inputSchema: {
          type: 'object',
          properties: {
            scale: { type: 'number', description: 'Visual capture scale (default 1)', default: 1 }
          }
        }
      },
      {
        name: 'design_audit_layout',
        description: 'Audits the current active canvas for text collisions, layer overlaps, and boundary overflows. Returns actionable recommendations for fixing overlaps and spacing.',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'assets_list_local',
        description: 'Scans and lists all local images, icons, logos, and graphic assets in the workspace-assets directory ready to be placed onto the canvas.',
        inputSchema: {
          type: 'object',
          properties: {
            directory: { type: 'string', description: 'Custom directory path (optional, defaults to workspace-assets)' }
          }
        }
      },
      {
        name: 'canvas_create_new',
        description: 'Creates a new blank canvas with specific dimensions and background color.',
        inputSchema: {
          type: 'object',
          properties: {
            width: { type: 'number', description: 'Canvas width in pixels (e.g. 1080)', default: 1080 },
            height: { type: 'number', description: 'Canvas height in pixels (e.g. 1080)', default: 1080 },
            backgroundColor: { type: 'string', description: 'Hex or RGBA background color (e.g. "#0E1013")', default: '#ffffff' },
            isTransparent: { type: 'boolean', description: 'Whether canvas background is transparent', default: false }
          }
        }
      },
      {
        name: 'canvas_set_dimensions',
        description: 'Changes the dimensions or applies a social media preset (1080x1080 Instagram Post, 1080x1920 Story, 1280x720 YouTube Thumbnail, 1200x630 Facebook/Web Banner).',
        inputSchema: {
          type: 'object',
          properties: {
            width: { type: 'number', description: 'Width in pixels' },
            height: { type: 'number', description: 'Height in pixels' },
            preset: { type: 'string', description: 'Preset name (1080x1080, 1080x1920, 1280x720, 1200x630, 1584x396, 800x800)' }
          }
        }
      },
      {
        name: 'canvas_set_background',
        description: 'Sets the solid background color or enables alpha transparency. NOTE FOR AI DESIGNERS: You are NOT restricted to solid colors! You can search & apply rich background photography, architectural textures, gradients, or pattern grids using "image_add" with { isBackground: true }, or choose from "assets_list_patterns" / "assets_list_stock_pngs" / "assets_list_local".',
        inputSchema: {
          type: 'object',
          properties: {
            color: { type: 'string', description: 'Hex color code (e.g. "#141519", "#6C5CFF")' },
            isTransparent: { type: 'boolean', description: 'Set to true for transparent background' }
          },
          required: ['color']
        }
      },
      {
        name: 'canvas_load_template',
        description: 'Loads a pre-designed layout template onto the canvas (e.g. "social-launch", "neon-sale-story", "youtube-thumbnail", "minimal-post", "bold-thumbnail").',
        inputSchema: {
          type: 'object',
          properties: {
            templateId: { type: 'string', description: 'Template identifier' }
          },
          required: ['templateId']
        }
      },
      {
        name: 'canvas_clear',
        description: 'Clears all layers and objects from the canvas.',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'history_undo',
        description: 'Reverts the canvas to the previous undo history state.',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'history_redo',
        description: 'Redoes the previously undone change.',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'text_add',
        description: 'Adds a typography text layer to the canvas with styling (fonts: Sora, Inter, Playfair Display, Montserrat, Poppins, Space Grotesk, Roboto, etc.).',
        inputSchema: {
          type: 'object',
          properties: {
            text: { type: 'string', description: 'Text content' },
            x: { type: 'number', description: 'X coordinate (center by default)' },
            y: { type: 'number', description: 'Y coordinate (center by default)' },
            type: { type: 'string', enum: ['heading', 'body'], default: 'heading' },
            fontSize: { type: 'number', description: 'Font size in pixels (e.g. 72)' },
            fontFamily: { type: 'string', description: 'Font family name (e.g. "Sora", "Inter", "Playfair Display")', default: 'Sora' },
            fontWeight: { type: 'string', description: 'Font weight (e.g. "400", "600", "800", "900")', default: '800' },
            color: { type: 'string', description: 'Text fill color in hex (e.g. "#FFFFFF", "#6C5CFF")', default: '#141519' },
            align: { type: 'string', enum: ['left', 'center', 'right'], default: 'center' },
            charSpacing: { type: 'number', description: 'Letter spacing (-50 to 250)', default: 0 },
            lineHeight: { type: 'number', description: 'Line height multiplier (e.g. 1.2)', default: 1.2 }
          },
          required: ['text']
        }
      },
      {
        name: 'text_update_style',
        description: 'Updates typography properties of an existing text layer by its layerId.',
        inputSchema: {
          type: 'object',
          properties: {
            layerId: { type: 'string', description: 'Layer ID of the text layer' },
            text: { type: 'string', description: 'New text content' },
            fontSize: { type: 'number', description: 'Font size in pixels' },
            fontFamily: { type: 'string', description: 'Font family name' },
            fontWeight: { type: 'string', description: 'Font weight ("400", "600", "800")' },
            color: { type: 'string', description: 'Hex color' },
            align: { type: 'string', enum: ['left', 'center', 'right'] },
            charSpacing: { type: 'number', description: 'Letter spacing' },
            lineHeight: { type: 'number', description: 'Line height' }
          },
          required: ['layerId']
        }
      },
      {
        name: 'shape_add',
        description: 'Adds a geometric shape to the canvas (rect, rrect, circle, triangle, star, heart). Supports fills, strokes, corner radius, and opacity.',
        inputSchema: {
          type: 'object',
          properties: {
            shapeType: { type: 'string', enum: ['rect', 'rrect', 'circle', 'triangle', 'star', 'heart'], default: 'rect' },
            x: { type: 'number', description: 'X center position' },
            y: { type: 'number', description: 'Y center position' },
            width: { type: 'number', description: 'Width in pixels', default: 320 },
            height: { type: 'number', description: 'Height in pixels', default: 200 },
            fillColor: { type: 'string', description: 'Hex fill color', default: '#6C5CFF' },
            strokeColor: { type: 'string', description: 'Hex stroke border color' },
            strokeWidth: { type: 'number', description: 'Stroke border width in pixels', default: 0 },
            cornerRadius: { type: 'number', description: 'Corner roundness in pixels (rx/ry)', default: 0 },
            opacity: { type: 'number', description: 'Opacity from 0 to 1', default: 1 }
          },
          required: ['shapeType']
        }
      },
      {
        name: 'shape_update_style',
        description: 'Modifies the fill, stroke, corner radius, or opacity of an existing shape layer.',
        inputSchema: {
          type: 'object',
          properties: {
            layerId: { type: 'string', description: 'Layer ID' },
            fillColor: { type: 'string', description: 'Hex fill color' },
            strokeColor: { type: 'string', description: 'Hex stroke color' },
            strokeWidth: { type: 'number', description: 'Stroke width' },
            cornerRadius: { type: 'number', description: 'Corner radius' },
            opacity: { type: 'number', description: 'Opacity (0 to 1)' }
          },
          required: ['layerId']
        }
      },
      {
        name: 'assets_load_from_path',
        description: 'Reads any local image or graphic file from the user computer (absolute path e.g. "C:/Users/name/Desktop/logo.png" or relative path), encodes it to Base64, and returns the data URL for use in canvas.',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: { type: 'string', description: 'Absolute or relative local file path on the computer' }
          },
          required: ['filePath']
        }
      },
      {
        name: 'image_add',
        description: 'Adds an image layer to the canvas. Source can be ANY local file path on the user computer (e.g. "C:/path/to/img.png" or "workspace-assets/photo.jpg"), an external public URL (e.g. Unsplash), or a Base64 data URL. Set isBackground: true to automatically make it a full-bleed background.',
        inputSchema: {
          type: 'object',
          properties: {
            src: { type: 'string', description: 'Local image path on computer, web URL, or Base64 data URL' },
            x: { type: 'number', description: 'X coordinate (defaults to canvas center)' },
            y: { type: 'number', description: 'Y coordinate (defaults to canvas center)' },
            scaleToWidth: { type: 'number', description: 'Scale image to specific width in pixels' },
            angle: { type: 'number', description: 'Rotation angle in degrees', default: 0 },
            opacity: { type: 'number', description: 'Opacity from 0 to 1', default: 1 },
            isBackground: { type: 'boolean', description: 'When true, sends layer to back as a background graphic', default: false }
          },
          required: ['src']
        }
      },
      {
        name: 'image_crop',
        description: 'Crops an image layer with a given aspect ratio (1:1, 4:5, 16:9, 9:16) or custom pixel coordinates.',
        inputSchema: {
          type: 'object',
          properties: {
            layerId: { type: 'string', description: 'Image Layer ID' },
            aspectRatio: { type: 'string', description: 'Aspect ratio preset (e.g. "1:1", "4:5", "16:9", "9:16")' },
            cropX: { type: 'number', description: 'Crop start X' },
            cropY: { type: 'number', description: 'Crop start Y' },
            cropW: { type: 'number', description: 'Crop width' },
            cropH: { type: 'number', description: 'Crop height' }
          },
          required: ['layerId']
        }
      },
      {
        name: 'image_remove_bg_auto',
        description: 'Applies AI 1-click automatic background removal to an image layer by analyzing edges.',
        inputSchema: {
          type: 'object',
          properties: {
            layerId: { type: 'string', description: 'Image Layer ID' }
          },
          required: ['layerId']
        }
      },
      {
        name: 'image_remove_bg_magic',
        description: 'Performs Magic Wand background removal on an image layer by sampling color at click coordinates with tolerance and feather smoothing.',
        inputSchema: {
          type: 'object',
          properties: {
            layerId: { type: 'string', description: 'Image Layer ID' },
            x: { type: 'number', description: 'X click coordinate on canvas' },
            y: { type: 'number', description: 'Y click coordinate on canvas' },
            tolerance: { type: 'number', description: 'Color tolerance (5-150)', default: 32 },
            feather: { type: 'number', description: 'Edge feathering radius (0-15)', default: 2 }
          },
          required: ['layerId']
        }
      },
      {
        name: 'filter_apply_preset',
        description: 'Applies an aesthetic color grading preset to an image layer ("Warm Film", "Cyberpunk", "Moody Noir", "Vintage 70s", "Pastel Soft", "Vivid HDR", "Film Grain", "Normal").',
        inputSchema: {
          type: 'object',
          properties: {
            layerId: { type: 'string', description: 'Image Layer ID' },
            presetName: { type: 'string', enum: ['Warm Film', 'Cyberpunk', 'Moody Noir', 'Vintage 70s', 'Pastel Soft', 'Vivid HDR', 'Film Grain', 'Normal'] }
          },
          required: ['layerId', 'presetName']
        }
      },
      {
        name: 'filter_adjust_values',
        description: 'Manually adjusts color grading sliders on an image layer (brightness, contrast, saturation, hue, blur, noise, sepia, grayscale).',
        inputSchema: {
          type: 'object',
          properties: {
            layerId: { type: 'string', description: 'Image Layer ID' },
            brightness: { type: 'number', description: '-100 to 100' },
            contrast: { type: 'number', description: '-100 to 100' },
            saturation: { type: 'number', description: '-100 to 100' },
            hue: { type: 'number', description: '-180 to 180' },
            blur: { type: 'number', description: '0 to 25' },
            noise: { type: 'number', description: '0 to 100' },
            sepia: { type: 'number', description: '0 to 100' },
            grayscale: { type: 'number', description: '0 to 100' }
          },
          required: ['layerId']
        }
      },
      {
        name: 'layers_get_all',
        description: 'Returns the complete hierarchical list of all objects/layers currently on the canvas with their IDs, positions, and styles.',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'layer_reorder',
        description: 'Reorders a layer in the visual z-index stack ("bring_to_front", "send_to_back", "bring_forward", "send_backward").',
        inputSchema: {
          type: 'object',
          properties: {
            layerId: { type: 'string', description: 'Layer ID' },
            action: { type: 'string', enum: ['bring_to_front', 'send_to_back', 'bring_forward', 'send_backward'] }
          },
          required: ['layerId', 'action']
        }
      },
      {
        name: 'layer_align',
        description: 'Aligns an object to the canvas artboard ("center", "left", "right", "top", "bottom", "center_h", "center_v").',
        inputSchema: {
          type: 'object',
          properties: {
            layerId: { type: 'string', description: 'Layer ID' },
            alignment: { type: 'string', enum: ['center', 'left', 'right', 'top', 'bottom', 'center_h', 'center_v'] }
          },
          required: ['layerId', 'alignment']
        }
      },
      {
        name: 'layer_transform',
        description: 'Transforms a layer: move X/Y, rotate angle, flip horizontally/vertically, set opacity, or change blend mode.',
        inputSchema: {
          type: 'object',
          properties: {
            layerId: { type: 'string', description: 'Layer ID' },
            x: { type: 'number', description: 'New X position' },
            y: { type: 'number', description: 'New Y position' },
            angle: { type: 'number', description: 'Rotation angle in degrees' },
            flipX: { type: 'boolean', description: 'Flip horizontally' },
            flipY: { type: 'boolean', description: 'Flip vertically' },
            opacity: { type: 'number', description: 'Opacity from 0 to 1' },
            blendMode: { type: 'string', enum: ['source-over', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'difference'] }
          },
          required: ['layerId']
        }
      },
      {
        name: 'layer_set_state',
        description: 'Toggles visibility (hide/show), locks/unlocks selection, or renames a layer.',
        inputSchema: {
          type: 'object',
          properties: {
            layerId: { type: 'string', description: 'Layer ID' },
            visible: { type: 'boolean', description: 'Layer visibility' },
            locked: { type: 'boolean', description: 'Lock layer from canvas selection' },
            name: { type: 'string', description: 'Custom layer name' }
          },
          required: ['layerId']
        }
      },
      {
        name: 'layer_duplicate',
        description: 'Duplicates an existing layer and adds the copy to the canvas.',
        inputSchema: {
          type: 'object',
          properties: {
            layerId: { type: 'string', description: 'Layer ID to duplicate' }
          },
          required: ['layerId']
        }
      },
      {
        name: 'layer_delete',
        description: 'Deletes a layer from the canvas.',
        inputSchema: {
          type: 'object',
          properties: {
            layerId: { type: 'string', description: 'Layer ID to delete' }
          },
          required: ['layerId']
        }
      },
      {
        name: 'studio_batch_actions',
        description: 'Executes a sequential batch of multiple canvas actions in one round-trip and returns the final visual screenshot and layer state for rapid design creation.',
        inputSchema: {
          type: 'object',
          properties: {
            actions: {
              type: 'array',
              description: 'Array of actions to execute in order',
              items: {
                type: 'object',
                properties: {
                  action: { type: 'string', description: 'Tool method name (e.g. "text_add", "shape_add", "canvas_set_background")' },
                  params: { type: 'object', description: 'Parameters for the action' }
                },
                required: ['action']
              }
            }
          },
          required: ['actions']
        }
      },
      {
        name: 'studio_export_file',
        description: 'Exports the current graphic to a local image file on the host machine (PNG, JPG, WebP, SVG) with customizable resolution scaling (1x, 2x Retina, 3x Print 300DPI, 4x Ultra HD).',
        inputSchema: {
          type: 'object',
          properties: {
            outputPath: { type: 'string', description: 'Local output file path (e.g. "./final-banner.png" or "C:/output.png")' },
            format: { type: 'string', enum: ['png', 'jpeg', 'webp', 'svg'], default: 'png' },
            scale: { type: 'number', enum: [1, 2, 3, 4], default: 2 },
            quality: { type: 'number', description: 'JPG/WebP quality (0.4 to 1.0)', default: 0.95 }
          },
          required: ['outputPath']
        }
      },
      {
        name: 'project_set_title',
        description: 'Renames the active project title displayed in the top navbar and export filename.',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'New project title (e.g. "Summer Promo 2026")' }
          },
          required: ['title']
        }
      },
      {
        name: 'project_save_local',
        description: 'Saves the current design project state to the browser local storage / cloud session.',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'project_export_download',
        description: 'Triggers the browser to download the current design as PNG, JPEG, SVG, or project JSON.',
        inputSchema: {
          type: 'object',
          properties: {
            format: { type: 'string', enum: ['png', 'jpg', 'svg', 'json'], default: 'png' },
            scale: { type: 'number', enum: [1, 2, 3, 4], default: 2 },
            quality: { type: 'number', description: '0.1 to 1.0', default: 0.95 },
            filename: { type: 'string', description: 'Custom download filename without extension' }
          }
        }
      },
      {
        name: 'canvas_set_gradient',
        description: 'Applies a modern gradient to the canvas background. You can specify a built-in preset ("cyber", "sunset", "emerald", "space", "gold", "candy", "noir") or custom colors array and angle.',
        inputSchema: {
          type: 'object',
          properties: {
            preset: { type: 'string', enum: ['cyber', 'sunset', 'emerald', 'space', 'gold', 'candy', 'noir'], description: 'Preset gradient name' },
            colors: { type: 'array', items: { type: 'string' }, description: 'Array of hex/rgba color stops e.g. ["#6C5CFF", "#FF3366"]' },
            angle: { type: 'number', description: 'Angle in degrees (0 = top to bottom, 90 = left to right, 135 = diagonal)', default: 135 }
          }
        }
      },
      {
        name: 'layer_set_gradient',
        description: 'Applies a gradient fill to an existing text or shape layer by layerId.',
        inputSchema: {
          type: 'object',
          properties: {
            layerId: { type: 'string', description: 'Target Layer ID' },
            preset: { type: 'string', enum: ['cyber', 'sunset', 'emerald', 'space', 'gold', 'candy', 'noir'] },
            colors: { type: 'array', items: { type: 'string' } },
            angle: { type: 'number', description: 'Angle in degrees', default: 135 }
          },
          required: ['layerId']
        }
      },
      {
        name: 'svg_add',
        description: 'Adds an SVG vector graphic, sticker, or badge to the canvas. Key can be from built-in library ("verified-badge", "sale-badge", "star-burst", "cyber-cross", "arrow-swirl", "sparkle-star", "crown-vip", "fire-flame", "quote-marks", "heart-glow", "abstract-blob") or raw SVG string.',
        inputSchema: {
          type: 'object',
          properties: {
            key: { type: 'string', description: 'Built-in SVG sticker key name' },
            svg: { type: 'string', description: 'Raw SVG markup string (if key not provided)' },
            x: { type: 'number', description: 'X position' },
            y: { type: 'number', description: 'Y position' },
            scale: { type: 'number', description: 'Scale factor', default: 1 },
            fill: { type: 'string', description: 'Override fill color in hex' },
            angle: { type: 'number', description: 'Rotation angle in degrees', default: 0 }
          }
        }
      },
      {
        name: 'sticker_add',
        description: 'Alias for svg_add. Adds a sticker or badge vector element to the canvas.',
        inputSchema: {
          type: 'object',
          properties: {
            key: { type: 'string', description: 'Sticker key name (e.g. "verified-badge", "sale-badge", "star-burst", "sparkle-star", "crown-vip", "fire-flame")' },
            x: { type: 'number', description: 'X position' },
            y: { type: 'number', description: 'Y position' },
            scale: { type: 'number', description: 'Scale multiplier', default: 1 }
          },
          required: ['key']
        }
      },
      {
        name: 'assets_list_stickers',
        description: 'Lists all available built-in SVG stickers, badges, and vector elements available for insertion.',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'templates_list',
        description: 'Lists all pre-designed templates across all professional design styles (Bento Grid, Corporate, Branding, Luxury, Minimalist, AI & Tech, Retro 80s, Y2K Rave, Bauhaus, Neobrutalism, Art Deco, Memphis Pop).',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'assets_list_patterns',
        description: 'Lists all built-in geometric pattern and texture background presets (Dot Matrix, Technical Blueprint, Carbon Fiber, Diagonal Stripes, 3D Isometric Wireframe, Topography, Circuit Board).',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'canvas_set_pattern',
        description: 'Applies a patterned or textured geometric background to the canvas artboard.',
        inputSchema: {
          type: 'object',
          properties: {
            patternKey: { type: 'string', enum: ['dots', 'grid', 'carbon', 'diagonal', 'isometric', 'topography', 'circuit'], description: 'Pattern preset identifier' },
            bgColor: { type: 'string', description: 'Custom background base color (hex)' }
          },
          required: ['patternKey']
        }
      },
      {
        name: 'assets_list_stock_pngs',
        description: 'Lists free transparent 3D cutout assets, holographic spheres, lighting flares, and curated royalty-free photography available for instant placement.',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'elements_search',
        description: 'Searches through thousands of copyright-free stock photos, transparent PNG cutouts, SVG vector icons, trust badges, and backgrounds by keywords and category filters.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search term (e.g. "laptop", "neon", "sale", "nature", "abstract", "portrait")' },
            category: { type: 'string', enum: ['all', 'svg', 'bg', 'png', 'cutouts'], default: 'all', description: 'Filter by asset category' },
            page: { type: 'number', description: 'Page number for pagination', default: 1 }
          }
        }
      },
      {
        name: 'element_add_stock',
        description: 'Adds a free copyright-free stock image or cutout to the canvas directly by search query, image URL, or asset key.',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'Direct image URL or search keyword' },
            name: { type: 'string', description: 'Custom layer name' },
            scaleToWidth: { type: 'number', description: 'Target width in pixels', default: 500 }
          },
          required: ['url']
        }
      },
      {
        name: 'layer_set_shadow',
        description: 'Adds or updates drop shadow on a layer (color, blur radius, horizontal/vertical offsets, or quick preset: "soft", "float", "glow", "none").',
        inputSchema: {
          type: 'object',
          properties: {
            layerId: { type: 'string', description: 'Target layer ID' },
            color: { type: 'string', description: 'Shadow color (hex or rgba)', default: 'rgba(0,0,0,0.35)' },
            blur: { type: 'number', description: 'Shadow blur radius (0-80)', default: 15 },
            offsetX: { type: 'number', description: 'Shadow X offset (-50 to 50)', default: 0 },
            offsetY: { type: 'number', description: 'Shadow Y offset (-50 to 50)', default: 8 },
            preset: { type: 'string', enum: ['soft', 'float', 'glow', 'none'] }
          },
          required: ['layerId']
        }
      },
      {
        name: 'brush_draw',
        description: 'Executes freehand brush drawing on the canvas with specific brush style ("pencil", "spray", "circle", "eraser"), color, size, and path coordinates.',
        inputSchema: {
          type: 'object',
          properties: {
            brushStyle: { type: 'string', enum: ['pencil', 'spray', 'circle', 'eraser'], default: 'pencil' },
            color: { type: 'string', description: 'Brush color in hex or rgba', default: '#6C5CFF' },
            size: { type: 'number', description: 'Brush stroke thickness in pixels', default: 14 },
            opacity: { type: 'number', description: 'Opacity percentage (1-100)', default: 100 },
            points: {
              type: 'array',
              description: 'Array of points [{x, y}, ...]',
              items: {
                type: 'object',
                properties: {
                  x: { type: 'number' },
                  y: { type: 'number' }
                }
              }
            }
          }
        }
      },
      // ----------------------------------------------------
      // MULTI-PAGE DOCUMENT & PDF CATALOG TOOLS
      // ----------------------------------------------------
      {
        name: 'pages_list',
        description: 'Returns the full list of pages in the current multi-page document with titles, indices, dimensions, and active status.',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'pages_add',
        description: 'Adds a new page to the document. Ideal for designing multi-page catalogs, product lookbooks, brochures, magazines, and pitch decks.',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Title or label for the page (e.g. "Page 2 - Products Grid", "Features", "Back Cover")' },
            width: { type: 'number', description: 'Page width in pixels (defaults to current canvas width)' },
            height: { type: 'number', description: 'Page height in pixels (defaults to current canvas height)' },
            bgColor: { type: 'string', description: 'Background color hex (default "#ffffff")' },
            copyCurrent: { type: 'boolean', description: 'Whether to clone existing canvas content to the new page as a starting template', default: false },
            switchNow: { type: 'boolean', description: 'Automatically switch active canvas view to the newly created page', default: true }
          }
        }
      },
      {
        name: 'pages_switch',
        description: 'Switches the active canvas view to a specific page index or page ID so the AI agent can design on that page.',
        inputSchema: {
          type: 'object',
          properties: {
            index: { type: 'number', description: '0-based page index to switch to (e.g. 0 for Page 1, 1 for Page 2)' },
            pageId: { type: 'string', description: 'Page ID string (alternative to index)' }
          }
        }
      },
      {
        name: 'pages_duplicate',
        description: 'Duplicates an existing page (including all text, shapes, images, and styling) into a new page immediately following it.',
        inputSchema: {
          type: 'object',
          properties: {
            index: { type: 'number', description: '0-based page index to duplicate (defaults to active page)' }
          }
        }
      },
      {
        name: 'pages_delete',
        description: 'Deletes a page from the document by index (the document must always keep at least 1 page).',
        inputSchema: {
          type: 'object',
          properties: {
            index: { type: 'number', description: '0-based page index to delete' }
          },
          required: ['index']
        }
      },
      {
        name: 'pdf_export_catalog',
        description: 'Compiles all pages (or active page) into a print-ready, high-resolution multi-page PDF document and triggers client-side download.',
        inputSchema: {
          type: 'object',
          properties: {
            filename: { type: 'string', description: 'PDF file name without .pdf extension (e.g. "furniture-catalog-2026")', default: 'tuval-catalog' },
            scale: { type: 'number', enum: [1, 2, 3, 4], description: 'Rendering scale multiplier (1 = Standard 72 DPI, 2 = Retina 150 DPI, 3 = Print 300 DPI, 4 = Maximum)', default: 2 },
            allPages: { type: 'boolean', description: 'Whether to compile all pages into 1 multi-page PDF (true) or active page only (false)', default: true }
          }
        }
      }
    ]
  };
});

/**
 * Handle execution of all MCP Tools
 */
mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // 0. Connection & Bridge Status Tool
    if (name === 'studio_check_status') {
      const isConnected = !!(browserSocket && browserSocket.readyState === 1);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              connected: isConnected,
              editorUrl: 'https://tuval.site/editor',
              instructions: isConnected
                ? 'Tuval Studio is online and connected! You can execute design actions directly on the live canvas.'
                : 'Tuval Studio is NOT currently open in the browser. You (the desktop AI agent) must open https://tuval.site/editor in the user\'s browser (or instruct the user to open it). Once the tab is open, the bridge connects automatically.'
            }, null, 2)
          }
        ]
      };
    }

    // 1. Local Asset Management Tool
    if (name === 'assets_list_local') {
      const targetDir = args?.directory ? path.resolve(args.directory) : DEFAULT_ASSETS_DIR;
      if (!fs.existsSync(targetDir)) {
        return {
          content: [{ type: 'text', text: `Directory not found: ${targetDir}` }]
        };
      }
      const files = fs.readdirSync(targetDir);
      const imageFiles = files.filter(f => /\.(png|jpg|jpeg|webp|svg|gif)$/i.test(f)).map(f => {
        const fullPath = path.join(targetDir, f);
        const stats = fs.statSync(fullPath);
        return {
          filename: f,
          path: fullPath,
          sizeKb: Math.round(stats.size / 1024)
        };
      });

      return {
        content: [{
          type: 'text',
          text: `Found ${imageFiles.length} asset(s) in "${targetDir}":\n` + 
                imageFiles.map(img => `- ${img.filename} (${img.sizeKb} KB, path: ${img.path})`).join('\n')
        }]
      };
    }

    // 1b. Load Any Local Asset From Computer Path
    if (name === 'assets_load_from_path') {
      const filePath = args?.filePath;
      if (!filePath) throw new Error('filePath parameter is required');
      const candidatePath = path.isAbsolute(filePath) ? filePath : (fs.existsSync(filePath) ? path.resolve(filePath) : path.join(DEFAULT_ASSETS_DIR, filePath));
      if (!fs.existsSync(candidatePath)) {
        throw new Error(`File not found on computer: "${candidatePath}"`);
      }
      const ext = path.extname(candidatePath).toLowerCase().replace('.', '') || 'png';
      const mime = ext === 'svg' ? 'image/svg+xml' : ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
      const buffer = fs.readFileSync(candidatePath);
      const dataUrl = `data:${mime};base64,${buffer.toString('base64')}`;
      return {
        content: [{
          type: 'text',
          text: `✅ Asset loaded successfully from computer: "${candidatePath}" (${Math.round(buffer.length / 1024)} KB, MIME: ${mime}).\nYou can place it on canvas using tool "image_add" with src: "${candidatePath}".`
        }]
      };
    }

    // 2. Built-in SVG Stickers & Vector Elements Catalog
    if (name === 'assets_list_stickers') {
      const stickers = [
        { key: 'starburst-badge', name: 'Sale Starburst Badge', category: 'Badge / Promo' },
        { key: 'quality-seal', name: '100% Quality Seal', category: 'Badge / Trust' },
        { key: 'verified-pill', name: 'Verified Shield Badge', category: 'Badge / Trust' },
        { key: 'sparkle-nova', name: 'Nova Glow Sparkle', category: 'Decorative / Flare' },
        { key: 'sparkle-retro', name: '4-Point Retro Flare', category: 'Decorative / Flare' },
        { key: 'lightning-bolt', name: 'Electric Bolt', category: 'Stickers / Hype' },
        { key: 'fire-flame', name: 'Hot Fire Flame', category: 'Stickers / Hype' },
        { key: 'crown-vip', name: 'Luxury VIP Crown', category: 'Luxury / Gamification' },
        { key: 'diamond-gem', name: 'Diamond Crystal', category: 'Luxury / Icons' },
        { key: 'curved-arrow', name: 'Dynamic Growth Arrow', category: 'Callouts / Direction' },
        { key: 'cyber-crosshair', name: 'Cyber HUD Crosshair', category: 'Tech / Bento' },
        { key: 'quote-editorial', name: 'Editorial Quotation Marks', category: 'Typography / Testimonial' }
      ];

      return {
        content: [{
          type: 'text',
          text: `Available Built-in SVG Vector Elements & Stickers (${stickers.length}):\n` +
                stickers.map(s => `- Key: "${s.key}" | ${s.name} [${s.category}]`).join('\n') +
                `\n\nUse tool "svg_add" with { "key": "<key_name>", "x": 540, "y": 540, "scale": 1 } to place any of these directly onto the canvas.`
        }]
      };
    }

    // 3. Design Style Templates Catalog
    if (name === 'templates_list') {
      const templates = [
        { key: 'bento-product-showcase', title: 'Apple-Style Bento Grid Showcase', category: 'Bento Grid', size: '1200x1200' },
        { key: 'corporate-report', title: 'Executive Corporate Briefing', category: 'Corporate', size: '1200x630' },
        { key: 'brand-identity-board', title: 'Brand Identity & Style Tile', category: 'Branding', size: '1080x1080' },
        { key: 'luxury-jewelry', title: 'Haute Luxury Monogram & Gold', category: 'Luxury', size: '1080x1350' },
        { key: 'minimal-nordic-studio', title: 'Minimalist Nordic Architecture', category: 'Minimalist', size: '1080x1080' },
        { key: 'ai-agent-matrix', title: 'AI Neural Agent Swarm Matrix', category: 'Tech & AI', size: '1200x630' },
        { key: 'retro-synthwave-poster', title: '80s Retro Synthwave & Outrun', category: 'Retro & Vintage', size: '1080x1350' },
        { key: 'y2k-cyber-rave', title: 'Y2K Cyber Chrome Rave', category: 'Y2K & Acid', size: '1080x1080' },
        { key: 'bauhaus-geometric', title: 'Bauhaus & Swiss International Style', category: 'Bauhaus & Swiss', size: '1080x1350' },
        { key: 'neobrutalism-badge-card', title: 'Neobrutalism High-Contrast UI', category: 'Neobrutalism', size: '1080x1080' },
        { key: 'art-deco-gilded', title: '1920s Gatsby Art Deco Luxury', category: 'Art Deco', size: '1080x1350' },
        { key: 'memphis-80s-pop', title: 'Memphis Milano 80s Pop Pattern', category: 'Pop Art & 80s', size: '1080x1080' },
        { key: 'social-launch', title: 'Modern Dark SaaS Launch Post', category: 'Social', size: '1080x1080' },
        { key: 'neon-sale-story', title: 'Neon Flash Sale (Story)', category: 'Social / Video', size: '1080x1920' },
        { key: 'youtube-thumbnail', title: 'YouTube Creator Thumbnail', category: 'Video', size: '1280x720' }
      ];

      return {
        content: [{
          type: 'text',
          text: `Available Multi-Style Design Templates (${templates.length}):\n` +
                templates.map(t => `- "${t.key}": ${t.title} [Style: ${t.category}, ${t.size}px]`).join('\n') +
                `\n\nUse tool "canvas_load_template" with { "templateId": "<key_name>" } to load any template.`
        }]
      };
    }

    // 4. Pattern Backgrounds Catalog
    if (name === 'assets_list_patterns') {
      const patterns = [
        { key: 'dots', name: 'Dot Matrix Grid', style: 'Polka dots / UI background' },
        { key: 'grid', name: 'Technical Blueprint Grid', style: 'Architectural / Engineering lines' },
        { key: 'carbon', name: 'Dark Carbon Fiber', style: 'Tactical / High-tech weave' },
        { key: 'diagonal', name: 'Minimal Diagonal Stripes', style: 'Geometric / Subtle hatching' },
        { key: 'isometric', name: '3D Isometric Wireframe', style: 'Futuristic 3D grid' },
        { key: 'topography', name: 'Topographic Contour Lines', style: 'Map / Fluid curves' },
        { key: 'circuit', name: 'Cyberpunk Circuit Board', style: 'Electronic traces & nodes' }
      ];

      return {
        content: [{
          type: 'text',
          text: `Available Pattern Backgrounds (${patterns.length}):\n` +
                patterns.map(p => `- Key: "${p.key}" | ${p.name} (${p.style})`).join('\n') +
                `\n\nUse tool "canvas_set_pattern" with { "patternKey": "<key>" } to apply directly to the canvas.`
        }]
      };
    }

    // 5. Free Transparent PNGs & Stock Photography Catalog
    if (name === 'assets_list_stock_pngs') {
      const stocks = [
        { key: 'glass-sphere-3d', name: '3D Glossy Hologram Sphere', type: 'Transparent 3D Cutout' },
        { key: 'torus-ring-3d', name: '3D Iridescent Torus Ring', type: 'Transparent 3D Cutout' },
        { key: 'neon-cyber-city', name: 'Cyberpunk Futuristic Skyline', type: 'Stock Photo' },
        { key: 'minimal-architecture', name: 'Minimalist Clean Geometry', type: 'Stock Photo' },
        { key: 'abstract-fluid-flow', name: 'Vibrant Fluid Waves', type: 'Stock Photo' },
        { key: 'modern-workspace', name: 'Developer Tech Workspace', type: 'Stock Photo' },
        { key: 'studio-portrait-mood', name: 'Editorial Studio Mood', type: 'Stock Photo' },
        { key: 'gradient-fluid-dark', name: 'Dark Holographic Mesh', type: 'Stock Photo' }
      ];

      return {
        content: [{
          type: 'text',
          text: `Available Free Stock PNGs & Assets (${stocks.length}):\n` +
                stocks.map(s => `- Key: "${s.key}" | ${s.name} [${s.type}]`).join('\n')
        }]
      };
    }

    // 6. Pre-process local image files in image_add and batch_actions
    if (name === 'image_add') {
      if (args?.src) args.src = resolveAssetToBase64(args.src);
      if (args?.url) args.url = resolveAssetToBase64(args.url);
      if (args?.image) args.image = resolveAssetToBase64(args.image);
      if (args?.filePath) args.src = resolveAssetToBase64(args.filePath);
    }

    if (name === 'studio_batch_actions' && Array.isArray(args?.actions)) {
      args.actions.forEach(action => {
        const actName = action.action || action.method;
        if (actName === 'image_add' || actName === 'element_add_stock') {
          const p = action.params || action;
          if (p.src) p.src = resolveAssetToBase64(p.src);
          if (p.url) p.url = resolveAssetToBase64(p.url);
          if (p.image) p.image = resolveAssetToBase64(p.image);
          if (p.filePath) p.src = resolveAssetToBase64(p.filePath);
        }
      });
    }

    // 7. Direct Layout Audit Tool
    if (name === 'design_audit_layout') {
      const resp = await sendToBrowser('design_audit_layout', args);
      const audit = resp.result?.audit || resp.layoutAudit;
      const hasIssues = audit?.hasIssues;
      return {
        content: [
          {
            type: 'text',
            text: hasIssues
              ? `🚨 LAYOUT AUDIT FOUND ${audit.issueCount} ISSUE(S) on ${audit.activePageTitle} (Index: ${audit.activePageIndex}):\n` +
                audit.issues.map(iss => `- ${iss}`).join('\n') +
                `\n\nPlease adjust the overlapping layer coordinates (e.g. using "text_update_style" or "layer_transform") before proceeding to next page.`
              : `✅ PERFECT LAYOUT on ${audit?.activePageTitle || 'Canvas'}: All ${audit?.textLayerCount || 0} text layers and ${audit?.imageLayerCount || 0} images maintain safe margins with ZERO overlaps!`
          }
        ]
      };
    }

    // 3. Export File Handler
    if (name === 'studio_export_file') {
      const { outputPath, format = 'png', scale = 2, quality = 0.95 } = args;
      const resp = await sendToBrowser('studio_get_view', { scale, format, quality });
      if (!resp.snapshot?.base64) {
        throw new Error('Failed to capture canvas snapshot for export');
      }

      const outPath = path.resolve(outputPath);
      const outDir = path.dirname(outPath);
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

      const buffer = Buffer.from(resp.snapshot.base64, 'base64');
      fs.writeFileSync(outPath, buffer);

      return {
        content: [
          {
            type: 'text',
            text: `✅ Graphic exported successfully to "${outPath}" (${resp.snapshot.width} × ${resp.snapshot.height} px, format: ${format.toUpperCase()})`
          }
        ]
      };
    }

    // 4. Send all other tool operations to the browser canvas engine
    const browserResponse = await sendToBrowser(name, args);

    // Format Multimodal Visual Response for the Agent
    const content = [];

    // Attach high-res visual screenshot if available
    if (browserResponse.snapshot?.base64) {
      content.push({
        type: 'image',
        data: browserResponse.snapshot.base64,
        mimeType: browserResponse.snapshot.mimeType || 'image/png'
      });
    }

    // Attach structured layer tree and status text
    let statusSummary = `Action "${name}" executed successfully.\n`;
    const boundsWarnings = [];
    const canvasW = browserResponse.snapshot?.width || 1080;
    const canvasH = browserResponse.snapshot?.height || 1080;

    if (browserResponse.layerTree && Array.isArray(browserResponse.layerTree)) {
      statusSummary += `Current Canvas Layers (${browserResponse.layerTree.length}):\n`;
      browserResponse.layerTree.forEach(l => {
        const w = l.width || 0;
        const h = l.height || 0;
        const left = l.left || 0;
        const top = l.top || 0;
        statusSummary += `- [ID: ${l.id}] ${l.type.toUpperCase()}: "${l.name || l.text || 'Shape'}" (at x:${left}, y:${top}, w:${w}, h:${h})\n`;

        // Check if layer might be clipped or overflowing the canvas
        // Note: For text/shapes centered at x/y or left-aligned, detect boundary crossings
        const rightEdge = left + (w / 2);
        const leftEdge = left - (w / 2);
        const bottomEdge = top + (h / 2);
        const topEdge = top - (h / 2);

        if (leftEdge < -10 || rightEdge > canvasW + 10 || topEdge < -10 || bottomEdge > canvasH + 10) {
          boundsWarnings.push(`⚠️ WARNING: Layer [ID: "${l.id}"] "${l.name || l.text || l.type}" may be overflowing canvas edges (Box: [x:${Math.round(leftEdge)}, y:${Math.round(topEdge)} to x:${Math.round(rightEdge)}, y:${Math.round(bottomEdge)}], Canvas: ${canvasW}x${canvasH}). Check the screenshot and adjust coordinates/fontSize if needed.`);
        }
      });
    }

    // Add Mandatory Quality & Visual Verification Protocol
    statusSummary += `\n🔍 MANDATORY QUALITY & VISUAL VERIFICATION PROTOCOL:\n` +
      `1. INSPECT SCREENSHOT: Carefully analyze the attached visual snapshot image.\n` +
      `2. ZERO-OVERFLOW & MARGIN CHECK: Confirm all headlines, body text, badges, and shapes stay inside canvas safe margins (min 50px padding from edges). No text should ever touch or bleed past canvas boundaries.\n` +
      `3. TEXT WRAPPING & FONT SIZING: If text is clipped or too long, reduce fontSize or break into multiple lines using "text_update_style".\n` +
      `4. POLISH & CONFIRM: If any flaws, overlaps, or contrast issues exist, correct them immediately using "text_update_style", "layer_align", or "layer_transform" before completing your response.\n`;

    if (browserResponse.layoutAudit && Array.isArray(browserResponse.layoutAudit.issues) && browserResponse.layoutAudit.issues.length > 0) {
      statusSummary += `\n🚨 LIVE LAYOUT AUDIT & OVERLAP WARNINGS:\n` +
        browserResponse.layoutAudit.issues.map(iss => `- ${iss}`).join('\n') +
        `\n⚠️ Action Required: Please fix the overlapping layer coordinates before proceeding to the next page.\n`;
    }

    if (boundsWarnings.length > 0) {
      statusSummary += `\n🚨 DETECTED BOUNDARY ALERTS:\n` + boundsWarnings.join('\n') + `\n`;
    }

    content.push({
      type: 'text',
      text: statusSummary
    });

    return { content };
  } catch (err) {
    console.error(`[Tuval MCP] Error executing ${name}:`, err);
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `❌ Error executing tool "${name}": ${err.message || err.toString()}`
        }
      ]
    };
  }
});

/* ----------------------------------------------------
   3. START MCP STDIO SERVER
   ---------------------------------------------------- */
async function startServer() {
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
  console.error('[Tuval MCP] 🚀 Tuval Studio MCP Server started on stdio');
}

startServer().catch((err) => {
  console.error('[Tuval MCP] Fatal startup error:', err);
  process.exit(1);
});
