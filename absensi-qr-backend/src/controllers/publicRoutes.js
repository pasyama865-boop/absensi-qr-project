import express from 'express';
import { recordScanIn } from '../controllers/absensiController.js';

const router = express.Router();

router.post('/scan-in', recordScanIn); 

export default router;