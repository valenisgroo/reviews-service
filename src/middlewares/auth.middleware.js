import axios from 'axios'
import NodeCache from 'node-cache'

const userCache = new NodeCache({ stdTTL: 3600, checkperiod: 60 }) // cache 1 hora

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization']
  if (!authHeader)
    return res
      .status(401)
      .json({ message: 'El encabezado de autorización no está presente' })

  const token = authHeader.split(' ')[1]
  if (!token)
    return res.status(401).json({ message: 'Formato de token inválido' })

  // Revisar cache local
  let userData = userCache.get(token)
  if (userData) {
    req.user = userData
    return next()
  }

  try {
    const authServiceUrl =
      process.env.AUTH_SERVICE_URL || 'http://localhost:3000'
    const response = await axios.get(`${authServiceUrl}/users/current`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    userData = response.data
    userCache.set(token, userData) // guardamos en cache
    req.user = userData
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Error: token no válido' })
  }
}

// Función para invalidar tokens
export function invalidate(token) {
  userCache.del(token)
  console.log('Token invalidado: ' + token)
}
