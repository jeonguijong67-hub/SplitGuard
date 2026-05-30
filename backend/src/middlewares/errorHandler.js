function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || '서버 오류가 발생했습니다.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({ message: `${req.path} 경로를 찾을 수 없습니다.` });
}

module.exports = { errorHandler, notFoundHandler };