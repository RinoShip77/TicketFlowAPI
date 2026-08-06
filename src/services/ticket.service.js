import ticketRepository from '../repositories/ticket.repository.js';

export const getAll = async (filters = {}) => {
  // 1. Logique de formatage des filtres (page, limit, construction de l'objet filter Mongoose, sort)
  const page = parseInt(filters.pageStr, 10) || 1;
  const limit = parseInt(filters.limitStr, 10) || 10;
  
  const filterQuery = {};
  if (filters.status) filterQuery.status = filters.status;
  if (filters.search) filterQuery.title = { $regex: filters.search, $options: 'i' };

  const sortQuery = {};
  if (filters.sortBy) {
    sortQuery[filters.sortBy] = filters.orderBy === 'desc' ? -1 : 1;
  } else {
    sortQuery.createdAt = -1;
  }

  // 2. Appel au repository qui retourne déjà { total, tickets }[cite: 16]
  const result = await ticketRepository.findAll(page, limit, filterQuery, sortQuery);
  
  // 3. On retourne l'objet intact au contrôleur
  return result;
};

export const getOne = async (id) => await ticketRepository.findById(id);

export const create = async (data) => {
  if (Array.isArray(data)) {
    try {
      return await ticketRepository.createMany(data);
    } catch (error) {
      if (error.name === 'BulkWriteError' && error.insertedDocs) {
        return { message: "Partial success", insertedCount: error.insertedDocs.length, errors: error.writeErrors };
      }
      throw error;
    }
  }
  return await ticketRepository.createOne(data);
};

export const update = async (data) => {
  if (data.ids && Array.isArray(data.ids)) {
    return await ticketRepository.updateMany(data.ids, data.updateData);
  }
  return await ticketRepository.updateOne(data.id, data.updateData);
};

export const remove = async (data) => {
  if (data.ids && Array.isArray(data.ids)) {
    return await ticketRepository.deleteMany(data.ids);
  }
  return await ticketRepository.deleteOne(data.id);
};

export const addNote = async (id, noteData) => {
  return await ticketRepository.addNote(id, noteData);
};