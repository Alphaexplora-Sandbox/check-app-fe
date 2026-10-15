import { SERVICE_NAME } from '../../src/index';

describe('check-app-frontend', () => {
  it('should export SERVICE_NAME', () => {
    expect(SERVICE_NAME).toBe('check-app-frontend');
  });
});