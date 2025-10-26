import express from 'express';
const router = express.Router();
import { refreshCountries } from '../controllers/refreshController.js';
import {
  getCountries,
  getCountry,
  deleteCountry,
  getStatus,
  getCountryImage
} from '../controllers/countryController.js';

router.post('/countries/refresh', refreshCountries);
router.get('/status', getStatus);
router.get('/countries/image', getCountryImage);
router.get('/countries', getCountries);
router.get('/countries/:name', getCountry);
router.delete('/countries/:name', deleteCountry);

export default router;
