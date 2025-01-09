class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", errors = []) {
    super(message);

    this.statusCode = statusCode;
    this.data = null;
    this.message = message; // Error message
    this.success = false;
    this.errors = errors;
  }
}

export { ApiError };
