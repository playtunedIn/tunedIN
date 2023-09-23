import { describe, expect, it } from 'vitest';
import { getCookie } from '../auth';

const cookieName = 'TUNEDIN_TOKEN';

describe('auth', () => {
  describe('getCookie', () => {
    it('should grab cookie out of cookie string correctly', () => {
      const res = getCookie('TUNEDIN_TOKEN=test;', cookieName);
      expect(res).toBe('test');
    });
    it('should return undefined when cookie does not exist', () => {
      const res = getCookie('TUNEDIN_TOKEN_FAKE=test;', cookieName);
      expect(res).toBe(undefined);
    });
    it('should handle multiple cookies being present', () => {
      const res = getCookie('OTHER_COOKIE=summat;TUNEDIN_TOKEN=test;ANOTHER_ONE=fake;', cookieName);
      expect(res).toBe('test');
    });
  });
});
