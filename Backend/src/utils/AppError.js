class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // خطأ متوقع، مش عطل 
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;