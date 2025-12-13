import express from 'express';
import { 
    getAllTahunAjaran, 
    createTahunAjaran 
} from '../controllers/tahunAjaranController.js'; 
import { protect, admin } from '../middleware/authMiddleware.js'; 

const router = express.Router();


router.route('/')
    .get(protect, admin, getAllTahunAjaran) 
    .post(protect, admin, createTahunAjaran); 

export default router;