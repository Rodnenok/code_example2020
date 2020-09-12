import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { UserItemComponent } from './components/user/user-item.component';
import { CreateComponent } from './create/create.component';
import { IndexComponent } from './index/index.component';
import { ShowComponent } from './show/show.component';
import { UsersRoutingModule } from './users-routing.module';
import { UsersComponent } from './users.component';

@NgModule({
  declarations: [UsersComponent, IndexComponent, CreateComponent, ShowComponent, UserItemComponent],
  imports: [CommonModule, UsersRoutingModule, SharedModule],
})
export class UsersModule { }
