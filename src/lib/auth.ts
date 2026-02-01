/**
 * Auth entry point — uses AWS Cognito (replaces Firebase).
 * Import apiAuthService and User from here so consumers don't depend on a specific implementation.
 */
export { apiAuthService, type User } from './auth-cognito';
