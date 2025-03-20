import { rateLimit } from 'express-rate-limit';

export class ConfigurationRateLimit {
  private limiterInstance;

  constructor() {
    this.limiterInstance = rateLimit({
      windowMs: 60 * 1000,
      limit: 5,
      standardHeaders: true, // Devuelve info de rate limit en las cabeceras
      legacyHeaders: false,  // Desactiva las cabeceras "X-RateLimit-*"
      handler: (req, res, _options) => {
        res.status(429).json({ 
          error: 'Has alcanzado el límite de peticiones' 
        });
      }
    });
  }

  public get rateLimiter() {
    return this.limiterInstance;
  }
}
