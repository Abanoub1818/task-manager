import { Component } from '@angular/core';
import { MOCK_USERS } from '../../core/services/mock-users';

@Component({
  selector: 'app-team',
  standalone: true,
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss',
})
export class TeamComponent {
  readonly users = MOCK_USERS;
}
