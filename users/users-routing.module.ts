import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersPermission } from '@shared/models/permissions/users-permission';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { IndexComponent } from './index/index.component';
import { UsersComponent } from './users.component';

const routes: Routes = [
  {
    path: '',
    component: UsersComponent,
    children: [
      {
        path: '',
        data: {
          permissions: {
            only: [UsersPermission.permissions.index],
            redirectTo: 'error',
          },
        },
        canActivate: [NgxPermissionsGuard],
        component: IndexComponent,
        children: [
          {
            path: ':id',
            data: {
              permissions: {
                only: [UsersPermission.permissions.index],
                redirectTo: 'error',
              },
            },
            canActivate: [NgxPermissionsGuard],
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
