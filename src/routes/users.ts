import express, { Router } from "express";
import UsersController from "../controllers/users";

const router: Router = express.Router();


// GET /users
router.get('/', UsersController.getUsers);
router.get('/:userId', UsersController.getUsers);

// POST /users
router.post('/', UsersController.createUsers);

// PUT /users
router.put('/:userId', UsersController.changeUsers);

// DELETE /users
router.delete('/:userId', UsersController.deleteUsers);


export default router;