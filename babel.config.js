// FILE: babel.config.js (Create this new file)

module.exports = function(api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
      plugins: [
        // This plugin is required by react-native-reanimated
        // and MUST be listed last.
        'react-native-reanimated/plugin',
      ],
    };
  };