import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_TIMEOUT = parseInt(process.env.API_TIMEOUT) || 30000;

export async function fetchCountries() {
  try {
    const url = process.env.COUNTRIES_API_URL || 
                'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies';
    
    const response = await axios.get(url, {
      timeout: API_TIMEOUT
    });

    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throw new Error('REST Countries API request timed out');
    }
    throw new Error(`REST Countries API error: ${error.message}`);
  }
}

export async function fetchExchangeRates() {
  try {
    const url = process.env.EXCHANGE_RATE_API_URL || 
                'https://open.er-api.com/v6/latest/USD';
    
    const response = await axios.get(url, {
      timeout: API_TIMEOUT
    });

    return response.data.rates;
  } catch (error) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throw new Error('Exchange Rates API request timed out');
    }
    throw new Error(`Exchange Rates API error: ${error.message}`);
  }
}
