import { Before } from 'adminjs';

export const filterByIsDeleted: Before = async (request) => {
  const result = {
    ...request,
    query: {
      ...request.query,
    },
  };

  if (request.query['filters.isDeleted'] === 'true') {
    result.query['filters.isDeleted'] = true;
  } else {
    result.query['filters.isDeleted'] = false;
  }

  return result;
};
