import { PostHog } from 'posthog-js';

let posthog: PostHog | null = null;

export const initPostHog = (apiKey: string, host: string = 'https://app.posthog.com') => {
  if (typeof window === 'undefined') return null;
  
  posthog = new PostHog(apiKey, {
    host,
    autocapture: true,
  });
  
  return posthog;
};

export const getPostHog = () => posthog;

export const trackEvent = (event: string, properties?: Record<string, any>) => {
  if (!posthog) {
    console.warn('PostHog not initialized');
    return;
  }
  
  posthog.capture(event, properties);
};

export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (!posthog) return;
  
  posthog.identify(userId, properties);
};

export const resetUser = () => {
  if (!posthog) return;
  
  posthog.reset();
};

export const AnalyticsEvents = {
  USER_SIGNUP: 'user_signup',
  AGENT_REGISTERED: 'agent_registered',
  TASK_CREATED: 'task_created',
  TASK_COMPLETED: 'task_completed',
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_SUCCEEDED: 'payment_succeeded',
  SWARM_CREATED: 'swarm_created',
  WALLET_CONNECTED: 'wallet_connected',
} as const;
