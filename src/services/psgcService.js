import axios from 'axios';

// Service for handling Philippine Standard Geographic Code (PSGC) data
// Uses the public PSGC API from the Philippine Statistics Authority

const PSGC_API_BASE_URL = 'https://psgc.gitlab.io/api';

const psgcService = {
  // Get all regions
  async getRegions() {
    try {
      const response = await axios.get(`${PSGC_API_BASE_URL}/regions/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching regions:', error);
      throw error;
    }
  },

  // Get all provinces in a region by region code
  async getProvincesByRegion(regionCode) {
    try {
      const response = await axios.get(`${PSGC_API_BASE_URL}/regions/${regionCode}/provinces/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching provinces for region ${regionCode}:`, error);
      throw error;
    }
  },

  // Get all provinces in the Philippines
  async getAllProvinces() {
    try {
      const response = await axios.get(`${PSGC_API_BASE_URL}/provinces/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all provinces:', error);
      throw error;
    }
  },

  // Get all municipalities/cities in a province by province code
  async getMunicipalitiesByProvince(provinceCode) {
    try {
      const response = await axios.get(`${PSGC_API_BASE_URL}/provinces/${provinceCode}/municipalities/`);
      const municipalities = response.data;
      
      // Also get cities in the province
      const citiesResponse = await axios.get(`${PSGC_API_BASE_URL}/provinces/${provinceCode}/cities/`);
      const cities = citiesResponse.data;
      
      // Combine municipalities and cities
      return [...municipalities, ...cities];
    } catch (error) {
      console.error(`Error fetching municipalities for province ${provinceCode}:`, error);
      throw error;
    }
  },

  // Get all barangays in a municipality by municipality code
  async getBarangaysByMunicipality(municipalityCode) {
    try {
      // First try as municipality
      try {
        const response = await axios.get(`${PSGC_API_BASE_URL}/municipalities/${municipalityCode}/barangays/`);
        return response.data;
      } catch (municipalityError) {
        // If that fails, try as city instead
        try {
          console.log(`Municipality endpoint failed, trying city endpoint for code: ${municipalityCode}`);
          const cityResponse = await axios.get(`${PSGC_API_BASE_URL}/cities/${municipalityCode}/barangays/`);
          return cityResponse.data;
        } catch (cityError) {
          console.error(`Failed to fetch barangays for both municipality and city endpoints for code: ${municipalityCode}`);
          // Return empty array instead of throwing
          return [];
        }
      }
    } catch (error) {
      console.error(`Error fetching barangays for municipality ${municipalityCode}:`, error);
      // Return empty array to prevent UI errors
      return [];
    }
  },

  // Get all barangays in a city by city code
  async getBarangaysByCity(cityCode) {
    try {
      const response = await axios.get(`${PSGC_API_BASE_URL}/cities/${cityCode}/barangays/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching barangays for city ${cityCode}:`, error);
      // Return empty array to prevent UI errors
      return [];
    }
  }
};

export default psgcService; 