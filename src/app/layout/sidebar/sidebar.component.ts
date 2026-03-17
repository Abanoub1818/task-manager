import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  readonly open = input(false);
  readonly newTask = output<void>();
  readonly close = output<void>();

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'pi-objects-column', route: '/dashboard' },
    { label: 'Tasks', icon: 'pi-check-square', route: '/tasks' },
    { label: 'Calendar', icon: 'pi-calendar', route: '/calendar' },
    { label: 'Analytics', icon: 'pi-chart-bar', route: '/analytics' },
    { label: 'Team', icon: 'pi-users', route: '/team' },
    { label: 'Settings', icon: 'pi-cog', route: '/settings' },
  ];
}
