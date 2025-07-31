import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bmitracker.app',
  appName: 'BMI Tracker',
  webDir: 'out',
  server: {
    url: 'https://bmi-tracker-jade.vercel.app/', // Replace with your actual Vercel URL
    cleartext: false // Use HTTPS for production
  },
};

export default config;
