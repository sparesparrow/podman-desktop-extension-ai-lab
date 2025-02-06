declare module '@podman-desktop/api' {
  export interface ContainerProviderConnection {
    name: string;
  }

  export interface QuickPickItem {
    label: string;
    description?: string;
  }

  export interface TelemetryLogger {
    logUsage(event: string, data?: Record<string, any>): void;
    logError(event: string, data?: Record<string, any>): void;
  }

  export const window: {
    showWarningMessage(message: string, ...choices: string[]): Promise<string | undefined>;
    showErrorMessage(message: string): Promise<string | undefined>;
    showQuickPick<T>(items: T[], options: { placeHolder?: string }): Promise<T | undefined>;
  };

  export const env: {
    openExternal(uri: Uri): Promise<boolean>;
    clipboard: { writeText(text: string): Promise<void> };
  };

  export class Uri {
    static parse(input: string): Uri;
    with(options: { scheme?: string; authority?: string }): Uri;
  }
} 