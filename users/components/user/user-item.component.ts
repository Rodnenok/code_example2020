import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { User } from '@shared/models';
import { UsersService } from '@modules/users/users.service';
import { BaseClassWithLoading } from '@shared/base/base-class-with-loading';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'app-user-item',
  templateUrl: './user-item.component.html',
  styleUrls: ['./user-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserItemComponent extends BaseClassWithLoading implements OnInit {
  @Input() user: User;
  emailResended: boolean;

  constructor(
    protected crudService: UsersService,
    protected loaderService: NgxUiLoaderService,
    protected toastService: ToastService,
    protected cd: ChangeDetectorRef
  ) {
    super(loaderService);
  }

  ngOnInit(): void {}

  resend() {
    if (this.emailResended) {
      return;
    }
    this.emailResended = true;
    this.crudService.resend(this.user, { id: this.loaderId }).subscribe(() => {
      this.toastService.success('Готово');
      this.cd.detectChanges();
    });
  }
}
