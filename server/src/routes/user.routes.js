const router = require('express').Router();
const { login, signup, logout, refreshAccessToken, getUser } = require('../controllers/user.controller');
const verifyJWT  = require('../middlewares/authMiddleware')

router.post('/login',login)
router.post('/signup',signup)
router.get('/logout',logout)
router.post('/refresh-token', refreshAccessToken)
router.get('/me', verifyJWT, getUser);

module.exports = router;