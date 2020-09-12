import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseCrudService, LoadingData } from '@shared/base/base-crud-service';
import { httpErrorResponceHandler } from '@shared/heplers';
import { Pagination, User } from '@shared/models';
import { Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { UserService } from 'src/app/core/services/user.service';
import { UsersStorageService } from './users-storage.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService extends BaseCrudService<User> {
  url = '/users';
  model = User;

  constructor(
    protected http: HttpClient,
    protected storage: UsersStorageService,
    private userService: UserService
  ) {
    super(http, storage);
  }

  getItems(
    params?: HttpParams,
    loadingData: Partial<LoadingData> = {}
  ): Observable<Pagination<User>> {
    if (params) {
      // params = params.append(
      //   'exclude_ids[]',
      //   this.userService.user.id.toString()
      // );
    }
    return super.getItems(params, loadingData);
  }

  resend(item: User, loadingData: Partial<LoadingData> = {}) {
    this.loadingData = {
      ...this.getDefaultLoadingData('show', true),
      ...loadingData,
    } as LoadingData;

    return this.http
      .post<void>(`/verify/email/resend`, { email: item.email })
      .pipe(
        catchError(err => {
          return httpErrorResponceHandler(err);
        }),
        finalize(() => {
          this.loadingData = {
            ...loadingData,
            isLoading: false,
          } as LoadingData;
        })
      );
  }
}
