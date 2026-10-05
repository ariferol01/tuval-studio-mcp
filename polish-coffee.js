import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function polish() {
  const transport = new StdioClientTransport({ command: 'node', args: [path.join(__dirname, 'index.js')] });
  const client = new Client({ name: 'polish-client', version: '1.0.0' }, { capabilities: {} });
  await client.connect(transport);

  const layersRes = await client.callTool({ name: 'layers_get_all', arguments: {} });
  const txt = layersRes.content?.find(c => c.type === 'text')?.text || '';
  console.log(txt.slice(0, 2000));

  // Find manifesto layer id from text dump or via result
  // layers_get_all returns via browserResponse.layerTree in text summary - parse IDs
  // Fallback: use studio_batch_actions to reorder by searching? We'll list via regex
  const ids = [...txt.matchAll(/\[ID:\s*([^\]]+)\][^\n]*Tek köken[^\n]*/g)].map(m => m[1].trim());
  console.log('Manifesto IDs:', ids);

  let targetId = ids[0];
  if (!targetId) {
    // try alternative: find layer containing "Tek" via full layerTree from image? Use batch to bring all texts forward? Instead get via direct call result parsing
    // The tool returns layerTree in a structured way? In MCP server, layers_get_all goes via sendToBrowser and returns layerTree in text only. Parse all I-TEXT lines
    const allTextLines = [...txt.matchAll(/\[ID:\s*([^\]]+)\]\s*I-TEXT:\s*"([^"]+)"/g)];
    console.log('All texts:', allTextLines.map(m => m[2]).slice(0, 20));
    const found = allTextLines.find(m => m[2].includes('Tek'));
    if (found) targetId = found[1].trim();
  }
  console.log('Target:', targetId);
  if (!targetId) { await client.close(); process.exit(2); }

  await client.callTool({ name: 'layer_reorder', arguments: { layerId: targetId, action: 'bring_to_front' } });
  await client.callTool({ name: 'layer_transform', arguments: { layerId: targetId, x: 540, y: 588 } });

  const view = await client.callTool({ name: 'studio_batch_actions', arguments: { actions: [] } });
  const img = view.content?.find(c => c.type === 'image');
  if (img?.data) fs.writeFileSync(path.join(__dirname, '../workspace-assets/sade-kahve-minimal-afis.png'), Buffer.from(img.data, 'base64'));

  const exp = await client.callTool({ name: 'studio_export_file', arguments: { outputPath: 'G:/xampp/htdocs/graph-tool/workspace-assets/sade-kahve-minimal-afis-export.png', format: 'png', scale: 2 } });
  console.log(exp.content?.[0]?.text);
  await client.close();
  process.exit(0);
}
polish().catch(e => { console.error(e); process.exit(1); });
