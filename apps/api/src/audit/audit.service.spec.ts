import { AuditService } from './audit.service';

describe('AuditService', () => {
  const create = jest.fn((entry: unknown) => entry);
  const save = jest.fn();
  const repo = { create, save };
  const service = new AuditService(repo as never);

  beforeEach(() => {
    create.mockClear();
    save.mockClear();
  });

  it('mencatat aksi anonim (actor_id null) tanpa gagal — regresi LOGIN_FAILED 500', async () => {
    save.mockResolvedValue({ id: 'audit-1' });

    const entry = await service.log(null, 'LOGIN_FAILED', 'users:unknown');

    expect(entry).toBeDefined();
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        actor_id: null,
        action: 'LOGIN_FAILED',
        target_resource: 'users:unknown',
      }),
    );
  });

  it('mencatat aksi dengan actor dan target yang benar', async () => {
    save.mockResolvedValue({ id: 'audit-2' });

    await service.log('user-123', 'APPROVE_MANUAL_PAYMENT', 'payments:p-1');

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        actor_id: 'user-123',
        action: 'APPROVE_MANUAL_PAYMENT',
        target_resource: 'payments:p-1',
      }),
    );
  });
});
