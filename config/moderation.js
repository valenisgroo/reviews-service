export default {
  // Enlaces
  links: {
    rejectAllLinks: true, // Si es true, rechaza cualquier enlace.
    allowedDomains: ['youtube.com', 'amazon.com'],
    suspiciousDomains: [
      'bit.ly',
      'tinyurl.com',
      'goo.gl',
      't.co',
      'short.link',
    ],
  },

  // Palabras prohibidas
  forbiddenWords: ['mierda', 'idiota', 'estafa', 'timo', 'spam', 'imbécil'],
}
