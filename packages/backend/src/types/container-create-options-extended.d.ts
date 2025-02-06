declare module '@podman-desktop/api' {
  export interface ContainerCreateOptions {
    readinessProbe?: {
      exec?: {
        command: string[];
      };
    };
  }
} 