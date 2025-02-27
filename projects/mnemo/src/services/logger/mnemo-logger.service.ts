/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { SnackBarService, SnackBarType } from '@tl-platform/core';

type ConsoleKeyType = 'error' | 'info' | 'log' | 'warn' | 'table';

@Injectable()
export class MnemoLoggerService {
  private readonly snackBar = inject(SnackBarService);
  private readonly translocoService = inject(TranslocoService);

  public messageHandlerType: 'snackBar' | 'console' | 'snackBar+console' | 'none' = 'snackBar';
  public errorHandlerType: 'snackBar' | 'console' | 'snackBar+console' | 'none' = 'snackBar+console';

  public catchMessage(
    type: SnackBarType,
    message: unknown,
    description: object | string = null,
    needTranslate: boolean = true,
  ): void {
    if (needTranslate) {
      message = this.translocoService.translate<string>(message as string);
    }
    switch (this.messageHandlerType) {
      case 'console':
        this.logInConsole(type, message, description);
        break;
      case 'snackBar':
        this.logInSnackBar(type, message, description);
        break;
      case 'snackBar+console':
        this.logInSnackBar(type, message, description);
        this.logInConsole(type, message, description);
        break;
      default:
        break;
    }
  }

  public catchErrorMessage(
    type: SnackBarType,
    message: unknown,
    description: object | string | unknown = null,
    needTranslate: boolean = true,
  ): void {
    if (needTranslate) {
      message = this.translocoService.translate<string>(message as string);
    }
    switch (this.errorHandlerType) {
      case 'console':
        this.logInConsole(type, message, description);
        break;
      case 'snackBar':
        this.logInSnackBar(type, message, description);
        break;
      case 'snackBar+console':
        this.logInSnackBar(type, message, description);
        this.logInConsole(type, message, description);
        break;
      default:
        break;
    }
  }

  public logInConsole(
    type: SnackBarType = 'message',
    message: unknown = null,
    description: object | string | unknown = null,
  ): void {
    let consoleType: ConsoleKeyType;
    if (type === 'message' || type === 'ok') {
      consoleType = 'log';
    } else if (type === 'warning') {
      consoleType = 'warn';
    } else {
      consoleType = type;
    }
    if (description) {
      console[consoleType](message, ':  ', description);
    } else {
      console[consoleType](message);
    }
  }

  public logInSnackBar(
    type: SnackBarType = 'message',
    message: unknown = null,
    description: object | string | unknown = null,
  ): void {
    if (description) {
      this.snackBar.openSnackBar(`${message.toString()}:  ${description.toString()}`, type);
    } else {
      this.snackBar.openSnackBar(message.toString(), type);
    }
  }
}
