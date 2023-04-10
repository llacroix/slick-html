const config = {
    "verbose": true,
    // "roots": ["<rootDir>/src/", "<rootDir>/tests/"],
    // "modulePaths": ["<rootDir>/src"],
    "moduleNameMapper": {
      "slick-html/(.*)": "<rootDir>/src/$1",
    },

    "extensionsToTreatAsEsm": ['.ts'],
    
    "collectCoverage": true,

    "transform": {
      '^.+\\.(ts|tsx)?$': [
        'ts-jest', {
          "tsconfig": "<rootDir>/tsconfig.json",
          "useESM": true
        }
      ],
    },

    "globals": {
      //"ts-jest": {
        //"tsconfig": "<rootDir>/tsconfig.json"
      //}
    },

    "preset": "ts-jest"
}

export default config
