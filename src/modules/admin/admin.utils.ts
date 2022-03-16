import { ActionRequest } from 'adminjs';

export const isPOSTMethod = ({ method }: ActionRequest): boolean => method.toLowerCase() === 'post';
export const isGETMethod = ({ method }: ActionRequest): boolean => method.toLowerCase() === 'get';
