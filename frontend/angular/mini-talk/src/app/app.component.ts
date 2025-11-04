import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './chat/chat.component';
import { LoginComponent } from './login/login.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LoginComponent, ChatComponent],
  template: `
    <ng-container *ngIf="loggedIn; else login">
      <app-chat></app-chat>
    </ng-container>

    <ng-template #login>
      <app-login></app-login>
    </ng-template>
  `,
})
export class AppComponent {
  loggedIn = !!localStorage.getItem('chat_pseudo');

  constructor() {
    window.addEventListener('chat:loggedin', () => {
      this.loggedIn = true;
    });
    window.addEventListener('chat:logout', () => {
      this.loggedIn = false;
    });
  }
}
