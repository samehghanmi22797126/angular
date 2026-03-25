import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  template: `
    <div class="not-found">
      <h3>404 - Page non trouvée</h3>
      <p>La page demandée est introuvable.</p>
    </div>
  `,
  styles: [ `:host { display:block; padding:1rem }` ]
})
export class NotFoundComponent { }
