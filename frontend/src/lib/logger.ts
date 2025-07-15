import winston from 'winston';

// 로거 생성 함수들
export function createRealEstateLogger() {
  return winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: 'realestate-api' },
    transports: [
      // 콘솔 출력
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }),
      // 파일 출력 (개발 환경에서만)
      ...(process.env.NODE_ENV !== 'production' ? [
        new winston.transports.File({ 
          filename: 'logs/realestate-error.log', 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: 'logs/realestate-combined.log' 
        })
      ] : [])
    ]
  });
}

export function createNewsLogger() {
  return winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: 'news-api' },
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }),
      ...(process.env.NODE_ENV !== 'production' ? [
        new winston.transports.File({ 
          filename: 'logs/news-error.log', 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: 'logs/news-combined.log' 
        })
      ] : [])
    ]
  });
}

export function createBusLogger() {
  return winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: 'bus-api' },
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }),
      ...(process.env.NODE_ENV !== 'production' ? [
        new winston.transports.File({ 
          filename: 'logs/bus-error.log', 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: 'logs/bus-combined.log' 
        })
      ] : [])
    ]
  });
}

export function createWeatherLogger() {
  return winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: 'weather-api' },
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }),
      ...(process.env.NODE_ENV !== 'production' ? [
        new winston.transports.File({ 
          filename: 'logs/weather-error.log', 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: 'logs/weather-combined.log' 
        })
      ] : [])
    ]
  });
}

// 기본 로거
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'nonhyeon-info-site' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.File({ 
        filename: 'logs/error.log', 
        level: 'error' 
      }),
      new winston.transports.File({ 
        filename: 'logs/combined.log' 
      })
    ] : [])
  ]
}); 