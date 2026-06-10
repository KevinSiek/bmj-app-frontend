import { execSync } from 'child_process';

export default async function globalSetup() {
  console.log('\n[Global Setup] Resetting and seeding backend database...');
  try {
    const backendPath = 'e:\\Kerja\\Kerja\\Bkawan\\PT_BerkatMegahJaya\\Repo\\backend\\bmj-app-backend\\BmjAppBackend';
    
    // Run artisan migrate:fresh --seed
    execSync('php artisan migrate:fresh --seed', { 
      cwd: backendPath, 
      stdio: 'inherit' 
    });
    console.log('[Global Setup] Database seeded successfully!\n');
  } catch (error) {
    console.error('[Global Setup] Failed to seed database:', error.message);
    throw error;
  }
}
