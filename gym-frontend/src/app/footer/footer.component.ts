import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="app-footer">
      <small>&copy; 2026 Gym App</small>
    </footer>
  `,
  styles: [ `:host { display:block; padding:1rem; text-align:center; color:#666 }` ]
})
export class FooterComponent { }
