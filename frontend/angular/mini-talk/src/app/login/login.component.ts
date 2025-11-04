import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ChatService } from '../services/chat.service.js';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  connectionStatus: string = 'disconnected';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private chatService: ChatService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      pseudo: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(20),
        ],
      ],
    });
  }

  ngOnInit(): void {
    // Listen to connection events
    this.chatService.onConnect().subscribe(() => {
      this.connectionStatus = 'connected';
    });

    this.chatService.onDisconnect().subscribe((reason) => {
      this.connectionStatus = 'disconnected';
      this.errorMessage = `Disconnected: ${reason}`;
    });

    this.chatService.onConnectError().subscribe((error) => {
      this.connectionStatus = 'disconnected';
      this.errorMessage = `Connection error: ${error.message}`;
    });

    // Listen to authentication events
    this.chatService.onAuthSuccess().subscribe((data) => {
      this.isLoading = false;
      window.dispatchEvent(new CustomEvent('chat:loggedin'));
    });

    this.chatService.onAuthError().subscribe((error) => {
      this.isLoading = false;
      this.errorMessage = error;
    });

    this.chatService.onAuthRequire().subscribe(() => {
      // Server is ready for authentication
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      const pseudo = this.loginForm.get('pseudo')?.value;
      this.chatService.setPseudo(pseudo);
    }
  }

  getStatusColor(): string {
    switch (this.connectionStatus) {
      case 'connected':
        return '#4CAF50';
      case 'connecting':
        return '#FFC107';
      default:
        return '#F44336';
    }
  }

  getStatusText(): string {
    switch (this.connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      default:
        return 'Disconnected';
    }
  }
}
