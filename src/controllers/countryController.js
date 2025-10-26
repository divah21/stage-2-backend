import {
  getAllCountries,
  getCountryByName,
  deleteCountryByName,
  getTotalCountries,
  getLastRefreshTimestamp
} from '../services/countryService.js';
import path from 'path';
import fs from 'fs/promises';

export async function getCountries(req, res) {
  try {
    const filters = {
      region: req.query.region,
      currency: req.query.currency,
      sort: req.query.sort
    };

    const countries = await getAllCountries(filters);
    res.status(200).json(countries);
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}

export async function getCountry(req, res) {
  try {
    const { name } = req.params;
    const country = await getCountryByName(name);

    if (!country) {
      return res.status(404).json({
        error: 'Country not found'
      });
    }

    res.status(200).json(country);
  } catch (error) {
    console.error('Error fetching country:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}

export async function deleteCountry(req, res) {
  try {
    const { name } = req.params;
    const deleted = await deleteCountryByName(name);

    if (!deleted) {
      return res.status(404).json({
        error: 'Country not found'
      });
    }

    res.status(200).json({
      message: 'Country deleted successfully',
      name: name
    });
  } catch (error) {
    console.error('Error deleting country:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}

export async function getStatus(req, res) {
  try {
    const totalCountries = await getTotalCountries();
    const lastRefreshedAt = await getLastRefreshTimestamp();

    res.status(200).json({
      total_countries: totalCountries,
      last_refreshed_at: lastRefreshedAt
    });
  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}

export async function getCountryImage(req, res) {
  try {
    const imagePath = path.join(process.cwd(), 'cache', 'summary.png');
    
    try {
      await fs.access(imagePath);
      res.sendFile(imagePath);
    } catch (error) {
      res.status(404).json({
        error: 'Summary image not found'
      });
    }
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}
