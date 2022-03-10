export const generateSlug = (text: string): string => {
  return text
    ? text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
    : '';
};
