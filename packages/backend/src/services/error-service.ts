/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import type { Webview } from '@podman-desktop/api';
import type { ErrorState } from '@shared/src/models/IError';
import { Messages } from '@shared/Messages';
import { v4 as uuidv4 } from 'uuid';

const CLEANUP_INTERVAL = 1000 * 60 * 60; // 1 hour

export class ErrorService {
  private errors: ErrorState[] = [];
  private cleanupTimer?: NodeJS.Timeout;

  constructor(private readonly webview: Webview) {
    this.startCleanupTimer();
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupAcknowledgedErrors();
    }, CLEANUP_INTERVAL);
  }

  private async cleanupAcknowledgedErrors(): Promise<void> {
    const previousLength = this.errors.length;
    this.errors = this.errors.filter(error => !error.acknowledged);
    
    if (previousLength !== this.errors.length) {
      await this.broadcastErrors();
    }
  }

  private async broadcastErrors(): Promise<void> {
    await this.webview.postMessage({
      id: Messages.MSG_NEW_ERROR_STATE,
      body: this.errors,
    });
  }

  async createError(error: Omit<ErrorState, 'id' | 'timestamp'>): Promise<ErrorState> {
    const newError: ErrorState = {
      ...error,
      id: uuidv4(),
      timestamp: Date.now(),
    };

    this.errors.push(newError);
    await this.broadcastErrors();

    return newError;
  }

  async acknowledgeError(id: string): Promise<void> {
    const error = this.errors.find(e => e.id === id);
    if (error) {
      error.acknowledged = true;
      await this.broadcastErrors();
    }
  }

  async getErrors(): Promise<ErrorState[]> {
    return this.errors;
  }

  dispose(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }
} 