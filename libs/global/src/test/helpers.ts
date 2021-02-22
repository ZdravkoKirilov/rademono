export const breakTest = (message = 'This code shouldn`t be reached') => {
  throw new Error(message);
};
