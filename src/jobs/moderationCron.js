import cron from 'node-cron'
import { moderateAllReviewsBatch } from '../services/review.service.js'
import { CustomError } from '../utils/customError.js'

// Cron job que se ejecuta diariamente a las 02:00 AM
// Formato: segundo minuto hora día mes día_semana
// '0 0 2 * * *' = todos los días a las 2:00 AM
const setupModerationCron = () => {
  console.log('- Configurando cron job de moderación diaria')

  cron.schedule(
    '0 0 2 * * *',
    async () => {
      console.log('- Ejecutando moderación automática diaria')

      try {
        const result = await moderateAllReviewsBatch()
        console.log(
          `Resultado: ${result.totalChecked} revisadas, ${result.totalModerated} rechazadas, ${result.totalApproved} confirmadas`
        )
      } catch (error) {
        console.error('- Error en cron de moderación:', error)
      }
    },
    {
      scheduled: true,
      timezone: 'America/Argentina/Buenos_Aires', // Ajusta tu zona horaria
    }
  )

  console.log(
    '- Cron job de moderación configurado para ejecutarse diariamente a las 2:00 AM'
  )
}

// Para testing manual - ejecutar inmediatamente el cron
export const runModerationNow = async () => {
  console.log('- Ejecutando moderación manual...')
  try {
    const result = await moderateAllReviewsBatch()
    return result
  } catch (error) {
    console.error('- Error en moderación manual:', error)
    throw new CustomError('Error durante la moderación manual', 500)
  }
}

export default setupModerationCron
