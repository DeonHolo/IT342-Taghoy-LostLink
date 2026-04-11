import API from './api';

const ItemService = {
  /**
   * Get all active items with optional search/filter params.
   */
  async getItems({ search, status, categoryId, dateFrom, dateTo } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (categoryId) params.append('categoryId', categoryId);
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    const res = await API.get(`/items?${params.toString()}`);
    return res.data;
  },

  /**
   * Get a single item by ID.
   */
  async getItemById(id) {
    const res = await API.get(`/items/${id}`);
    return res.data;
  },

  /**
   * Create a new item.
   */
  async createItem(itemData) {
    const res = await API.post('/items', itemData);
    return res.data;
  },

  /**
   * Update an existing item.
   */
  async updateItem(id, itemData) {
    const res = await API.put(`/items/${id}`, itemData);
    return res.data;
  },

  /**
   * Delete an item.
   */
  async deleteItem(id) {
    const res = await API.delete(`/items/${id}`);
    return res.data;
  },

  /**
   * Upload an image for an item.
   */
  async uploadImage(id, file) {
    const formData = new FormData();
    formData.append('image', file);
    const res = await API.post(`/items/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  /**
   * Reveal hidden contact info / dropoff location.
   * This action is logged in the audit trail.
   */
  async revealDetails(id) {
    const res = await API.post(`/items/${id}/reveal`);
    return res.data;
  },

  /**
   * Owner toggles item resolved/unresolved.
   */
  async toggleResolve(id) {
    const res = await API.put(`/items/${id}/resolve`);
    return res.data;
  },

  /**
   * Get the current user's posted items.
   */
  async getMyPosts() {
    const res = await API.get('/items/my-posts');
    return res.data;
  },
};

export default ItemService;
