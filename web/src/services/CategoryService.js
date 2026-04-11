import API from './api';

const CategoryService = {
  /**
   * Get all categories for dropdown population.
   */
  async getAll() {
    const res = await API.get('/categories');
    return res.data;
  },
};

export default CategoryService;
