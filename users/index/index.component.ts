import { transition, trigger, useAnimation } from '@angular/animations';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ControlScheme } from '@shared/base/base-filters';
import { BaseIndexCrud } from '@shared/base/base-index-crud';
import { User } from '@shared/models';
import { UsersPermission } from '@shared/models/permissions';
import { DialogService } from '@shared/services/dialog.service';
import { slideInUp } from 'ng-animate';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { finalize } from 'rxjs/operators';
import { RouteEmitterService } from 'src/app/core/services/route-emitter.service';
import { StaticService } from 'src/app/core/services/static.service';
import { CreateComponent } from '../create/create.component';
import { ShowComponent } from '../show/show.component';
import { UsersStorageService } from '../users-storage.service';
import { UsersService } from '../users.service';

@UntilDestroy()
@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
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
export class IndexComponent extends BaseIndexCrud<User> implements OnInit {
  readonly permission = UsersPermission.permissions;
  isShow: boolean;
  isCreateMode: boolean;
  controlsScheme: ControlScheme[] = [
    {
      name: 'search',
      multiple: false,
      type: 'search',
      placeholder: 'Поиск...',
      title: 'Поиск',
    },
    {
      type: 'select',
      name: 'role_ids',
      multiple: true,
      placeholder: 'Группа',
      multipleTitle: 'Групп',
      title: 'Группа',
      items: null,
      bindLabel: 'display_name',
      bindValue: 'id',
    },
    // {
    //   type: 'customSelect',
    //   name: 'company_ids',
    //   customSelectData: {
    //     modalTitle: 'Добавить контрагента',
    //     multipleTitle: 'Контрагентов',
    //     singleTitle: 'Контрагент',
    //     key: 'company_ids',
    //     url: '/companies',
    //   },
    // },
  ];

  constructor(
    private dialog: DialogService,
    protected loaderService: NgxUiLoaderService,
    protected crudService: UsersService,
    protected storage: UsersStorageService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected cd: ChangeDetectorRef,
    private el: ElementRef,
    private staticService: StaticService,
    private routeEmitter: RouteEmitterService
  ) {
    super(loaderService, crudService, storage, router, route, cd);
  }

  onActivate(flag) {
    this.isShow = flag;
  }

  ngOnInit() {
    super.ngOnInit();
    this.routeEmitter.navigationEnd$.pipe(untilDestroyed(this)).subscribe(e => {
      if (this.route.firstChild) {
        this.dialog
          .open(ShowComponent, null, {
            id: this.route.firstChild.snapshot.params.id,
          })
          .pipe(
            untilDestroyed(this),
            finalize(() => {
              this.goBack();
            })
          )
          .subscribe();
        this.cd.detectChanges();
      }
    });

    this.staticService.static$.pipe(untilDestroyed(this)).subscribe(res => {
      if (res) {
        this.controlsScheme.forEach(el => {
          if (el.name === 'role_ids') {
            el.items = res.roles;
            this.cd.detectChanges();
          }
        });
      }
    });
  }

  create() {
    this.isCreateMode = true;
    this.dialog.open(CreateComponent, null).subscribe(res => {
      this.cd.detectChanges();
      this.cd.markForCheck();
    });
  }

  goBack() {
    this.router.navigate(['..'], {
      relativeTo: this.route.firstChild ? this.route.firstChild : this.route,
      queryParamsHandling: 'merge',
    });
    this.cd.detectChanges();
  }
}
