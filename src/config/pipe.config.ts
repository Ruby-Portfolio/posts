import { validationPipe } from '../pipe/validation.pipe';

export const pipeConfig = (app) => {
  validationPipe(app);
};
