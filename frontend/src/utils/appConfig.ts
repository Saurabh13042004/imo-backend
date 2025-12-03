// App configuration - all local, no backend calls
interface AppConfig {
  showOnboarding: boolean;
  appName: string;
  onboardingSteps: {
    welcome: boolean;
    pricing: boolean;
    plans: boolean;
  };
}

// Default configuration
const defaultConfig: AppConfig = {
  showOnboarding: false,
  appName: "IMO",
  onboardingSteps: {
    welcome: true,
    pricing: true,
    plans: true,
  },
};

export async function getAppConfig(): Promise<AppConfig> {
  return defaultConfig;
}

export { type AppConfig, defaultConfig };