export default {
  extends: ['@commitlint/config-conventional'],

  rules: {
    // ========== TYPE (strict) ==========
    'type-enum': [
      2,
      'always',
      [
        'feat',     // ✨ New feature
        'fix',      // 🐛 Bug fix
        'hotfix',   // 🚑 Critical hotfix
        'docs',     // 📚 Documentation only
        'style',    // 💄 Formatting (no code impact)
        'refactor', // ♻️  Refactoring
        'perf',     // ⚡ Performance
        'test',     // ✅ Tests
        'build',    // 📦 Build/dependencies
        'ci',       // 👷 CI/CD
        'chore',    // 🔧 Maintenance
        'revert'    // ⏪ Revert commit
      ]
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],

    // ========== SCOPE (mandatory but flexible) ==========
    'scope-empty': [2, 'never'], // Mandatory
    'scope-case': [2, 'always', 'lower-case'],
    'scope-min-length': [2, 'always', 2],
    'scope-max-length': [2, 'always', 25],

    // ========== SUBJECT ==========
    'subject-case': [
      2,
      'never',
      ['upper-case', 'pascal-case', 'start-case']
    ],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-min-length': [2, 'always', 10], // Force clear description

    // ========== HEADER ==========
    'header-max-length': [2, 'always', 100],

    // ========== BODY & FOOTER (recommended) ==========
    'body-leading-blank': [1, 'always'],
    'footer-leading-blank': [1, 'always']
  }
};
