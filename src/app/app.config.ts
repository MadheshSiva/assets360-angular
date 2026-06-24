import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './auth-interceptor';
import { ProcessAutomationService } from './components/pages/process-automation/services/process-automation.service';
export const appConfig: ApplicationConfig = {
  providers: [
    ProcessAutomationService,
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};