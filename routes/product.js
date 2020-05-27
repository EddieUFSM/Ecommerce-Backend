const express = require('express')
const router = express.Router()

const { create, productById, read, remove, update, list, listRelated, listCategory, listBySearch, photo} = require('../controllers/product')
const { requireSignin, isAdmin, isAuth} = require('../controllers/auth')
const { userById } = require('../controllers/user')


router.get('/product/:productId', read)
router.post('/product/create/:userId', requireSignin, isAdmin, isAuth, create)
router.delete('/product/:productId/:userId', requireSignin, isAuth, isAdmin, remove)
router.put('/product/:productId/:userId', requireSignin, isAuth, isAdmin, update)
router.get('/products', list)
router.get('/products/related/:productId', listRelated)
router.get('/products/categories', listCategory)
router.post("/products/by/search", listBySearch)
router.get("/product/photo/:productId", photo);

router.param('userId', userById)
router.param('productId', productById)

module.exports = router;