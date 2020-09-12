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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BaseDialog } from '@shared/base/base-dialog';
import { BaseUpdateCrud } from '@shared/base/base-update-crud';
import { Role, User } from '@shared/models';
import { ContactType } from '@shared/models/contact-type';
import { UsersPermission } from '@shared/models/permissions';
import { DialogService } from '@shared/services/dialog.service';
import { ToastService } from '@shared/services/toast.service';
import { slideInUp } from 'ng-animate';
import { NgxPermissionsService } from 'ngx-permissions';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { filter } from 'rxjs/operators';
import { GlobalSettingsService } from 'src/app/core/services/global-settings.service';
import { StaticService } from 'src/app/core/services/static.service';
import { UsersStorageService } from '../users-storage.service';
import { UsersService } from '../users.service';
import { ConfirmModalComponent } from './../../../shared/modals/confirm-modal/confirm-modal.component';

@UntilDestroy()
@Component({
  selector: 'app-show',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss'],
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
export class ShowComponent extends BaseUpdateCrud<User>
  implements BaseDialog, OnInit {
  readonly permission = UsersPermission.permissions;
  isCreate: boolean;
  isCollapsed = true;
  emailResended: boolean;
  contacts: ContactType[] = [];

  constructor(
    protected loaderService: NgxUiLoaderService,
    protected crudService: UsersService,
    protected storage: UsersStorageService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected fb: FormBuilder,
    protected toastService: ToastService,
    protected dialog: DialogService,
    private el: ElementRef,
    private staticService: StaticService,
    protected cd: ChangeDetectorRef,
    private globalSettingsService: GlobalSettingsService,
    private modal: NgbModal,
    private permissionsService: NgxPermissionsService
  ) {
    super(
      loaderService,
      crudService,
      storage,
      router,
      route,
      fb,
      toastService,
      cd,
      dialog
    );
  }

  ngOnInit() {
    this.globalSettingsService.contactTypes$
      .pipe(untilDestroyed(this))
      .subscribe(e => {
        if (e) {
          this.contacts = e;
          this.getItem(this.id);
        }
      });
    this.crudService.isLoading$
      .pipe(filter(res => res && res.id === this.loaderId))
      .subscribe(res => {
        this.isLoading = res.isLoading;
        this.cd.detectChanges();
      });
  }

  get roles(): Role[] {
    return this.staticService.static.roles;
  }

  initForm() {
    this.permissionsService.hasPermission(this.permission.update).then(res => {
      let controls = [];
      controls = this.contacts.map(c => this.createContactItem(c, res));
      this.form = this.fb.group({
        id: [this.item.id],
        name: [{ value: this.item.name, disabled: !res }, Validators.required],
        email: [
          { value: this.item.email, disabled: true },
          [Validators.required, Validators.email],
        ],
        roles: [
          { value: this.item.roles ? this.item.roles : null, disabled: !res },
        ],
        contacts: new FormArray(controls),
        phone: [{ value: null, disabled: !res }],
      });
      this.cd.detectChanges();
    });
  }

  subscribeFormEvents() {}

  generateRequestData(value) {
    const contacts = [];
    const contacts_added = [];
    const contacts_deleted = [];

    value.contacts.forEach(el => {
      // empty contact
      if (el.contact === null) {
        return;
      }
      // removed contact
      if (el.contact === '') {
        contacts_deleted.push(el);
        // changed contact
      } else {
        const compare = this.item.contacts.filter(
          e => e.type.name === el.type.name
        );
        if (compare.length === 0) {
          contacts_added.push(el);
        } else {
          contacts.push(el);
        }
      }
    });
    const result = {
      ...value,
      contacts,
      contacts_added,
      contacts_deleted,
    };
    return result;
  }

  goBack() {
    this.close();
  }

  resend() {
    if (this.emailResended) {
      return;
    }
    this.emailResended = true;
    this.isLoading = true;
    this.crudService.resend(this.item, { id: this.loaderId }).subscribe(() => {
      this.toastService.success('Готово');
      this.cd.detectChanges();
    });
  }

  private createContactItem(item: ContactType, isDisabled: boolean) {
    let val = null;
    let id = null;
    this.item.contacts.forEach(el => {
      if (el.type.id === item.id) {
        val = el.contact;
        id = el.id;
      }
    });

    return this.fb.group({
      id,
      name: item.name,
      type: {
        ...item,
      },
      contact: [{ value: val, disabled: !isDisabled }],
    });
  }

  deactivateUser() {
    const modalRef = this.modal.open(ConfirmModalComponent);

    modalRef.result.then(
      () => {
        this.crudService
          .deleteItem(this.item.id, { id: this.loaderId })
          .subscribe(() => {
            this.getItem(this.id);
            this.cd.detectChanges();
            this.toastService.success('Готово');
          });
      },
      () => {}
    );
  }

  activateUser() {
    const modalRef = this.modal.open(ConfirmModalComponent);
    modalRef.result.then(
      () => {
        this.crudService
          .patchItem({ is_active: true, id: this.item.id }, null, {
            id: this.loaderId,
          })
          .subscribe(() => {
            this.cd.detectChanges();
            this.toastService.success('Готово');
          });
      },
      () => {}
    );
  }

  deleteUser() {
    const modalRef = this.modal.open(ConfirmModalComponent);
    (modalRef.componentInstance as ConfirmModalComponent).title =
      'Удалить пользователя?';
    (modalRef.componentInstance as ConfirmModalComponent).buttonText =
      'Удалить';
    (modalRef.componentInstance as ConfirmModalComponent).buttonClass =
      'btn btn-red';

    modalRef.result.then(
      () => {
        this.crudService
          .deleteItem(this.item.id, { id: this.loaderId }, { force: true })
          .subscribe(() => {
            this.toastService.success('Готово');
            this.goBack();
          });
      },
      () => {}
    );
  }
}
