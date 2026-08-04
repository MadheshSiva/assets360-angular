import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/**
 * Small "add new" / "edit selected" icon pair placed next to a dropdown whose options come
 * from a Master Management page. Clicking either icon navigates to that master page (carrying
 * a return path so the master page can send the user back here once they're done) and asks it
 * to open its Create or Edit popup directly, via the `linkAction`/`linkValue`/`linkReturn`
 * query params that master-management pages read on init.
 */
@Component({
  standalone: true,
  selector: 'app-master-link-icons',
  imports: [CommonModule],
  templateUrl: './master-link-icons.html',
  styleUrls: ['./master-link-icons.css']
})
export class MasterLinkIcons {
  @Input() masterPath!: string;
  @Input() currentValue = '';

  constructor(private router: Router) {}

  addNew(): void {
    this.router.navigate([this.masterPath], {
      queryParams: { linkAction: 'create', linkReturn: this.router.url.split('?')[0] }
    });
  }

  editSelected(): void {
    if (!this.currentValue) return;
    this.router.navigate([this.masterPath], {
      queryParams: {
        linkAction: 'edit',
        linkValue: this.currentValue,
        linkReturn: this.router.url.split('?')[0]
      }
    });
  }
}
