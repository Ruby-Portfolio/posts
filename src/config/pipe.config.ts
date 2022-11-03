import { validationPipe } from '../pipes/validation.pipe';

export const pipeConfig = (app) => {
  validationPipe(app);
};
