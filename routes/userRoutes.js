import express from 'express';
import {
  getAllUsers,
  getUser,
  createUser,
  deleteUser,
  updateUser,
  updateMe,
  deleteMe,
  getMe,
  userPhotoUpload,
  resizeUserPhoto,
} from '../controllers/userController.js';
import {
  signup,
  login,
  forgetPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
  logout,
} from '../controllers/authController.js';

//OWN ROUTER
const usersRouter = express.Router();

//ROUTES

/**
 * @openapi
 * /api/v1/users/signup:
 *   post:
 *     summary: Sign up user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - passwordConfirm
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               passwordConfirm:
 *                 type: string
 *               photo:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Signed up user
 *       409:
 *         description: Conflict
 *       404:
 *         description: Not Found
 *       500:
 *         description: Server Error
 */
usersRouter.post('/signup', signup);
/**
 * @openapi
 * /api/v1/users/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login success
 *       409:
 *         description: Conflict
 *       404:
 *         description: Not Found
 *       500:
 *         description: Server Error
 */
usersRouter.post('/login', login);
usersRouter.get('/logout', logout);
/**
 * @openapi
 * /api/v1/users/forgetPassword:
 *   post:
 *     summary: Forget password
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Token sent to email
 *       409:
 *         description: Conflict
 *       404:
 *         description: Not Found
 *       500:
 *         description: Server Error
 */
usersRouter.post('/forgetPassword', forgetPassword);
/**
 * @openapi
 * /api/v1/users/resetPassword/{token}:
 *   patch:
 *     summary: Reset password
 *     tags:
 *       - Auth
 *     parameters:
 *       - name: token
 *         in: path
 *         description: For auth
 *         required: true
 *         schema:
 *             type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - passwordConfirm
 *             properties:
 *               password:
 *                 type: string
 *               passwordConfirm:
 *                 type: string
 *     responses:
 *       201:
 *         description: Password Reset Done
 *       409:
 *         description: Conflict
 *       404:
 *         description: Not Found
 *       500:
 *         description: Server Error
 */
usersRouter.patch('/resetPassword/:token', resetPassword);
//PROTECTED ROUTES
// usersRouter.use(protect);
/**
 * @openapi
 * /api/v1/users/updatePassword:
 *   patch:
 *     summary: Update password
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - password
 *               - passwordConfirm
 *             properties:
 *               currentPassword:
 *                 type: string
 *               password:
 *                 type: string
 *               passwordConfirm:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Conflict
 *       404:
 *         description: Not Found
 *       500:
 *         description: Server Error
 */
usersRouter.patch('/updatePassword', protect, updatePassword);
/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieves the profile of the currently authenticated user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: You are not logged in! please login to get access
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: No doc found with that ID
 *       properties:
 *         _id:
 *           type: string
 *           example: 67e224ef394738f52f23aac6
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         photo:
 *           type: string
 *           example: default.jpg
 *         role:
 *           type: string
 *           enum: [user, guide, lead-guide, admin]
 *           example: user
 *         active:
 *           type: boolean
 *           example: true
 */
usersRouter.get('/me', getMe, getUser);
/**
 * @openapi
 * /api/v1/users/updateMe:
 *   patch:
 *     summary: Update user itself
 *     tags:
 *        - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               photo:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Conflict
 *       404:
 *         description: Not Found
 *       500:
 *         description: Server Error
 */
usersRouter.patch(
  '/updateMe',
  protect,
  userPhotoUpload,
  resizeUserPhoto,
  updateMe,
);
/**
 * @openapi
 * /api/v1/users/deleteMe:
 *   delete:
 *     summary: Disable user itself
 *     tags:
 *        - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Disable user successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Conflict
 *       404:
 *         description: Not Found
 *       500:
 *         description: Server Error
 */
usersRouter.delete('/deleteMe', deleteMe);
//POST user
/**
 * @openapi
 * /api/v1/users:
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - passwordConfirm
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *               passwordConfirm:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *               photo:
 *                 type: string
 *                 example: "default.jpg"
 *               role:
 *                 type: string
 *                 example: "user"
 *     responses:
 *       201:
 *         description: User created successfully
 *       409:
 *         description: Conflict - Email already exists
 *       404:
 *         description: Not Found
 *       500:
 *         description: Server Error
 */
// usersRouter.use(restrictTo('admin'));
//GET All users
/**
 * @openapi
 * /api/v1/users:
 *   get:
 *     summary: Get all user
 *     tags:
 *        - Users
 *     responses:
 *       200:
 *         description: Retrieval of users
 *       409:
 *         description: Conflict
 *       404:
 *         description: Not Found
 *       500:
 *         description: Server Error
 */

usersRouter.route('/').get(getAllUsers).post(createUser);
//GET a user
/**
 * @openapi
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags:
 *        - Users
 *     parameters:
 *       - in : path
 *         name : id
 *         required : true
 *         schema:
 *            type: string
 *     responses:
 *       200:
 *         description: User get
 *       409:
 *         description: Conflict
 *       404:
 *         description: Not Found
 *       500:
 *         description: Server Error
 */
//UPDATE user
/**
 * @openapi
 * /api/v1/users/{id}:
 *   patch:
 *     summary: Update user
 *     tags:
 *        - Users
 *     parameters:
 *       - in : path
 *         name : id
 *         required : true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               passwordConfirm:
 *                 type: string
 *               photo:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated user successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Conflict
 *       404:
 *         description: Not Found
 *       500:
 *         description: Server Error
 */
//DELETE user
/**
 * @openapi
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags:
 *        - Users
 *     parameters:
 *       - in : path
 *         name : id
 *         required : true
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Conflict
 *       404:
 *         description: Not Found
 *       500:
 *         description: Server Error
 */

usersRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

//multiple users insert
// usersRouter.post('/manyUser', insertManyUser);

export default usersRouter;
