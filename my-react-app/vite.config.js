import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/predict': {  // Proxy requests to /predict to your Flask backend
                target: 'http://localhost:5173',  // Replace with your Flask backend URL
                changeOrigin: true, // Required for cross-origin requests
            },
            // Add more proxy entries if you have other API endpoints
        }
    }
});