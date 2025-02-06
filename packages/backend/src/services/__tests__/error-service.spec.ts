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

import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { ErrorState } from '@shared/src/models/IError';
import { ErrorService } from '../error-service';
import type { Webview } from '@podman-desktop/api';

describe('ErrorService', () => {
  let errorService: ErrorService;
  let mockWebview: Webview;

  beforeEach(() => {
    mockWebview = {
      postMessage: vi.fn(),
    } as unknown as Webview;

    errorService = new ErrorService(mockWebview);
  });

  test('should store new errors', async () => {
    const error: Omit<ErrorState, 'id' | 'timestamp'> = {
      message: 'Test error',
      acknowledged: false,
      source: 'test',
    };

    const storedError = await errorService.createError(error);
    
    // Should have generated an ID and timestamp
    expect(storedError.id).toBeDefined();
    expect(storedError.timestamp).toBeDefined();
    expect(storedError.message).toBe(error.message);
    expect(storedError.acknowledged).toBe(false);

    // Should be in the list of errors
    const errors = await errorService.getErrors();
    expect(errors).toHaveLength(1);
    expect(errors[0]).toEqual(storedError);
  });

  test('should acknowledge errors', async () => {
    const error = await errorService.createError({
      message: 'Test error',
      acknowledged: false,
    });

    await errorService.acknowledgeError(error.id);
    
    const errors = await errorService.getErrors();
    expect(errors[0].acknowledged).toBe(true);
  });

  test('should broadcast error state changes', async () => {
    await errorService.createError({
      message: 'Test error',
      acknowledged: false,
    });

    expect(mockWebview.postMessage).toHaveBeenCalledWith({
      id: 'new-error-state',
      body: expect.arrayContaining([
        expect.objectContaining({
          message: 'Test error',
          acknowledged: false,
        }),
      ]),
    });
  });

  test('should cleanup acknowledged errors after timeout', async () => {
    vi.useFakeTimers();

    const error = await errorService.createError({
      message: 'Test error',
      acknowledged: false,
    });

    await errorService.acknowledgeError(error.id);
    
    // Fast forward past cleanup timeout
    vi.advanceTimersByTime(1000 * 60 * 60); // 1 hour

    const errors = await errorService.getErrors();
    expect(errors).toHaveLength(0);

    vi.useRealTimers();
  });
}); 