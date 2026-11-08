import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'generated/**',
      'src/generated/**',
      'coverage/**',
      'node_modules/**',
      'jest.*.config.cjs',
    ],
  },
  ...tseslint.configs.recommended,
  prettier,
);
