import { SLA_HOURS } from '../config/constants.js';

export const calcDueAt = (priority, from = new Date()) =>
  new Date(from.getTime() + SLA_HOURS[priority] * 60 * 60 * 1000);
