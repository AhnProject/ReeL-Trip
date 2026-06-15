const variant = process.env.APP_VARIANT ?? "production";
const IS_DEV     = variant === "development";
const IS_STAGING = variant === "staging";

const appName = IS_DEV ? "ReeL-Trip (Dev)" : IS_STAGING ? "ReeL-Trip (Test)" : "ReeL-Trip";
const appId   = IS_DEV ? "com.reeltrip.app.dev" : IS_STAGING ? "com.reeltrip.app.staging" : "com.reeltrip.app";
const scheme  = IS_DEV ? "reeltrip-dev" : IS_STAGING ? "reeltrip-staging" : "reeltrip";

module.exports = {
  expo: {
    name:        appName,
    slug:        "reel-trip",
    version:     "1.0.0",
    orientation: "portrait",
    scheme,
    userInterfaceStyle: "automatic",
    ios: {
      supportsTablet:   true,
      bundleIdentifier: appId,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#ffffff",
      },
      package: appId,
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
