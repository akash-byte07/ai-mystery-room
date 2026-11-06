export function errorHandler(err, req, res, next) { console.error(err); res.status(err.status || 500).json({ message: err.expose ? err.message : 'Something went wrong. Please try again.' }); }
