import { Injectable } from '@angular/core';
import { BaseStorage } from '@shared/base/base-storage';
import { User } from '@shared/models';

@Injectable({
  providedIn: 'root',
})
export class UsersStorageService extends BaseStorage<User> { }
