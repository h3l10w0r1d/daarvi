import { client } from './client'

/**
 * Send a message to the Aria outfit assistant.
 * GPT-4o may call tools (generate_outfit, suggest_swap) and return actions
 * alongside the text response.
 *
 * @param {Array<{role, content}>} messages  Full conversation history
 * @param {string} outfitContext             Stringified outfit snapshot
 * @param {string} scope                     'local' | 'global'
 * @returns {Promise<{ message: string, actions: Action[] }>}
 *
 * Action types:
 *   { type: 'DISPLAY_OUTFIT', outfit: OutfitOut }
 *   { type: 'SWAP_ITEM', role: string, product: ProductOut }
 */
export async function callOutfitAssistant({ messages, outfitContext = '', scope = 'global' }) {
  const { data } = await client.post('/chat/outfit-assistant', {
    messages,
    outfit_context: outfitContext,
    scope,
  })
  return data   // { message: string, actions: Action[] }
}
