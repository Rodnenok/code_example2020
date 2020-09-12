import { transition, trigger, useAnimation } from '@angular/animations';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
} from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseCreateCrud } from '@shared/base/base-create-crud';
import { Role, User } from '@shared/models';
import { ContactType } from '@shared/models/contact-type';
import { UsersPermission } from '@shared/models/permissions';
import { DialogService } from '@shared/services/dialog.service';
import { ToastService } from '@shared/services/toast.service';
import { slideInUp } from 'ng-animate';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { filter } from 'rxjs/operators';
import { GlobalSettingsService } from 'src/app/core/services/global-settings.service';
import { StaticService } from 'src/app/core/services/static.service';
import { UsersStorageService } from '../users-storage.service';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideInUp', [
      transition(
        ':enter',
        useAnimation(slideInUp, {
          params: { timing: 0.1 },
        })
      ),
    ]),
  ],
})
export class CreateComponent extends BaseCreateCrud<User> implements OnInit {
  readonly permission = UsersPermission.permissions;
  contacts: ContactType[];
  isCollapsed = true;

  constructor(
    protected loaderService: NgxUiLoaderService,
    protected crudService: UsersService,
    protected storage: UsersStorageService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected cd: ChangeDetectorRef,
    protected fb: FormBuilder,
    protected dialog: DialogService,
    protected toast: ToastService,
    private el: ElementRef,
    private staticService: StaticService,
    private globalSettingsService: GlobalSettingsService
  ) {
    super(loaderService, crudService, storage, router, fb, cd, dialog, toast);
  }

  get roles(): Role[] {
    return this.staticService.static.roles;
  }

  ngOnInit() {
    this.crudService.isLoading$
      .pipe(filter(res => res && res.id === this.loaderId))
      .subscribe(res => {
        this.isLoading = res.isLoading;
        this.cd.detectChanges();
      });
    this.globalSettingsService.contactTypes$.subscribe(e => {
      if (e) {
        this.contacts = e;
        this.initForm();
        this.subscribeFormEvents();
      }
    });
  }

  initForm() {
    let controls = [];
    controls = this.contacts.map(c => this.createContactItem(c));
    this.form = this.fb.group({
      name: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      permissions: [[]],
      roles: [null],
      contacts: new FormArray(controls),
    });
    this.cd.detectChanges();
  }
  subscribeFormEvents() {}

  generateRequestData(value) {
    const contacts = [];
    value.contacts.forEach(el => {
      // empty contact
      if (el.contact === null) {
        return;
      } else {
        contacts.push(el);
      }
    });
    const result = {
      ...value,
      contacts,
    };
    return result;
  }
  private createContactItem(item: ContactType) {
    return this.fb.group({
      name: item.name,
      type: {
        ...item,
      },
      contact: null,
    });
  }
}
