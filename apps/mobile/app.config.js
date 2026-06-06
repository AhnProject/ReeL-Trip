const IS_DEV = process.env.APP_VARIANT === "development";

module.exports = {
  expo: {
    name:        IS_DEV ? "ReeL-Trip (Dev)" : "ReeL-Trip",
    slug:        "reel-trip",
    version:     "1.0.0",
    orientation: "portrait",
    scheme:      IS_DEV ? "reeltrip-dev" : "reeltrip",
    userInterfaceStyle: "automatic",
    ios: {
      supportsTablet:   true,
      bundleIdentifier: IS_DEV ? "com.reeltrip.app.dev" : "com.reeltrip.app",
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#ffffff",
      },
      package: IS_DEV ? "com.reeltrip.app.dev" : "com.reeltrip.app",
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      [
        "expo-share-intent",
        {
          iosActivationRules: {
            NSExtensionActivationSupportsWebURLWithMaxCount: 1,
            NSExtensionActivationSupportsWebPageWithMaxCount: 1,
          },
          androidIntentFilters: ["text/*"],
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "0efa14e8-3c25-4525-bbf9-d966d08f802c",
      },
    },
  },
};
