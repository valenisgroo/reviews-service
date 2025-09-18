// Utilidad de moderación de comentarios de reviews
// Detecta malas palabras y enlaces sospechosos y devuelve flags para el modelo
import moderationConfig from '../../config/moderation.js'

const { forbiddenWords, links } = moderationConfig

const escapeRegExp = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const hasBadWords = text => {
  const lower = text.toLowerCase()
  return forbiddenWords.some(w =>
    new RegExp(`\\b${escapeRegExp(w)}\\b`, 'i').test(lower)
  )
}

const domainFromUrl = url => {
  try {
    const u = new URL(url.startsWith('http') ? url : `http://${url}`)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

const hasSuspiciousLinks = text => {
  const lower = text.toLowerCase()
  const anyLink = /(https?:\/\/|www\.)\S+/i
  if (!anyLink.test(lower)) return false

  // Política: rechazar todos los enlaces
  if (links.rejectAllLinks) return true

  // Si se permiten algunos dominios, comprobar whitelist/blacklist
  const urls = lower.match(anyLink) || []
  for (const raw of urls) {
    const host = domainFromUrl(raw)
    if (!host) return true
    if (links.suspiciousDomains?.some(d => host.includes(d))) return true
    const allowed = (links.allowedDomains || []).some(d => host.endsWith(d))
    if (!allowed) return true
  }
  return false
}

export const moderateReviewContent = comment => {
  if (hasBadWords(comment)) {
    return {
      isApproved: false,
      isModerated: true,
      moderationReason: 'La reseña contiene lenguaje inapropiado',
    }
  }

  if (hasSuspiciousLinks(comment)) {
    return {
      isApproved: false,
      isModerated: true,
      moderationReason:
        'La reseña contiene enlaces no permitidos o sospechosos',
    }
  }

  return { isApproved: true, isModerated: false, moderationReason: null }
}

export default moderateReviewContent
