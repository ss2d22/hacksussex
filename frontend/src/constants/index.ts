/**
 * base url for the backend
 * @author Sriram Sundar
 *
 * @type {string}
 */
export const BACKEND_URL: string = import.meta.env
  .VITE_BACKEND_BASE_URL as string;

/**
 * base url for the backend
 *@author Sriram Sundar
 *
 *  @type {string}
 */
export const SAMPLE_ROUTE = `${BACKEND_URL}/`;
