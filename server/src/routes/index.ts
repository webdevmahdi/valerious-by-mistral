import { Router } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { authenticate, authorize } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { authLimiter, apiLimiter } from '../middleware/rateLimiter'
import { authController } from '../controllers/auth.controller'
import { catalogController } from '../controllers/catalog.controller'
import { orderController } from '../controllers/order.controller'
import { couponController } from '../controllers/coupon.controller'
import { reviewController } from '../controllers/review.controller'
import { editorialController } from '../controllers/editorial.controller'
import { adminController } from '../controllers/admin.controller'
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  addressSchema,
  productQuerySchema,
  checkoutSchema,
  updateOrderStatusSchema,
  trackingSchema,
  couponSchema,
  reviewSchema,
  productUpsertSchema,
  productPatchSchema,
} from '../validators'
import type { Request, Response } from 'express'

const router = Router()

router.use(apiLimiter)

router.get('/health', (_req: Request, res: Response) => {
  res.json({ success: true, data: { status: 'ok', service: 'valerius-api', version: 'v1' } })
})

const auth = Router()
auth.post('/register', authLimiter, validate(registerSchema), asyncHandler(authController.register))
auth.post('/login', authLimiter, validate(loginSchema), asyncHandler(authController.login))
auth.post('/refresh', validate(refreshSchema), asyncHandler(authController.refresh))
auth.get('/me', authenticate, asyncHandler(authController.me))
auth.get('/addresses', authenticate, asyncHandler(authController.addresses))
auth.post('/addresses', authenticate, validate(addressSchema), asyncHandler(authController.createAddress))
auth.delete('/addresses/:id', authenticate, asyncHandler(authController.removeAddress))
router.use('/auth', auth)

const catalog = Router()
catalog.get('/products', validate(productQuerySchema, 'query'), asyncHandler(catalogController.listProducts))
catalog.get('/products/featured', asyncHandler(catalogController.getFeatured))
catalog.get('/products/new-arrivals', asyncHandler(catalogController.getNewArrivals))
catalog.get('/products/:slug', asyncHandler(catalogController.getProduct))
catalog.get('/products/:slug/related', asyncHandler(catalogController.getRelated))
catalog.get('/categories', asyncHandler(catalogController.listCategories))
catalog.get('/collections', asyncHandler(catalogController.listCollections))
catalog.get('/collections/:slug', asyncHandler(catalogController.getCollection))
router.use('/catalog', catalog)

const orders = Router()
orders.post('/', validate(checkoutSchema), asyncHandler(orderController.checkout))
orders.get('/mine', authenticate, asyncHandler(orderController.myOrders))
orders.get('/:orderNumber', asyncHandler(orderController.track))
router.use('/orders', orders)

const coupons = Router()
coupons.post('/validate', asyncHandler(couponController.validate))
router.use('/coupons', coupons)

const reviews = Router()
reviews.get('/:slug', asyncHandler(reviewController.listForProduct))
reviews.post('/:slug', validate(reviewSchema), asyncHandler(reviewController.create))
router.use('/reviews', reviews)

const editorial = Router()
editorial.get('/', asyncHandler(editorialController.list))
editorial.get('/:slug', asyncHandler(editorialController.bySlug))
router.use('/editorial', editorial)

const admin = Router()
admin.use(authenticate, authorize('ADMIN'))
admin.get('/dashboard', asyncHandler(adminController.dashboard))
admin.get('/orders', asyncHandler(orderController.listAll))
admin.patch('/orders/:orderNumber/status', validate(updateOrderStatusSchema), asyncHandler(orderController.updateStatus))
admin.patch('/orders/:orderNumber/tracking', validate(trackingSchema), asyncHandler(orderController.setTracking))
admin.post('/products', validate(productUpsertSchema), asyncHandler(adminController.createProduct))
admin.patch('/products/:id', validate(productPatchSchema), asyncHandler(adminController.updateProduct))
admin.patch('/products/:id/stock', asyncHandler(adminController.setStock))
admin.get('/coupons', asyncHandler(couponController.list))
admin.post('/coupons', validate(couponSchema), asyncHandler(couponController.create))
admin.patch('/coupons/:code', asyncHandler(couponController.update))
admin.get('/reviews', asyncHandler(reviewController.all))
admin.patch('/reviews/:id', asyncHandler(reviewController.moderate))
admin.get('/editorial', asyncHandler(editorialController.listAll))
admin.post('/editorial', asyncHandler(editorialController.create))
admin.patch('/editorial/:id', asyncHandler(editorialController.update))
router.use('/admin', admin)

export default router
