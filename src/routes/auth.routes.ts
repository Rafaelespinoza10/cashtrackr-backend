import { Router } from "express";
import { UserController } from "../controller/UserController";
import { ValidationService } from "../services/ValidationService";
import { UserService } from "../services/UserService";
import { EmailService } from "../services/EmailService";
import { ConfigurationRateLimit } from "../utils/ConfigurationRateLimit";
import { Authorization } from "../middleware/Authorization";

const router = Router();
//limitar al usuario las peticiones
const configurationRateLimit = new ConfigurationRateLimit();
// router.use(configurationRateLimit.rateLimiter); //aplicar a todas las urls

const validationService = new ValidationService();
const userService = new UserService();
const emailService = new EmailService();
const userController = new UserController(validationService, userService, emailService);
const authorization = new Authorization();

router.post('/create-account', userController.createAccount);
router.post('/confirm-account',configurationRateLimit.rateLimiter,  userController.confirmAccount);
router.post('/login', configurationRateLimit.rateLimiter, userController.login);
router.post('/forget-password', userController.forgetPassword);
router.post('/validate-token', configurationRateLimit.rateLimiter, userController.validateToken);
router.post('/reset-password/:token', configurationRateLimit.rateLimiter, userController.resetPasswordWithToken);
router.get('/user', authorization.userAuthorization,  configurationRateLimit.rateLimiter, userController.user);
router.post('/update-password', authorization.userAuthorization, configurationRateLimit.rateLimiter, userController.updatedPasswordUserAuthenticated);
router.post('/check-password', authorization.userAuthorization, userController.checkPassword);
router.put('/update-account', authorization.userAuthorization,  configurationRateLimit.rateLimiter, userController.updateAccount);
export default router;